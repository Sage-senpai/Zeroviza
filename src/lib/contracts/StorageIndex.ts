import "server-only";

/**
 * StorageIndex contract integration — server-side only.
 * Maps wallet addresses to their 0G Storage root hashes (history, profile, documents).
 * Replaces SQLite storage_index table.
 */

import { ethers } from "ethers";

// ─── ABI (minimal, explicit — avoids parseAbi type inference OOM) ─────────────

export const STORAGE_INDEX_ABI = [
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "operator", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  {
    type: "function", name: "updateRoots",
    inputs: [
      { name: "user", type: "address" },
      { name: "historyRoot", type: "string" },
      { name: "profileRoot", type: "string" },
      { name: "documentsRoot", type: "string" },
    ],
    outputs: [], stateMutability: "nonpayable",
  },
  {
    type: "function", name: "getRoots",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "historyRoot", type: "string" },
      { name: "profileRoot", type: "string" },
      { name: "documentsRoot", type: "string" },
    ],
    stateMutability: "view",
  },
  { type: "function", name: "setOperator", inputs: [{ name: "newOperator", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "transferOwnership", inputs: [{ name: "newOwner", type: "address" }], outputs: [], stateMutability: "nonpayable" },
];

// ─── Contract address ─────────────────────────────────────────────────────────

export function getStorageIndexAddress(): string | null {
  return process.env.NEXT_PUBLIC_STORAGE_INDEX_ADDRESS ?? null;
}

// ─── Contract helpers ─────────────────────────────────────────────────────────

function getContract(readOnly = false) {
  const addr = getStorageIndexAddress();
  if (!addr) throw new Error("NEXT_PUBLIC_STORAGE_INDEX_ADDRESS not set");

  const rpc = process.env.NEXT_PUBLIC_0G_RPC_URL ?? "https://evmrpc.0g.ai";
  const provider = new ethers.JsonRpcProvider(rpc);

  if (readOnly) {
    return new ethers.Contract(addr, STORAGE_INDEX_ABI, provider);
  }

  const pk = process.env.OG_SERVER_PRIVATE_KEY;
  if (!pk) throw new Error("OG_SERVER_PRIVATE_KEY not set");
  return new ethers.Contract(addr, STORAGE_INDEX_ABI, new ethers.Wallet(pk, provider));
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export interface OnChainRoots {
  historyRoot: string;
  profileRoot: string;
  documentsRoot: string;
}

export async function getRoots(walletAddress: string): Promise<OnChainRoots> {
  const contract = getContract(true);
  const [historyRoot, profileRoot, documentsRoot] = await contract.getRoots(walletAddress) as [string, string, string];
  return { historyRoot, profileRoot, documentsRoot };
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Update root hashes for a user. Pass empty string to leave a root unchanged.
 */
export async function updateRoots(
  walletAddress: string,
  historyRoot: string,
  profileRoot: string,
  documentsRoot: string,
): Promise<string> {
  const contract = getContract(false);
  const tx = await contract.updateRoots(
    walletAddress, historyRoot, profileRoot, documentsRoot,
  ) as ethers.TransactionResponse;
  await tx.wait(1);
  return tx.hash;
}
