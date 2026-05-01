"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { UserPlus, Send, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { register, sendCode } = useAuth();
  const router = useRouter();

  async function handleSendCode() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请先输入正确的邮箱地址");
      return;
    }
    setError("");
    setCodeSending(true);
    const err = await sendCode(email);
    setCodeSending(false);
    if (err) {
      setError(err);
    } else {
      setCodeSent(true);
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const err = await register(username, email, password, code);
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
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setCodeSent(false); }}
                      className="flex-1 bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={codeSending || cooldown > 0}
                      className="shrink-0 px-4 py-2.5 rounded-lg bg-neon-purple/20 text-neon-purple border border-neon-purple/20 hover:bg-neon-purple/30 transition-colors disabled:opacity-50 text-sm cursor-pointer whitespace-nowrap"
                    >
                      {codeSending ? (
                        "发送中..."
                      ) : cooldown > 0 ? (
                        `${cooldown}s`
                      ) : codeSent ? (
                        <span className="flex items-center gap-1"><Send size={14} />重发</span>
                      ) : (
                        <span className="flex items-center gap-1"><Send size={14} />发送验证码</span>
                      )}
                    </button>
                  </div>
                </div>

                {codeSent && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      验证码
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors tracking-[8px] text-center text-lg font-mono"
                        placeholder="000000"
                        required
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                      {code.length === 6 && (
                        <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">6 位验证码，5 分钟内有效</p>
                  </div>
                )}

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
                  disabled={loading || !codeSent}
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
