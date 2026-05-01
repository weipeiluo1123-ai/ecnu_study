"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Heart, Bookmark, ArrowUpRight, User, Crown } from "lucide-react";
import type { PostMeta } from "@/lib/posts";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TAGS } from "@/lib/constants";

interface Props {
  post: PostMeta;
  index?: number;
}

export function PostCard({ post, index = 0 }: Props) {
  const router = useRouter();
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/home/blog/posts/${post.slug}`} className="group block">
        <div className="gradient-border rounded-xl p-[1px]">
          <div className="rounded-xl bg-surface p-5 transition-colors group-hover:bg-surface-alt">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Category & Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                    {post.category}
                  </span>
                  {post.tags.slice(0, 2).map((tag) => {
                    const tagInfo = TAGS.find((t) => t.slug === tag);
                    return (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-muted border border-border"
                      >
                        {tagInfo?.name || tag}
                      </span>
                    );
                  })}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground group-hover:text-neon-cyan transition-colors truncate">
                  {post.title}
                </h3>

                {/* Description */}
                <p className="mt-1 text-sm text-muted line-clamp-2">
                  {post.description}
                </p>

                {/* Author */}
                <div className="mt-2 flex items-center gap-2">
                  {post.authorId ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/home/blog/users/${post.authorId}`); }}
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-neon-cyan transition-colors cursor-pointer"
                    >
                      {post.authorRole === "super_admin" ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_6px_rgba(251,191,36,0.4)]">
                          <Crown size={10} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] text-neon-cyan font-medium">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {post.author}
                      {post.authorRole === "super_admin" && (
                        <span className="text-[10px] text-amber-400 font-medium">⦿</span>
                      )}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <User size={12} />
                      {post.author}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDateShort(post.date)}
                  </span>
                  <span className="flex items-center gap-1" title="点赞数">
                    <Heart size={12} className="text-neon-pink/70" />
                    {post.likesCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1" title="收藏数">
                    <Bookmark size={12} className="text-neon-cyan/70" />
                    {post.bookmarksCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={20} className="text-neon-cyan" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
