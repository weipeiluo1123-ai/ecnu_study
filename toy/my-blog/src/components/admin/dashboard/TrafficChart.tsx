"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { HourlyCount } from "@/lib/dashboard";

echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

interface TrafficChartProps {
  data: HourlyCount[];
  loading?: boolean;
}

export default function TrafficChart({ data, loading }: TrafficChartProps) {
  const option = useMemo(() => {
    const allZero = data.every(d => d.count === 0);

    return {
      backgroundColor: "transparent",
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(0,0,0,0.8)",
        borderColor: "rgba(0,240,255,0.3)",
        textStyle: { color: "#e0e0e0", fontSize: 12 },
        formatter: (params: any) => {
          const p = params[0];
          return `<div style="font-weight:600">${p.axisValue}</div><div style="color:#00f0ff">浏览量: ${p.value}</div>`;
        },
      },
      xAxis: {
        type: "category" as const,
        data: data.map(d => d.hour),
        axisLabel: { color: "#888", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value" as const,
        min: 0,
        axisLabel: { color: "#888", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" as const } },
      },
      series: [{
        type: "line" as const,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#00f0ff", width: 2 },
        itemStyle: { color: "#00f0ff" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0,240,255,0.3)" },
            { offset: 1, color: "rgba(0,240,255,0)" },
          ]),
        },
        data: data.map(d => d.count),
      }],
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
      <h3 className="text-sm font-medium text-muted mb-4">流量趋势（过去 24 小时）</h3>
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
