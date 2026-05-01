"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Heart } from "lucide-react";
import Link from "next/link";

interface Props {
  postSlug: string;
}

export function LikeButton({ postSlug }: Props) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  const fetchLikes = useCallback(async () => {
    try {
      const url = `/api/likes?postSlug=${postSlug}${user ? `&userId=${user.id}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setCount(data.count || 0);
      setLiked(data.liked || false);
    } catch {
      // silent
    }
  }, [postSlug, user]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  async function handleLike() {
    if (!user) return;
    const prevLiked = liked;
    const prevCount = count;
    // Optimistic update
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug }),
      });
      const data = await res.json();
      setCount(data.count);
      setLiked(data.liked);
    } catch {
      // rollback to captured values
      setLiked(prevLiked);
      setCount(prevCount);
    }
  }

  if (!user) {
    return (
      <Link
        href="/home/blog/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-neon-cyan transition-colors"
      >
        <Heart size={16} />
        <span>{count}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleLike}
      className="inline-flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
      aria-label={liked ? "取消点赞" : "点赞"}
    >
      <Heart
        size={16}
        className={liked ? "fill-neon-pink text-neon-pink" : "text-muted hover:text-neon-pink"}
      />
      <span className={liked ? "text-neon-pink" : "text-muted"}>{count}</span>
    </button>
  );
}
