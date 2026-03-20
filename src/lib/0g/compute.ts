/**
 * 0G Compute Network inference wrapper.
 *
 * Two modes:
 * 1. DIRECT API (preferred) — Uses 0G's OpenAI-compatible HTTP endpoint.
 *    Set OG_COMPUTE_API_URL and OG_COMPUTE_API_KEY in .env.local.
 *    No broker SDK needed, no OOM, no provider discovery.
 *
 * 2. BROKER SDK (legacy fallback) — Uses @0glabs/0g-serving-broker for
 *    signed inference through a specific provider address.
 *    Set OG_COMPUTE_PROVIDER_ADDRESS in .env.local.
 *
 * Server-side only. Server wallet funds compute.
 */

import {
  ZEROVIZA_SYSTEM_PROMPT,
  MODEL_ID,
  INFERENCE_CONFIG,
} from "@/lib/zeroviza/prompt";
import type { InferenceMessage } from "@/types/chat";

// ─── Direct API mode ─────────────────────────────────────────────────────────

/**
 * Call 0G Compute Network via its OpenAI-compatible REST API.
 * This is the recommended approach — lightweight, no SDK dependency for inference.
 *
 * Env vars:
 *   OG_COMPUTE_API_URL  — e.g. https://compute-network-1.integratenetwork.work/v1
 *   OG_COMPUTE_API_KEY  — e.g. app-sk-xxx (from 0G dashboard)
 */
async function callDirectAPI(
  messages: InferenceMessage[],
  modelId: string
): Promise<{ content: string }> {
  const apiUrl = process.env.OG_COMPUTE_API_URL!;
  const apiKey = process.env.OG_COMPUTE_API_KEY!;

  const endpoint = `${apiUrl.replace(/\/+$/, "")}/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: INFERENCE_CONFIG.maxTokens,
      temperature: INFERENCE_CONFIG.temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`0G Compute API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("0G Compute returned empty response");

  return { content };
}

// ─── Broker SDK mode (legacy) ────────────────────────────────────────────────

import { ethers } from "ethers";

type ZGBroker = Awaited<ReturnType<typeof initBroker>>;
let _brokerPromise: Promise<ZGBroker> | null = null;

async function initBroker() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createZGComputeNetworkBroker } = require("@0glabs/0g-serving-broker") as typeof import("@0glabs/0g-serving-broker");

  // Use dedicated compute RPC (mainnet) — separate from testnet used for contracts/storage
  const rpcUrl = process.env.OG_COMPUTE_RPC_URL ?? process.env.NEXT_PUBLIC_0G_RPC_URL;
  const privateKey = process.env.OG_SERVER_PRIVATE_KEY;
  if (!rpcUrl || !privateKey) {
    throw new Error("Missing env vars: OG_COMPUTE_RPC_URL, OG_SERVER_PRIVATE_KEY");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider) as unknown as Parameters<typeof createZGComputeNetworkBroker>[0];
  return createZGComputeNetworkBroker(wallet);
}

function getBroker() {
  if (!_brokerPromise) {
    _brokerPromise = initBroker().catch((err) => {
      _brokerPromise = null;
      throw err;
    });
  }
  return _brokerPromise;
}

