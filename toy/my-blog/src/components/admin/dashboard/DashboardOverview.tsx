"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Eye, Users, FileText, Activity, RefreshCw, AlertTriangle } from "lucide-react";
import StatCard from "./StatCard";
import type { OverviewStats, HourlyCount, EngagementData, TopPost } from "@/lib/dashboard";

const TrafficChart = dynamic(() => import("./TrafficChart"), { ssr: false });
const EngagementChart = dynamic(() => import("./EngagementChart"), { ssr: false });
const PostAnalyticsTable = dynamic(() => import("./PostAnalyticsTable"), { ssr: false });

interface DashboardData {
  overview: OverviewStats;
  hourlyViews: HourlyCount[];
  hourlyEngagement: EngagementData[];
  topPosts: TopPost[];
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("24h");
  const [sortBy, setSortBy] = useState("views");

  const fetchData = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?range=${range}&sortBy=${sortBy}&limit=10`);
      if (!res.ok) throw new Error(res.status === 403 ? "无权访问" : "加载失败");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "数据加载失败");
    } finally {
      setLoading(false);
    }
  }, [range, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const engagementData = data?.hourlyEngagement ?? [];

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
          <button
            onClick={fetchData}
            className="ml-auto px-3 py-1.5 text-xs rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            重试
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日访问"
          value={data?.overview.totalViews ?? 0}
          icon={Eye}
          loading={loading}
        />
        <StatCard
          title="活跃用户"
          value={data?.overview.activeUsers ?? 0}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="新增内容"
          value={data?.overview.newPosts ?? 0}
          icon={FileText}
          loading={loading}
        />
        <StatCard
          title="互动总数"
          value={data?.overview.totalInteractions ?? 0}
          icon={Activity}
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart data={data?.hourlyViews ?? []} loading={loading} />
        <EngagementChart data={engagementData} loading={loading} />
      </div>

      {/* Post analytics table */}
      <PostAnalyticsTable
        posts={data?.topPosts ?? []}
        loading={loading}
        sortBy={sortBy}
        onSortChange={setSortBy}
        range={range}
        onRangeChange={setRange}
      />

      {/* Refresh button */}
      <div className="flex justify-center">
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground border border-white/10 hover:border-white/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          刷新数据
        </button>
      </div>
    </div>
  );
}
