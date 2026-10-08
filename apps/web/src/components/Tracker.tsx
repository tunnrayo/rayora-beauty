"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("rb_session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("rb_session", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

/** Records one page view per page. It never blocks the page and never shows errors. */
export default function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "page_view", path: pathname, sessionId: sessionId() }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
