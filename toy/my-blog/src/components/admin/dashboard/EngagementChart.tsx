"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

interface EngagementData {
  hour: string;
  likes: number;
  comments: number;
  bookmarks: number;
}

interface EngagementChartProps {
  data: EngagementData[];
  loading?: boolean;
}

export default function EngagementChart({ data, loading }: EngagementChartProps) {
  const option = useMemo(() => {
    const allZero = data.every(d => d.likes + d.comments + d.bookmarks === 0);

    return {
      backgroundColor: "transparent",
      grid: { left: 50, right: 20, top: 40, bottom: 30 },
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(0,0,0,0.8)",
        borderColor: "rgba(176,0,255,0.3)",
        textStyle: { color: "#e0e0e0", fontSize: 12 },
      },
      legend: {
        data: ["点赞", "评论", "收藏"],
        textStyle: { color: "#aaa", fontSize: 11 },
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: "category" as const,
        data: data.map(d => d.hour),
        axisLabel: { color: "#888", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      yAxis: {
        type: "value" as const,
        min: 0,
        axisLabel: { color: "#888", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" as const } },
      },
      series: [
        {
          name: "点赞",
          type: "bar" as const,
          stack: "engagement",
          barWidth: 12,
          itemStyle: { color: "#ff00aa", borderRadius: [2, 2, 0, 0] },
          data: data.map(d => d.likes),
        },
        {
          name: "评论",
          type: "bar" as const,
          stack: "engagement",
          barWidth: 12,
          itemStyle: { color: "#00f0ff", borderRadius: [2, 2, 0, 0] },
          data: data.map(d => d.comments),
        },
        {
          name: "收藏",
          type: "bar" as const,
          stack: "engagement",
          barWidth: 12,
          itemStyle: { color: "#00ff88", borderRadius: [2, 2, 0, 0] },
          data: data.map(d => d.bookmarks),
        },
      ],
      title: allZero ? {
        text: "暂无数据",
        left: "center",
        top: "center",
        textStyle: { color: "#666", fontSize: 14, fontWeight: 400 },
      } : undefined,
    };
  }, [data]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-sm font-medium text-muted mb-4">互动分布（过去 24 小时）</h3>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 240 }}
        showLoading={loading}
        notMerge
        lazyUpdate
      />
    </div>
  );
}
