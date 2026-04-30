"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const err = await register(username, email, password);
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
                <UserPlus size={24} className="text-neon-cyan" />
                <h1 className="text-2xl font-bold text-foreground">注册</h1>
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
                    placeholder="2-20 个字符"
                    required
                    minLength={2}
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
                    placeholder="your@email.com"
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
                    placeholder="至少 6 个字符"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "注册中..." : "注册"}
                </button>
              </form>

              <p className="mt-4 text-sm text-muted text-center">
                已有账号？{" "}
                <Link href="/auth/login" className="text-neon-cyan hover:underline">
                  登录
                </Link>
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
