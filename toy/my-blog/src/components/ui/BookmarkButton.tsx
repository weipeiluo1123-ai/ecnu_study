"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark } from "lucide-react";
import Link from "next/link";

interface Props {
  postSlug: string;
}

export function BookmarkButton({ postSlug }: Props) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [count, setCount] = useState(0);

  const fetchBm = useCallback(async () => {
    try {
      const url = `/api/bookmarks?postSlug=${postSlug}${user ? `&userId=${user.id}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setCount(data.count || 0);
      setBookmarked(data.bookmarked || false);
    } catch {
      // silent
    }
  }, [postSlug, user]);

  useEffect(() => {
    fetchBm();
  }, [fetchBm]);

  async function handleToggle() {
    if (!user) return;
    const prevBookmarked = bookmarked;
    const prevCount = count;
    setBookmarked(!prevBookmarked);
    setCount(prevBookmarked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug }),
      });
      const data = await res.json();
      setCount(data.count);
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked(prevBookmarked);
      setCount(prevCount);
    }
  }

  if (!user) {
    return (
      <Link
        href="/home/blog/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-neon-cyan transition-colors"
      >
        <Bookmark size={16} />
        <span>{count}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
      aria-label={bookmarked ? "取消收藏" : "收藏"}
    >
      <Bookmark
        size={16}
        className={bookmarked ? "fill-neon-cyan text-neon-cyan" : "text-muted hover:text-neon-cyan"}
      />
      <span className={bookmarked ? "text-neon-cyan" : "text-muted"}>{count}</span>
    </button>
  );
}
