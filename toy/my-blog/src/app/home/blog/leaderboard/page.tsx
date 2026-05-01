"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Trophy, Crown, TrendingUp, Calendar, Star } from "lucide-react";
import Link from "next/link";

// Rank badge component — gold / silver / bronze for top 3
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="shrink-0 w-7 text-center" title="冠军">
        <Crown size={20} className="inline-block text-neon-yellow drop-shadow-[0_0_6px_rgba(255,221,0,0.5)]" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="shrink-0 w-7 text-center font-bold text-sm text-slate-300" title="亚军">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="shrink-0 w-7 text-center font-bold text-sm text-amber-600" title="季军">
        3
      </span>
    );
  }
  return (
    <span className="shrink-0 w-7 text-center text-sm font-bold text-muted">
      {rank}
    </span>
  );
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  postCount: number;
  totalLikes: number;
  totalViews: number;
  totalBookmarks: number;
  interactors?: number;
}

type Range = "all" | "monthly" | "weekly" | "daily";

interface LeaderboardResponse {
  range: string;
  label?: string;
  leaderboard: LeaderboardEntry[];
}

interface RangeConfig {
  key: Range;
  label: string;
  icon: typeof Trophy;
  color: string;
}

const ranges: RangeConfig[] = [
  { key: "all",      label: "总分榜", icon: Trophy,     color: "text-neon-yellow" },
  { key: "monthly",  label: "月榜",   icon: Star,        color: "text-neon-cyan" },
  { key: "weekly",   label: "周榜",   icon: TrendingUp,  color: "text-neon-purple" },
  { key: "daily",    label: "日榜",   icon: Calendar,    color: "text-neon-green" },
];

const TOP_N = 8;

export default function LeaderboardPage() {
  const [allData, setAllData] = useState<Record<Range, LeaderboardEntry[]>>({
    all: [], monthly: [], weekly: [], daily: [],
  });
  const [labels, setLabels] = useState<Record<Range, string>>({ all: "", monthly: "", weekly: "", daily: "" });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const results: LeaderboardResponse[] = await Promise.all(
        ranges.map((r) =>
          fetch(`/api/leaderboard?range=${r.key}`).then((res) => res.json())
        )
      );
      setAllData({
        all: results[0].leaderboard || [],
        monthly: results[1].leaderboard || [],
        weekly: results[2].leaderboard || [],
        daily: results[3].leaderboard || [],
      });
      setLabels({
        all: results[0].label || "",
        monthly: results[1].label || "",
        weekly: results[2].label || "",
        daily: results[3].label || "",
      });
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={28} className="text-neon-yellow" />
          <h1 className="text-3xl font-bold text-foreground">排行榜</h1>
        </div>
        <p className="text-muted">
          根据用户发布文章的浏览量、点赞量、收藏量计算的积分排名 · 每分钟自动刷新
        </p>
      </AnimatedSection>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-8 w-24 rounded-lg" />
              <div className="skeleton h-64 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatedSection delay={0.1} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {ranges.map((range) => {
              const Icon = range.icon;
              const list = allData[range.key].slice(0, TOP_N);
              return (
                <div key={range.key} className="rounded-xl border border-border bg-surface flex flex-col">
                  {/* Column header */}
                  <div className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Icon size={20} className={range.color} />
                      <h2 className="text-base font-bold text-foreground">{range.label}</h2>
                    </div>
                    {labels[range.key] && (
                      <p className="text-[11px] text-muted mt-0.5">{labels[range.key]}</p>
                    )}
                  </div>

                  {/* Column body */}
                  <div className="flex-1 p-4 space-y-2.5">
                    {list.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-muted text-sm">
                        <Trophy size={28} className="mb-2 text-muted/20" />
                        暂无数据
                      </div>
                    ) : (
                      list.map((entry) => (
                        <Link
                          key={entry.userId}
                          href={`/home/blog/users/${entry.userId}`}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-alt transition-colors group"
                        >
                          {/* Rank */}
                          <RankBadge rank={entry.rank} />

                          {/* Avatar + Name */}
                          <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-medium shrink-0">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground group-hover:text-neon-cyan transition-colors truncate">
                              {entry.username}
                            </div>
                            <div className="text-[11px] text-muted">
                              {entry.postCount} 篇 · 👁{entry.totalViews} · ❤{entry.totalLikes} · 👥{entry.interactors ?? 0}
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-neon-cyan tabular-nums">
                            {entry.score}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      )}

      {/* Score formula */}
      <AnimatedSection delay={0.2} className="mt-10">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">积分算法</h2>
          <div className="text-xs text-muted space-y-1">
            <p>每篇文章贡献 = 浏览量×1 + 点赞量×5 + 收藏量×10 + 互动基数×1</p>
            <p>用户总积分 = 该周期内有互动的文章贡献之和</p>
            <p>👥 互动人数 = 与该用户文章互动过的不同用户数（去重）</p>
            <p className="text-muted/60 mt-2">数据每分钟自动刷新</p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
