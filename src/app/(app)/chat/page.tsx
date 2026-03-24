"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChatStore } from "@/store/chatStore";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage } from "@/types/chat";

const SUGGESTED_QUESTIONS = [
  { icon: "\u{1F1FA}\u{1F1F8}", text: "US visa options for Nigerian nationals" },
  { icon: "\u{1F3E0}", text: "How to apply for asylum in Germany" },
  { icon: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}", text: "Family reunification visa requirements" },
  { icon: "\u{1F4BC}", text: "Work permit documents checklist" },
];

const QUICK_PROMPTS = [
  "What visa do I need to work in the US?",
  "How do I apply for asylum in Europe?",
  "What documents do I need for a spousal visa?",
  "How long does a Green Card take?",
];

async function loadHistory(wallet: string): Promise<ChatMessage[]> {
  const res = await fetch(`/api/history?wallet=${wallet}&limit=50`);
  if (!res.ok) return [];
  const data = (await res.json()) as { messages: ChatMessage[] };
  return data.messages;
}

export default function ChatPage() {
  const { address } = useWallet();
  const { messages, isLoading, sendMessage } = useChat();
  const setMessages = useChatStore((s) => s.setMessages);
  const searchParams = useSearchParams();
  const autoSentRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  const { data: history } = useQuery({
    queryKey: ["history", address],
    queryFn: () => loadHistory(address!),
    enabled: !!address,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (history && messages.length === 0) {
      setMessages(history);
    }
  }, [history, messages.length, setMessages]);

  // Auto-send from ?q= query param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && address && !autoSentRef.current && !isLoading) {
      autoSentRef.current = true;
      sendMessage(q);
    }
  }, [searchParams, address, isLoading, sendMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  const handleSend = (text?: string) => {
    const content = text ?? inputValue.trim();
    if (!content || isLoading) return;
    sendMessage(content);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const hasMessages = messages.length > 0 || isLoading;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F8FAFC]">
      {/* ── Header ── */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#DC2626] flex items-center justify-center shadow-md bg-white">
            <span className="text-[#0F172A] font-black text-[9px] tracking-wide">Viza</span>
          </div>
          <div>
            <h2 className="text-[#0F172A] font-bold text-sm">AI Immigration Advisor</h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[#64748B] text-xs">Online · 0G Compute · Not legal advice</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/resources"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] text-xs font-medium hover:border-[#DC2626] hover:text-[#DC2626] transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Guides
          </Link>
          <ConnectButton />
        </div>
      </header>

      {/* ── Chat body ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!hasMessages ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-[#DC2626] flex items-center justify-center mb-4 shadow-lg shadow-red-200"
            >
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[#0F172A] font-black text-lg mb-1"
            >
              Your AI Immigration Advisor
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-[#64748B] text-sm max-w-xs leading-relaxed mb-6"
            >
              Ask anything about visas, asylum, work permits, or family immigration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full max-w-sm space-y-2"
            >
              <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider mb-2">
                Popular questions
              </p>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q.text}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => handleSend(q.text)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0] text-left hover:border-[#DC2626] hover:bg-[#FEF2F2] transition-all group"
                >
                  <span className="text-lg">{q.icon}</span>
                  <span className="text-[#0F172A] text-sm font-medium group-hover:text-[#DC2626] transition-colors">
                    {q.text}
                  </span>
                  <svg className="w-4 h-4 text-[#94A3B8] ml-auto group-hover:text-[#DC2626] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              ))}
            </motion.div>
          </div>
        ) : (
          /* ── Message list ── */
          <div className="px-4 py-4">
            {messages.map((msg, i) => (
              <ChatBubble key={msg.id} message={msg} index={i} />
            ))}
            <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
            <div ref={bottomRef} className="h-1" />
          </div>
        )}
      </div>

      {/* ── Input bar — always visible at bottom ── */}
      <div className="border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-4 flex-shrink-0 mb-16 lg:mb-0">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-end gap-2 p-2.5 focus-within:border-[#DC2626] focus-within:shadow-[0_0_0_3px_rgba(220,38,38,0.08)] transition-all">
          {/* Quick prompts toggle */}
          <button
            onClick={() => {
              const el = document.getElementById("quick-prompts");
              el?.classList.toggle("hidden");
            }}
            title="Quick question suggestions"
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#64748B] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about visa eligibility, documents, asylum..."
            rows={1}
            className="flex-1 bg-transparent text-[#0F172A] placeholder:text-[#94A3B8] resize-none outline-none text-sm leading-relaxed max-h-28 overflow-y-auto"
          />

          <motion.button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            whileTap={{ scale: 0.92 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              inputValue.trim() && !isLoading
                ? "bg-[#DC2626] shadow-sm shadow-red-200 hover:bg-[#B91C1C]"
                : "bg-[#E2E8F0] cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className={`w-4 h-4 ${inputValue.trim() ? "text-white" : "text-[#94A3B8]"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Quick prompts row */}
        <div id="quick-prompts" className="hidden mt-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="text-xs text-[#64748B] border border-[#E2E8F0] rounded-full px-3 py-1.5 hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        <p className="text-[#94A3B8] text-[10px] text-center mt-2">
          AI guidance only — not legal advice. Press Enter to send, Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
}
