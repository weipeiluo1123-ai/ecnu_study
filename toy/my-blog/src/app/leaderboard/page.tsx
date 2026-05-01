"use client";

import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Trophy, Medal, TrendingUp, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  postCount: number;
  totalLikes: number;
  totalViews: number;
  totalBookmarks: number;
}

type Range = "all" | "daily" | "weekly" | "monthly";

const PAGE_SIZE = 10;

const rangeLabels: Record<Range, string> = {
  all: "总分",
  daily: "每日",
  weekly: "每周",
  monthly: "每月",
};

const rangeIcons: Record<Range, any> = {
  all: Trophy,
  daily: Calendar,
  weekly: TrendingUp,
  monthly: Star,
};

export default function LeaderboardPage() {
  const [range, setRange] = useState<Range>("all");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetch(`/api/leaderboard?range=${range}`)
      .then((r) => r.json())
      .then((d) => setData(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/leaderboard?range=${range}`)
        .then((r) => r.json())
        .then((d) => setData(d.leaderboard || []))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [range]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={28} className="text-neon-yellow" />
          <h1 className="text-3xl font-bold text-foreground">排行榜</h1>
        </div>
        <p className="text-muted">
          根据用户发布文章的浏览量、点赞量、收藏量计算的积分排名
        </p>
      </AnimatedSection>

      {/* Range Tabs */}
      <AnimatedSection delay={0.05} className="mt-8">
        <div className="flex gap-2">
          {(["all", "daily", "weekly", "monthly"] as Range[]).map((r) => {
            const Icon = rangeIcons[r];
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                    : "bg-surface text-muted border border-border hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {rangeLabels[r]}
              </button>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Leaderboard */}
      <AnimatedSection delay={0.1} className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={48} className="mx-auto text-muted/30 mb-4" />
            <p className="text-muted">暂无排行数据</p>
            <p className="text-sm text-muted mt-1">发布文章并获取互动即可上榜</p>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted mb-3">
              共 {data.length} 人上榜
              {totalPages > 1 && `，第 ${page}/${totalPages} 页`}
            </div>

            {/* Scrollable list container */}
            <div className="max-h-[460px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
              {paginated.map((entry) => (
                <div
                  key={entry.userId}
                  className="gradient-border rounded-xl p-[1px]"
                >
                  <div className="rounded-xl bg-surface p-4 flex items-center gap-4">
                    {/* Rank */}
                    <div className="shrink-0 w-10 text-center">
                      {entry.rank <= 3 ? (
                        <Medal
                          size={28}
                          className={
                            entry.rank === 1
                              ? "text-neon-yellow"
                              : entry.rank === 2
                              ? "text-muted"
                              : "text-neon-orange"
                          }
                        />
                      ) : (
                        <span className="text-lg font-bold text-muted">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* User */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center text-sm text-neon-cyan font-medium">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/users/${entry.userId}`}
                            className="font-medium text-foreground hover:text-neon-cyan transition-colors"
                          >
                            {entry.username}
                          </Link>
                          <div className="text-xs text-muted">
                            {entry.postCount} 篇文章
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted">
                      <span>👁 {entry.totalViews}</span>
                      <span>❤ {entry.totalLikes}</span>
                      <span>🔖 {entry.totalBookmarks}</span>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-neon-cyan">
                        {entry.score}
                      </div>
                      <div className="text-xs text-muted">积分</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer",
                    page <= 1 && "opacity-40",
                  )}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium border transition-colors cursor-pointer",
                      p === page
                        ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                        : "border-border text-muted hover:text-foreground hover:border-accent",
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer",
                    page >= totalPages && "opacity-40",
                  )}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </AnimatedSection>

      {/* Score formula */}
      <AnimatedSection delay={0.2} className="mt-10">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">积分算法</h2>
          <div className="text-xs text-muted space-y-1">
            <p>单篇文章积分 = 浏览量 × 1 + 点赞量 × 5 + 收藏量 × 10</p>
            <p>用户总积分 = 该周期内所有文章的积分之和</p>
            <p className="text-muted/60 mt-2">数据每分钟自动刷新</p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
