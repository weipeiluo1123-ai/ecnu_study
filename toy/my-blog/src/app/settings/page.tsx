"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowLeft, User, Save, Crown, Mail, BookOpen, Trophy, TrendingUp, Calendar, AlertCircle, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export default function SettingsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<{
    user: { username: string; email: string; bio: string | null; createdAt: string };
    stats: { totalScore: number; weeklyScore: number; monthlyScore: number; postCount: number };
  } | null>(null);
  const [fetching, setFetching] = useState(true);
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setNewName(user.username);
    loadProfile();
  }, [user, loading, router]);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setBio(data.user.bio || "");
      }
    } catch {} finally {
      setFetching(false);
    }
  }

  async function handleNameChange(e: React.FormEvent) {
    e.preventDefault();
    if (!user || newName.trim() === user.username) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/name-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "改名成功！" });
        await refresh();
        loadProfile();
      } else {
        setMessage({ type: "error", text: data.error || "改名失败" });
        setNewName(user.username);
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveBio() {
    setSavingBio(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "个人简介已更新" });
        loadProfile();
      } else {
        setMessage({ type: "error", text: "保存失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setSavingBio(false);
    }
  }

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 mt-8 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>
        <h1 className="text-3xl font-bold text-foreground">个人设置</h1>
        <p className="mt-2 text-muted">管理你的个人资料信息</p>
      </AnimatedSection>

      {message && (
        <AnimatedSection delay={0.05} className="mt-6">
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        </AnimatedSection>
      )}

      {/* Profile Overview */}
      <AnimatedSection delay={0.08} className="mt-6">
        <div className="gradient-border rounded-2xl p-[1px]">
          <div className="rounded-2xl bg-surface p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 ${
                user?.role === "super_admin"
                  ? "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-[0_0_16px_rgba(251,191,36,0.5)]"
                  : "bg-neon-cyan/20 text-neon-cyan"
              }`}>
                {user?.role === "super_admin" ? <Crown size={28} /> : user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{profileData?.user.username || user?.username}</h2>
                  {user?.role === "super_admin" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">超级管理员</span>
                  )}
                  {user?.role === "admin" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20">管理员</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted mt-1">
                  <Mail size={14} />
                  {profileData?.user.email || user?.email}
                </div>
                <p className="text-xs text-muted mt-0.5">加入于 {formatDate(profileData?.user.createdAt || "")}</p>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-400/5 to-orange-600/5 border border-amber-400/20">
                <Trophy size={20} className="mx-auto text-amber-400 mb-1" />
                <div className="text-xl font-bold text-foreground">{profileData?.stats.totalScore ?? 0}</div>
                <div className="text-[11px] text-muted mt-0.5">总积分</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
                <Calendar size={20} className="mx-auto text-neon-cyan mb-1" />
                <div className="text-xl font-bold text-foreground">{profileData?.stats.monthlyScore ?? 0}</div>
                <div className="text-[11px] text-muted mt-0.5">月积分</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/20">
                <TrendingUp size={20} className="mx-auto text-neon-purple mb-1" />
                <div className="text-xl font-bold text-foreground">{profileData?.stats.weeklyScore ?? 0}</div>
                <div className="text-[11px] text-muted mt-0.5">周积分</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                <FileText size={20} className="mx-auto text-neon-green mb-1" />
                <div className="text-xl font-bold text-foreground">{profileData?.stats.postCount ?? 0}</div>
                <div className="text-[11px] text-muted mt-0.5">文章数</div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Bio / Interests */}
      <AnimatedSection delay={0.12} className="mt-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-neon-cyan" />
            个人简介
          </h2>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-y text-sm"
            placeholder="介绍一下你自己、你的技术兴趣和爱好..."
          />
          <button
            onClick={handleSaveBio}
            disabled={savingBio}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan text-background text-sm font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {savingBio ? "保存中..." : "保存简介"}
          </button>
        </div>
      </AnimatedSection>

      {/* Username Change */}
      <AnimatedSection delay={0.16} className="mt-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User size={18} className="text-neon-cyan" />
            修改用户名
          </h2>
          <form onSubmit={handleNameChange} className="space-y-3">
            <div>
              <label className="block text-sm text-muted mb-1">当前用户名</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-alt border border-border text-foreground focus:outline-none focus:border-neon-cyan transition-colors text-sm"
                placeholder="输入新用户名"
                minLength={2}
                maxLength={20}
                required
              />
              <p className="text-xs text-muted mt-1">修改后立即生效，管理员可在后台审核并回滚</p>
            </div>
            <button
              type="submit"
              disabled={submitting || !newName || newName.trim() === user?.username}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan text-background text-sm font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              {submitting ? "提交中..." : "保存修改"}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
}
