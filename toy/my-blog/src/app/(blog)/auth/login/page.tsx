"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const err = await login(username, password);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <AnimatedSection>
        <div className="w-full max-w-md">
          <div className="gradient-border rounded-2xl p-[1px]">
            <div className="rounded-2xl bg-surface p-8">
              <div className="flex items-center gap-2 mb-6">
                <LogIn size={24} className="text-neon-cyan" />
                <h1 className="text-2xl font-bold text-foreground">登录</h1>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
                    placeholder="输入用户名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
                    placeholder="输入密码"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "登录中..." : "登录"}
                </button>
              </form>

              <p className="mt-4 text-sm text-muted text-center">
                还没有账号？{" "}
                <Link href="/auth/register" className="text-neon-cyan hover:underline">
                  注册
                </Link>
              </p>

              <p className="mt-2 text-xs text-muted text-center">
                默认管理员: admin / admin123
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
