"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowLeft, Shield, User, Ban, Trash2, ToggleLeft, ToggleRight, Crown } from "lucide-react";
import Link from "next/link";

interface UserData {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  permissions: string;
  bio: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [fetching, setFetching] = useState(true);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        if (res.status === 403) router.push("/auth/login");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      addToast("error", "加载失败");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (user?.role !== "admin" && user?.role !== "super_admin") {
      router.push("/home/blog");
      return;
    }
    fetchUsers();
  }, [user, loading, router]);

  async function togglePermission(userId: number, perm: string, current: boolean) {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const perms = JSON.parse(target.permissions || "{}");
    perms[perm] = !current;

    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permissions: perms }),
    });

    if (res.ok) fetchUsers();
  }

  async function toggleRole(userId: number, currentRole: string) {
    if (userId === user?.id) return;
    if (currentRole === "super_admin") {
      addToast("error", "不能修改超级管理员");
      return;
    }
    const newRole = currentRole === "admin" ? "user" : "admin";

    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (res.ok) fetchUsers();
  }

  async function deleteUser(userId: number, username: string, role: string) {
    if (userId === user?.id) {
      addToast("error", "不能删除自己");
      return;
    }
    if (role === "super_admin") {
      addToast("error", "不能删除超级管理员");
      return;
    }
    if (!confirm(`确定删除用户 "${username}"？此操作不可恢复。`)) return;

    const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  }

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 mt-8 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/home/blog/admin"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          返回后台
        </Link>
        <h1 className="text-3xl font-bold text-foreground">用户管理</h1>
        <p className="mt-2 text-muted">共 {users.length} 个注册用户</p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted font-medium">ID</th>
                <th className="text-left py-3 px-4 text-muted font-medium">用户名</th>
                <th className="text-left py-3 px-4 text-muted font-medium">邮箱</th>
                <th className="text-left py-3 px-4 text-muted font-medium">角色</th>
                <th className="text-left py-3 px-4 text-muted font-medium">可评论</th>
                <th className="text-left py-3 px-4 text-muted font-medium">可点赞</th>
                <th className="text-left py-3 px-4 text-muted font-medium">注册时间</th>
                <th className="text-right py-3 px-4 text-muted font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                let perms: Record<string, boolean> = {};
                try { perms = JSON.parse(u.permissions || "{}"); } catch { /* corrupt data */ }
                return (
                  <tr key={u.id} className="border-b border-border hover:bg-surface-alt/50 transition-colors">
                    <td className="py-3 px-4 text-muted">{u.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-medium">
                          {u.username.charAt(0)}
                        </div>
                        <span className="text-foreground">{u.username}</span>
                        {u.id === user?.id && (
                          <span className="text-xs text-muted">(你)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          u.role === "super_admin"
                            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                            : u.role === "admin"
                            ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                            : "bg-surface-alt text-muted border border-border"
                        }`}
                      >
                        {u.role === "super_admin" ? <Crown size={12} /> : u.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                        {u.role === "super_admin" ? "超级管理员" : u.role === "admin" ? "管理员" : "用户"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePermission(u.id, "canComment", perms.canComment !== false)}
                        className="cursor-pointer"
                        disabled={u.id === user?.id}
                      >
                        {perms.canComment !== false ? (
                          <ToggleRight size={20} className="text-neon-green" />
                        ) : (
                          <ToggleLeft size={20} className="text-muted" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePermission(u.id, "canLike", perms.canLike !== false)}
                        className="cursor-pointer"
                        disabled={u.id === user?.id}
                      >
                        {perms.canLike !== false ? (
                          <ToggleRight size={20} className="text-neon-green" />
                        ) : (
                          <ToggleLeft size={20} className="text-muted" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-muted text-xs">
                      {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role === "super_admin" && (
                          <button
                            onClick={() => toggleRole(u.id, u.role)}
                            disabled={u.id === user?.id}
                            className="p-1.5 rounded-md text-muted hover:text-neon-cyan transition-colors disabled:opacity-30 cursor-pointer"
                            title={u.id === user?.id ? "不能修改自己" : "切换角色"}
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(u.id, u.username, u.role)}
                          disabled={u.id === user?.id || u.role === "super_admin"}
                          className="p-1.5 rounded-md text-muted hover:text-red-400 transition-colors disabled:opacity-30 cursor-pointer"
                          title={u.id === user?.id ? "不能删除自己" : "删除用户"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AnimatedSection>
    </div>
  );
}
