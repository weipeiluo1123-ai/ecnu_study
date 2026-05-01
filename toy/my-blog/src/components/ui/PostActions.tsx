"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Bookmark } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface Props {
  postSlug: string;
}

export function PostActions({ postSlug }: Props) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bmCount, setBmCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [likeRes, bmRes] = await Promise.all([
        fetch(`/api/likes?postSlug=${postSlug}${user ? `&userId=${user.id}` : ""}`),
        fetch(`/api/bookmarks?postSlug=${postSlug}${user ? `&userId=${user.id}` : ""}`),
      ]);
      const likeData = await likeRes.json();
      const bmData = await bmRes.json();
      setLikeCount(likeData.count || 0);
      setLiked(likeData.liked || false);
      setBmCount(bmData.count || 0);
      setBookmarked(bmData.bookmarked || false);
    } catch {}
  }, [postSlug, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleLike() {
    if (!user) return;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug }),
      });
      const data = await res.json();
      setLikeCount(data.count);
      setLiked(data.liked);
    } catch {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  }

  async function handleBookmark() {
    if (!user) return;
    setBookmarked(!bookmarked);
    setBmCount(bookmarked ? bmCount - 1 : bmCount + 1);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug }),
      });
      const data = await res.json();
      setBmCount(data.count);
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked(!bookmarked);
      setBmCount(bookmarked ? bmCount - 1 : bmCount + 1);
    }
  }

  const likeBtn = !user ? (
    <Link href="/auth/login" className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all cursor-pointer ${liked ? "bg-neon-pink/10 border-neon-pink/30 text-neon-pink" : "bg-surface-alt border-border text-muted hover:border-neon-pink/30 hover:text-neon-pink"}`}>
      <Heart size={20} className={liked ? "fill-neon-pink text-neon-pink" : ""} />
      <span className="text-sm font-medium">{likeCount}</span>
    </Link>
  ) : (
    <button onClick={handleLike} className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all cursor-pointer ${liked ? "bg-neon-pink/10 border-neon-pink/30 text-neon-pink" : "bg-surface-alt border-border text-muted hover:border-neon-pink/30 hover:text-neon-pink"}`}>
      <Heart size={20} className={liked ? "fill-neon-pink text-neon-pink" : ""} />
      <span className="text-sm font-medium">{likeCount}</span>
    </button>
  );

  const bmBtn = !user ? (
    <Link href="/auth/login" className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all cursor-pointer ${bookmarked ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan" : "bg-surface-alt border-border text-muted hover:border-neon-cyan/30 hover:text-neon-cyan"}`}>
      <Bookmark size={20} className={bookmarked ? "fill-neon-cyan text-neon-cyan" : ""} />
      <span className="text-sm font-medium">{bmCount}</span>
    </Link>
  ) : (
    <button onClick={handleBookmark} className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all cursor-pointer ${bookmarked ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan" : "bg-surface-alt border-border text-muted hover:border-neon-cyan/30 hover:text-neon-cyan"}`}>
      <Bookmark size={20} className={bookmarked ? "fill-neon-cyan text-neon-cyan" : ""} />
      <span className="text-sm font-medium">{bmCount}</span>
    </button>
  );

  return (
    <AnimatedSection delay={0.2} className="mt-10">
      <div className="flex items-center justify-center gap-6 py-6 border-y border-border">
        {likeBtn}
        {bmBtn}
      </div>
    </AnimatedSection>
  );
}
