"use client";

import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number | null;
  loading?: boolean;
}

export default function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 animate-pulse">
        <div className="h-9 w-9 rounded-lg bg-white/10" />
        <div className="mt-4 h-7 w-24 bg-white/10 rounded" />
        <div className="mt-1 h-4 w-16 bg-white/10 rounded" />
      </div>
    );
  }

  const trendColor = trend === null || trend === undefined ? "text-muted"
    : trend > 0 ? "text-neon-green"
    : trend < 0 ? "text-red-400"
    : "text-muted";

  const trendIcon = trend === null || trend === undefined ? ""
    : trend > 0 ? "↑"
    : trend < 0 ? "↓"
    : "→";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 transition-all hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
          <Icon size={18} className="text-neon-cyan" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted">{title}</span>
          {trend !== undefined && (
            <span className={`text-xs ${trendColor}`}>
              {trendIcon} {trend !== null && Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
