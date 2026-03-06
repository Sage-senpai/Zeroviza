/**
 * POST /api/lawyers/verify
 * Admin-only: approve or reject a lawyer application.
 * Requires header: X-Admin-Secret: <ADMIN_SECRET env var>
 *
 * Body: { wallet: string, action: "approve" | "reject", reason?: string }
 *
 * Writes directly to the LawyerRegistry smart contract on 0G Galileo.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyLawyer, rejectLawyer, getLawyerByWallet } from "@/lib/db/client";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";
const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { wallet: string; action: "approve" | "reject"; reason?: string };
  try {
    body = await req.json() as { wallet: string; action: "approve" | "reject"; reason?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { wallet, action, reason } = body;
  if (!wallet || !WALLET_RE.test(wallet)) {
    return NextResponse.json({ error: "Valid wallet address is required" }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }
  if (action === "reject" && !reason?.trim()) {
    return NextResponse.json({ error: "rejection reason is required" }, { status: 400 });
  }

  // Check the lawyer exists and is pending
  const lawyer = await getLawyerByWallet(wallet);
  if (!lawyer) {
    return NextResponse.json({ error: "Lawyer application not found" }, { status: 404 });
  }
  if (lawyer.status !== "pending") {
    return NextResponse.json({ error: `Lawyer is already ${lawyer.status}` }, { status: 409 });
  }

  // Write to smart contract (source of truth)
  try {
    const ok = action === "approve"
      ? await verifyLawyer(wallet)
      : await rejectLawyer(wallet, reason!.trim());

    if (!ok) {
      return NextResponse.json({ error: "Contract write failed" }, { status: 500 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[verify] contract write failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    action,
    wallet,
  });
}
