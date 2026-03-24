import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { sendToZeroViza } from "@/lib/0g/compute";

// Allow up to 60s for AI inference + 0G storage
export const maxDuration = 60;
import {
  uploadHistory,
  downloadHistory,
} from "@/lib/0g/storage";
import { getStorageIndex, upsertStorageIndex } from "@/lib/db/client";
import { calculateStreak, createDefaultProfile } from "@/lib/zeroviza/streak";
import { uploadProfile, downloadProfile } from "@/lib/0g/storage";
import type { ChatMessage, InferenceMessage } from "@/types/chat";

const RequestSchema = z.object({
  message: z.string().min(1).max(4000),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});

/**
 * Persist history + profile to 0G Storage and update the on-chain index.
 * Runs after the response is sent so the user isn't blocked.
 */
async function persistToStorage(
  walletAddress: string,
  updatedHistory: ChatMessage[],
  index: { profileRootHash?: string | null } | null
) {
  try {
    // Load or create profile
    let profile = null;
    if (index?.profileRootHash) {
      try {
        profile = await downloadProfile(index.profileRootHash);
      } catch {
        profile = null;
      }
    }
    if (!profile) {
      profile = createDefaultProfile(walletAddress);
    }

    const updatedProfile = calculateStreak(profile);

    // Upload history + profile in parallel
    const [historyResult, profileResult] = await Promise.all([
      uploadHistory(updatedHistory),
      uploadProfile(updatedProfile),
    ]);

    // Update on-chain index
    await upsertStorageIndex(
      walletAddress,
      historyResult.rootHash,
      profileResult.rootHash
    );

    console.log("[/api/chat] Persisted to 0G Storage successfully");
  } catch (err) {
    // Non-fatal — user already got their response
    console.error("[/api/chat] Background persist failed:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, walletAddress } = parsed.data;

    // 1. Load context from 0G Storage (for conversation continuity)
    let history: ChatMessage[] = [];
    let index: Awaited<ReturnType<typeof getStorageIndex>> = null;
    try {
      index = await getStorageIndex(walletAddress);
      if (index?.historyRootHash) {
        history = await downloadHistory(index.historyRootHash);
      }
    } catch {
      // First time or network issues — proceed without context
      history = [];
    }

    // Build context for inference (recent messages only)
    const contextHistory: InferenceMessage[] = history
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    // 2. Run inference — this is the only blocking call the user waits for
    const { content } = await sendToZeroViza(message, contextHistory);

    // 3. Create messages
    const userMsg: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      id: nanoid(),
      role: "assistant",
      content,
      timestamp: Date.now(),
    };

    const updatedHistory = [...history, userMsg, assistantMsg];

    // 4. Fire-and-forget: persist to 0G Storage in the background.
    //    The user gets their AI response immediately without waiting
    //    for the slow 0G upload + contract write.
    persistToStorage(walletAddress, updatedHistory, index).catch(() => {});

    return NextResponse.json({ message: assistantMsg });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/chat]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
