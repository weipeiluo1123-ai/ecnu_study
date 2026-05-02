"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Props {
  postSlug: string;
}

export function LikeButton({ postSlug }: Props) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const popupTimer = useRef(0 as unknown as ReturnType<typeof setTimeout>);

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
    return () => clearTimeout(popupTimer.current);
  }, [fetchLikes]);

  async function handleLike() {
    if (!user) return;
    const prevLiked = liked;
    const prevCount = count;
    const nowLiked = !prevLiked;
    setLiked(nowLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);

    // Show popup on like (not unlike)
    if (nowLiked) {
      setShowPopup(true);
      clearTimeout(popupTimer.current);
      popupTimer.current = setTimeout(() => setShowPopup(false), 1500);
    }

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
      setLiked(prevLiked);
      setCount(prevCount);
    }
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-neon-cyan transition-colors"
      >
        <Heart size={16} />
        <span>{count}</span>
      </Link>
    );
  }

  return (
    <span className="relative inline-flex">
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
      <AnimatePresence>
        {showPopup && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-medium text-neon-pink whitespace-nowrap pointer-events-none"
          >
            <Heart size={12} className="fill-neon-pink" />
            Liked!
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
