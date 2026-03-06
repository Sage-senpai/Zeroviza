import "server-only";

/**
 * LawyerRegistry contract integration — server-side only.
 * Uses ethers.js for wallet signing.
 * V2: operator pattern + applicant enumeration + getRecord + 0G metadata.
 */

import { ethers } from "ethers";

// ─── ABI (minimal, explicit — avoids parseAbi type inference OOM) ─────────────

export const LAWYER_REGISTRY_ABI = [
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "operator", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "isVerified", inputs: [{ name: "wallet", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "getStatus", inputs: [{ name: "wallet", type: "address" }], outputs: [{ type: "uint8" }], stateMutability: "view" },
  {
    type: "function", name: "getRecord",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [
      { name: "status", type: "uint8" },
      { name: "metadataURI", type: "string" },
      { name: "appliedAt", type: "uint256" },
      { name: "verifiedAt", type: "uint256" },
      { name: "rejectionReason", type: "string" },
    ],
    stateMutability: "view",
  },
  { type: "function", name: "verifiedCount", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "verifiedAt", inputs: [{ name: "index", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "applicantCount", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "applicantAt", inputs: [{ name: "index", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "applyForVerification", inputs: [{ name: "metadataURI", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "applyOnBehalf", inputs: [{ name: "wallet", type: "address" }, { name: "metadataURI", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "verifyLawyer", inputs: [{ name: "wallet", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "rejectLawyer", inputs: [{ name: "wallet", type: "address" }, { name: "reason", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setOperator", inputs: [{ name: "newOperator", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "transferOwnership", inputs: [{ name: "newOwner", type: "address" }], outputs: [], stateMutability: "nonpayable" },
];

// Status enum — matches Solidity order
export enum LawyerStatus {
  None     = 0,
  Pending  = 1,
  Verified = 2,
  Rejected = 3,
}

// ─── Contract address ─────────────────────────────────────────────────────────

export function getRegistryAddress(): string | null {
  return process.env.NEXT_PUBLIC_LAWYER_REGISTRY_ADDRESS ?? null;
}

// ─── Ethers contract helpers ──────────────────────────────────────────────────

function getServerContract(readOnly = false) {
  const contractAddress = getRegistryAddress();
  if (!contractAddress) throw new Error("NEXT_PUBLIC_LAWYER_REGISTRY_ADDRESS not set");

  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");

  if (readOnly) {
    return new ethers.Contract(contractAddress, LAWYER_REGISTRY_ABI, provider);
  }

  const pk = process.env.OG_SERVER_PRIVATE_KEY;
  if (!pk) throw new Error("OG_SERVER_PRIVATE_KEY not set");
  return new ethers.Contract(contractAddress, LAWYER_REGISTRY_ABI, new ethers.Wallet(pk, provider));
}

// ─── On-chain record type ─────────────────────────────────────────────────────

export interface OnChainLawyerRecord {
  status: LawyerStatus;
  metadataURI: string;
  appliedAt: number;
  verifiedAt: number;
  rejectionReason: string;
}

// ─── Read functions ───────────────────────────────────────────────────────────

export async function readOnChainStatus(walletAddress: string): Promise<LawyerStatus> {
  if (!getRegistryAddress()) return LawyerStatus.None;
  const contract = getServerContract(true);
  const status = await contract.getStatus(walletAddress) as bigint;
  return Number(status) as LawyerStatus;
}

export async function readOnChainRecord(walletAddress: string): Promise<OnChainLawyerRecord> {
  const contract = getServerContract(true);
  const [status, metadataURI, appliedAt, verifiedAt, rejectionReason] =
    await contract.getRecord(walletAddress) as [bigint, string, bigint, bigint, string];
  return {
    status: Number(status) as LawyerStatus,
    metadataURI,
    appliedAt: Number(appliedAt),
    verifiedAt: Number(verifiedAt),
    rejectionReason,
  };
}

export async function getVerifiedAddresses(): Promise<string[]> {
  const contract = getServerContract(true);
  const count = Number(await contract.verifiedCount() as bigint);
  const addresses: string[] = [];
  for (let i = 0; i < count; i++) {
    addresses.push(await contract.verifiedAt(i) as string);
  }
  return addresses;
}

export async function getAllApplicantAddresses(): Promise<string[]> {
  const contract = getServerContract(true);
  const count = Number(await contract.applicantCount() as bigint);
  const addresses: string[] = [];
  for (let i = 0; i < count; i++) {
    addresses.push(await contract.applicantAt(i) as string);
  }
  return addresses;
}

// ─── Write functions ──────────────────────────────────────────────────────────

export async function serverApplyOnBehalf(walletAddress: string, metadataURI: string): Promise<string> {
  const contract = getServerContract(false);
  const tx = await contract.applyOnBehalf(walletAddress, metadataURI) as ethers.TransactionResponse;
  await tx.wait(1);
  return tx.hash;
}

export async function serverVerifyLawyer(walletAddress: string): Promise<string> {
  const contract = getServerContract(false);
  const tx = await contract.verifyLawyer(walletAddress) as ethers.TransactionResponse;
  await tx.wait(1);
  return tx.hash;
}

export async function serverRejectLawyer(walletAddress: string, reason: string): Promise<string> {
  const contract = getServerContract(false);
  const tx = await contract.rejectLawyer(walletAddress, reason) as ethers.TransactionResponse;
  await tx.wait(1);
  return tx.hash;
}
