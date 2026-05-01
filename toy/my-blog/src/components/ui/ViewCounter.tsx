"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface Props {
  postSlug: string;
}

export function ViewCounter({ postSlug }: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let vid = "anonymous";
    try {
      let stored = localStorage.getItem("nexus_visitor_id");
      if (!stored) {
        stored = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("nexus_visitor_id", stored);
      }
      vid = stored;
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }

    // Increment view on every visit
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postSlug, visitorId: vid }),
    }).catch(() => {});

    // Fetch count
    fetch(`/api/views?postSlug=${postSlug}`)
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, [postSlug]);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted">
      <Eye size={14} />
      {count}
    </span>
  );
}
