"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import DashboardOverview from "@/components/admin/dashboard/DashboardOverview";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      router.push("/home/blog/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return null; // will redirect
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/home/blog/admin"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              返回后台
            </Link>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 size={28} className="text-neon-cyan" />
              监控面板
            </h1>
            <p className="mt-1 text-sm text-muted">
              {(user.role === "super_admin" ? "👑 超级管理员" : "🛡️ 管理员")} · 过去 24 小时站点数据概览
            </p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8">
        <DashboardOverview />
      </AnimatedSection>
    </div>
  );
}
