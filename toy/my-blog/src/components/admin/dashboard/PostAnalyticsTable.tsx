"use client";

import { useState, useEffect } from "react";
import { Eye, Heart, Bookmark, MessageSquare, ArrowUpDown, ExternalLink, X, TrendingUp } from "lucide-react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { TopPost, HourlyCount } from "@/lib/dashboard";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

interface PostAnalyticsTableProps {
  posts: TopPost[];
  loading?: boolean;
  sortBy: string;
  onSortChange: (key: string) => void;
  range: string;
  onRangeChange: (range: string) => void;
}

function DetailModal({ slug, title, onClose }: { slug: string; title: string; onClose: () => void }) {
  const [analytics, setAnalytics] = useState<{ hourlyViews: HourlyCount[]; hourlyLikes: HourlyCount[]; hourlyBookmarks: HourlyCount[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/dashboard/posts?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setAnalytics(data); })
      .catch(() => { if (!cancelled) setAnalytics(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4 rounded-xl border border-white/10 bg-gray-900 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground truncate pr-4">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-muted hover:text-foreground transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && !analytics && (
          <div className="flex flex-col items-center justify-center h-64 text-muted">
            <TrendingUp size={32} className="mb-2 opacity-50" />
            <span className="text-sm">暂无数据</span>
          </div>
        )}

        {!loading && analytics && (
          <ReactEChartsCore
            echarts={echarts}
            option={{
              backgroundColor: "transparent",
              grid: { left: 50, right: 20, top: 20, bottom: 30 },
              tooltip: { trigger: "axis", backgroundColor: "rgba(0,0,0,0.8)", borderColor: "rgba(0,240,255,0.3)", textStyle: { color: "#e0e0e0" } },
              xAxis: { type: "category", data: analytics.hourlyViews.map(d => d.hour), axisLabel: { color: "#888", fontSize: 10 }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } } },
              yAxis: { type: "value", min: 0, axisLabel: { color: "#888", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" as const } } },
              series: [
                { name: "浏览", type: "line", smooth: true, symbol: "none", lineStyle: { color: "#00f0ff", width: 2 }, data: analytics.hourlyViews.map(d => d.count) },
                { name: "点赞", type: "line", smooth: true, symbol: "none", lineStyle: { color: "#ff00aa", width: 2 }, data: analytics.hourlyLikes.map(d => d.count) },
                { name: "收藏", type: "line", smooth: true, symbol: "none", lineStyle: { color: "#00ff88", width: 2 }, data: analytics.hourlyBookmarks.map(d => d.count) },
              ],
              legend: { data: ["浏览", "点赞", "收藏"], textStyle: { color: "#aaa", fontSize: 11 }, top: 0, itemWidth: 12, itemHeight: 8 },
            }}
            style={{ height: 240 }}
            notMerge
            lazyUpdate
          />
        )}
      </div>
    </div>
  );
}

const RANGE_OPTIONS = [
  { value: "24h", label: "24小时" },
  { value: "7d", label: "7天" },
  { value: "30d", label: "30天" },
  { value: "all", label: "全部" },
];

const SORT_OPTIONS = [
  { key: "views", icon: Eye, label: "浏览量" },
  { key: "likes", icon: Heart, label: "点赞" },
  { key: "bookmarks", icon: Bookmark, label: "收藏" },
];

export default function PostAnalyticsTable({ posts, loading, sortBy, onSortChange, range, onRangeChange }: PostAnalyticsTableProps) {
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [detailTitle, setDetailTitle] = useState("");

  const detailPost = detailSlug ? posts.find(p => p.slug === detailSlug) : null;

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
        <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted">文章排行</h3>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onRangeChange(opt.value)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                range === opt.value
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted">
          <TrendingUp size={32} className="mb-2 opacity-50" />
          <span className="text-sm">暂无文章数据</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-3 text-muted font-medium text-xs">#</th>
                <th className="text-left py-2 px-3 text-muted font-medium text-xs">标题</th>
                {SORT_OPTIONS.map(opt => (
                  <th key={opt.key} className="text-right py-2 px-3">
                    <button
                      onClick={() => onSortChange(opt.key)}
                      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
                        sortBy === opt.key ? "text-neon-cyan" : "text-muted hover:text-foreground"
                      }`}
                    >
                      <opt.icon size={12} />
                      {opt.label}
                      <ArrowUpDown size={10} />
                    </button>
                  </th>
                ))}
                <th className="text-right py-2 pl-3 text-muted font-medium text-xs">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.slug} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 pr-3 text-muted text-xs">{i + 1}</td>
                  <td className="py-2.5 px-3 text-foreground max-w-[200px] truncate">{post.title}</td>
                  <td className="py-2.5 px-3 text-right text-muted">{post.views}</td>
                  <td className="py-2.5 px-3 text-right text-muted">{post.likes}</td>
                  <td className="py-2.5 px-3 text-right text-muted">{post.bookmarks}</td>
                  <td className="py-2.5 pl-3 text-right">
                    <button
                      onClick={() => { setDetailSlug(post.slug); setDetailTitle(post.title); }}
                      className="p-1 rounded text-muted hover:text-neon-cyan hover:bg-white/10 transition-colors cursor-pointer"
                      title="查看详情"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailSlug && (
        <DetailModal
          slug={detailSlug}
          title={detailTitle}
          onClose={() => setDetailSlug(null)}
        />
      )}
    </div>
  );
}
