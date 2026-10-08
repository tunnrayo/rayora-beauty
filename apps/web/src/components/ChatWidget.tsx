"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Msg = { role: "user" | "bot"; text: string; products?: { slug: string; name: string }[] };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hello! Tell me your skin type, shade or budget and I will suggest products." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const message = String(new FormData(form).get("message") ?? "").trim();
    if (!message || busy) return;
    form.reset();
    setMessages((m) => [...m, { role: "user", text: message }]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: "bot", text: json.reply ?? json.error ?? "Sorry, something went wrong.", products: json.products }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, I could not reach the assistant. Please try again." }]);
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col rounded-2xl border border-blush bg-ivory shadow-lg" role="dialog" aria-label="Rayora shopping assistant">
          <div className="flex items-center justify-between border-b border-blush px-4 py-3">
            <p className="font-serif text-lg">Ask Rayora</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="text-xl leading-none">×</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <p className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-left ${m.role === "user" ? "bg-charcoal text-ivory" : "bg-blush/60"}`}>{m.text}</p>
                {m.products && m.products.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {m.products.map((p) => (
                      <li key={p.slug}><Link href={`/product/${p.slug}`} className="underline underline-offset-4" onClick={() => setOpen(false)}>{p.name}</Link></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {busy && <p className="text-cocoa">Thinking...</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-blush p-3">
            <label htmlFor="chat-message" className="sr-only">Your question</label>
            <input id="chat-message" name="message" maxLength={400} required placeholder="e.g. serum for dry skin" className="h-11 flex-1 rounded-full border border-blush bg-cream px-4 text-sm" />
            <button type="submit" disabled={busy} className="btn-primary px-4 disabled:opacity-60">Send</button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="btn-primary shadow-lg">
        {open ? "Close" : "Ask Rayora"}
      </button>
    </div>
  );
}
