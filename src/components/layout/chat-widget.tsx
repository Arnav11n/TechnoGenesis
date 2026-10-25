"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "model"; text: string; error?: boolean };

const SUGGESTIONS = [
  "What is DNA, in simple words?",
  "How does a robot see the world?",
  "What is a neural network?",
  "Can AI help design medicines?",
];

const Orb = () => (
  <span className="mt-1 size-6 shrink-0 rounded-full bg-lime-glow shadow-[0_0_16px_2px_rgb(var(--glow)/0.5)]" />
);

/** A small assistant fixed to the corner of every page. */
export function ChatWidget() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Other parts of the site open the chat with:  askGenesis("a ready-made message")
  useEffect(() => {
    const onOpen = (e: Event) => {
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      setOpen(true);
      if (prompt) {
        setInput(prompt.slice(0, 500));
        setPrefilled(true);
        window.setTimeout(() => inputRef.current?.focus(), 400);
      }
    };
    window.addEventListener("open-genesis", onOpen);
    return () => window.removeEventListener("open-genesis", onOpen);
  }, []);

  // Signed-in people get their saved conversation back.
  useEffect(() => {
    if (!signedIn) {
      setHistoryLoaded(false);
      return;
    }
    if (!open || historyLoaded) return;
    setHistoryLoaded(true);
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        const saved = Array.isArray(d.messages) ? (d.messages as Msg[]) : [];
        if (saved.length) setMessages((cur) => (cur.length ? cur : saved));
      })
      .catch(() => {});
  }, [open, signedIn, historyLoaded]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const next: Msg[] = [...messages.filter((m) => !m.error), { role: "user", text: question }];
    setMessages(next);
    setInput("");
    setPrefilled(false);
    setLoading(true);

    let history = next.slice(-10);
    while (history.length && history[0].role !== "user") history = history.slice(1);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          messages: history.map(({ role, text }) => ({ role, text })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setMessages([...next, { role: "model", text: data.reply }]);
    } catch (err) {
      setMessages([
        ...next,
        { role: "model", text: err instanceof Error ? err.message : "Could not reach Genesis.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    if (signedIn) fetch("/api/chat", { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Genesis"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="flex h-[min(34rem,calc(100dvh-8rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-bone-100/15 bg-ink-900/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-bone-100/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="size-2.5 animate-pulse-slow rounded-full bg-lime-glow" />
                <div>
                  <p className="font-display text-base font-bold text-bone-50">Genesis</p>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-bone-500">
                    {signedIn ? (
                      "Chats saved to your account"
                    ) : (
                      <>
                        <Link href="/login" className="text-lime-glow hover:underline">
                          Sign in
                        </Link>{" "}
                        to save chats
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearChat}
                    aria-label="Clear this conversation"
                    title="Clear this conversation"
                    className="rounded-full p-2 text-bone-300 transition-colors hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full p-2 text-bone-300 transition-colors hover:text-lime-glow"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div ref={listRef} data-lenis-prevent className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex gap-3">
                <Orb />
                <div className="glass max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-bone-100">
                  Hi, I&apos;m Genesis. Ask me anything about AI, biotechnology or robotics, and I&apos;ll explain it
                  in simple words.
                </div>
              </div>

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-lime-glow px-4 py-2.5 text-sm font-medium text-ink-950">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <Orb />
                    <div
                      className={cn(
                        "glass max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed",
                        m.error ? "border-red-400/50 text-red-300" : "text-bone-100",
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ),
              )}

              {loading && (
                <div className="flex gap-3">
                  <Orb />
                  <div className="glass flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-4">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="size-1.5 rounded-full bg-lime-glow"
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {messages.length === 0 && !input && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-bone-100/20 px-3 py-1.5 text-left text-xs text-bone-300 transition-colors hover:border-lime-glow/60 hover:text-lime-glow"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {prefilled && input && (
              <p className="border-t border-bone-100/10 px-5 pt-3 font-mono text-[0.625rem] uppercase tracking-[0.15em] text-lime-glow">
                Message ready for you. Edit it if you like, then press send.
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-bone-100/10 p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ask a question..."
                aria-label="Your question"
                className="w-full rounded-full border border-bone-100/15 bg-ink-800/60 px-4 py-3 text-sm text-bone-50 outline-none transition-all placeholder:text-bone-500 focus:border-lime-glow focus:ring-4 focus:ring-lime-glow/10"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-lime-glow text-ink-950 transition-all hover:bg-lime-hover disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with Genesis"}
        className="group relative grid size-14 place-items-center rounded-full bg-lime-glow text-ink-950 shadow-[0_0_30px_-4px_rgb(var(--glow)/0.7)] transition-transform hover:scale-105 active:scale-95"
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-lime-glow/40" />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "chat"}
            initial={{ rotate: -80, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 80, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative"
          >
            {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}