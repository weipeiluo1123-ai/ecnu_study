"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Users, MessageSquare, Eye, Shield, ClipboardCheck, Crown, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, comments: 0 });

  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      router.push("/home/blog/auth/login");
      return;
    }

    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setStats((s) => ({ ...s, users: d.users?.length || 0 })))
      .catch(() => {});
    fetch("/api/comments?postSlug=__all__")
      .then((r) => r.json())
      .then((d) => setStats((s) => ({ ...s, comments: d.comments?.length || 0 })))
      .catch(() => {});
  }, [user, loading, router]);

  if (loading || !user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="skeleton h-8 w-48 rounded-lg" />
      </div>
    );
  }

  const cards = [
    {
      label: "用户管理",
      value: stats.users,
      icon: Users,
      href: "/home/blog/admin/users",
      desc: "管理所有注册用户",
    },
    {
      label: "评论管理",
      value: stats.comments,
      icon: MessageSquare,
      href: "/home/blog/admin/comments",
      desc: "查看和管理评论",
    },
    {
      label: "监控面板",
      value: "图表",
      icon: BarChart3,
      href: "/home/blog/admin/dashboard",
      desc: "站点数据分析",
    },
    {
      label: "审核管理",
      value: user.role === "super_admin" ? "超级" : "待审",
      icon: ClipboardCheck,
      href: "/home/blog/admin/reviews",
      desc: "改名审核与文章管理",
    },
    {
      label: user.role === "super_admin" ? "超级管理员" : "管理员",
      value: user.username,
      icon: user.role === "super_admin" ? Crown : Shield,
      href: "#",
      desc: `当前登录: ${user.username}`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-foreground">管理后台</h1>
        <p className="mt-2 text-muted">博客系统管理与维护</p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                href={card.href}
                className="gradient-border rounded-xl p-[1px]"
              >
                <div className="rounded-xl bg-surface p-6 hover:bg-surface-alt transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                      <Icon size={20} className="text-neon-cyan" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {card.value}
                      </div>
                      <div className="text-sm text-muted">{card.label}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="mt-10">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">快捷操作</h2>
          <div className="space-y-2">
            <Link
              href="/home/blog/admin/users"
              className="block px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
            >
              → 用户管理 — 查看、编辑、删除用户
            </Link>
            <Link
              href="/home/blog/admin/reviews"
              className="block px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
            >
              → 审核管理 — 改名审核、用户文章管理
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