async function callBrokerAPI(
  messages: InferenceMessage[],
  modelId: string
): Promise<{ content: string; providerAddress: string }> {
  const providerAddress = process.env.OG_COMPUTE_PROVIDER_ADDRESS;
  if (!providerAddress) {
    throw new Error("OG_COMPUTE_PROVIDER_ADDRESS env var not set");
  }

  const broker = await getBroker();

  const requestBody = {
    model: modelId,
    messages,
    max_tokens: INFERENCE_CONFIG.maxTokens,
    temperature: INFERENCE_CONFIG.temperature,
  };

  const headers = await broker.inference.getRequestHeaders(
    providerAddress,
    JSON.stringify(requestBody)
  );

  const metadata = await broker.inference.getServiceMetadata(providerAddress);
  // metadata.endpoint may already include /v1/proxy — just append /chat/completions
  const baseUrl = metadata.endpoint.replace(/\/+$/, "");
  const endpoint = `${baseUrl}/chat/completions`;

  console.log(`[compute/broker] Calling: ${endpoint} with model: ${modelId}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers as unknown as Record<string, string>),
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Broker inference failed ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const chatId = response.headers.get("ZG-Res-Key") ?? undefined;
  await broker.inference.processResponse(
    providerAddress,
    chatId,
    data.choices[0]?.message?.content
  );

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Broker returned empty response");

  return { content, providerAddress };
}

// ─── Unified inference function ──────────────────────────────────────────────

export interface ZeroVizaResponse {
  content: string;
  providerAddress: string;
}

/**
 * Detect which mode to use (priority order):
 * 1. direct  — OG_COMPUTE_API_URL + OG_COMPUTE_API_KEY (0G direct or any OpenAI-compat API)
 * 2. broker  — OG_COMPUTE_PROVIDER_ADDRESS via broker SDK (needs mainnet OG tokens)
 * 3. groq    — GROQ_API_KEY fallback (free at console.groq.com, same OpenAI-compat format)
 */
function getMode(): "direct" | "broker" | "groq" {
  if (process.env.OG_COMPUTE_API_URL && process.env.OG_COMPUTE_API_KEY) {
    return "direct";
  }
  if (process.env.OG_COMPUTE_PROVIDER_ADDRESS) {
    return "broker";
  }
  if (process.env.GROQ_API_KEY) {
    return "groq";
  }
  throw new Error(
    "No AI inference configured. Options:\n" +
    "1. 0G Compute broker: set OG_COMPUTE_PROVIDER_ADDRESS + fund mainnet wallet with OG tokens\n" +
    "2. 0G Compute direct: set OG_COMPUTE_API_URL + OG_COMPUTE_API_KEY\n" +
    "3. Groq fallback (free): set GROQ_API_KEY from console.groq.com"
  );
}

async function callGroqAPI(
  messages: InferenceMessage[]
): Promise<{ content: string }> {
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  // Best Groq model for legal reasoning — fast and capable
  const groqModel = "llama-3.3-70b-versatile";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages,
      max_tokens: INFERENCE_CONFIG.maxTokens,
      temperature: INFERENCE_CONFIG.temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty response");
  return { content };
}

export async function sendToZeroViza(
  userMessage: string,
  contextHistory: InferenceMessage[] = []
): Promise<ZeroVizaResponse> {
  const mode = getMode();

  // Build message array
  const recentContext = contextHistory.slice(-INFERENCE_CONFIG.contextWindow);
  const messages: InferenceMessage[] = [
    { role: "system", content: ZEROVIZA_SYSTEM_PROMPT },
    ...recentContext,
    { role: "user", content: userMessage },
  ];

  if (mode === "direct") {
    console.log(`[compute/direct] Sending to 0G Compute API (model: ${MODEL_ID})`);
    const result = await callDirectAPI(messages, MODEL_ID);
    return { content: result.content, providerAddress: "0g-compute-direct-api" };
  }

  if (mode === "groq") {
    console.log(`[compute/groq] Using Groq fallback (llama-3.3-70b-versatile)`);
    const result = await callGroqAPI(messages);
    return { content: result.content, providerAddress: "groq-fallback" };
  }

  // Broker mode — requires mainnet OG tokens pre-deposited
  // Fund your server wallet at: https://hub.0g.ai → Bridge → then run /api/setup
  console.log(`[compute/broker] Sending via 0G broker SDK (model: ${MODEL_ID})`);
  return callBrokerAPI(messages, MODEL_ID);
}

// ─── Setup helpers (broker only) ─────────────────────────────────────────────

export async function acknowledgeProvider(): Promise<void> {
  const providerAddress = process.env.OG_COMPUTE_PROVIDER_ADDRESS;
  if (!providerAddress) throw new Error("OG_COMPUTE_PROVIDER_ADDRESS not set");

  const broker = await getBroker();
  await broker.inference.acknowledgeProviderSigner(providerAddress);
}

export async function listServices(): Promise<Record<string, unknown>[]> {
  const broker = await getBroker();
  try {
    const services = await broker.inference.listService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (services ?? []).map((s: any) => ({
      provider: String(s.provider ?? s[0] ?? ""),
      name: String(s.name ?? s.model ?? ""),
      serviceType: String(s.serviceType ?? s[1] ?? ""),
      url: String(s.url ?? s[2] ?? ""),
      model: String(s.model ?? s[6] ?? ""),
    }));
  } catch (err) {
    console.error("[listServices]", err);
    return [];
  }
}
