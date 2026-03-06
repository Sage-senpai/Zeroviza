"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { useDemoStore } from "@/store/demoStore";

interface WalletGuardProps {
  children: React.ReactNode;
}

export function WalletGuard({ children }: WalletGuardProps) {
  const { status } = useAccount();
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDemoMode) return;
    if (mounted && status === "disconnected") {
      router.replace("/connect");
    }
  }, [mounted, status, isDemoMode, router]);

  useEffect(() => {
    if (isDemoMode) return;
    if (!mounted || (status !== "connecting" && status !== "reconnecting")) {
      setTimedOut(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setTimedOut(true);
      router.replace("/connect");
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [mounted, status, isDemoMode, router]);

  // Demo mode bypasses all wallet checks
  if (isDemoMode) return <>{children}</>;

  // Show spinner until mounted + not in a transitional state
  if (!mounted || ((status === "connecting" || status === "reconnecting") && !timedOut)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 text-[#64748B]">
          <LoadingDots size="md" />
          <span className="text-sm">
            {status === "reconnecting" ? "Restoring wallet session..." : "Connecting wallet..."}
          </span>
        </div>
      </div>
    );
  }

  // Redirect in progress — render nothing
  if (status === "disconnected") {
    return null;
  }

  return <>{children}</>;
}
