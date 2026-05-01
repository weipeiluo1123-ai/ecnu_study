"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { LogIn, ArrowRight, Loader2 } from "lucide-react";

const symbols = ["✦", "✧", "⋆", "·", "✿", "❀", "◌", "˚"];

function SparkleBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 25 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 14 + 8}px`,
            color: ["#f472b6", "#c084fc", "#67e8f9", "#fb923c", "#fbbf24"][i % 5],
          }}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.65, 0.15], scale: [0.8, 1.15, 0.8], rotate: [0, 180, 360] }}
          transition={{ duration: 3 + Math.random() * 4, delay: Math.random() * 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {symbols[i % symbols.length]}
        </motion.span>
      ))}
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[
        { bg: "from-violet-400/20 to-pink-400/15", size: 300, left: "10%", top: "20%" },
        { bg: "from-sky-400/15 to-cyan-400/10", size: 250, left: "75%", top: "60%" },
        { bg: "from-amber-400/15 to-rose-400/20", size: 350, left: "50%", top: "40%" },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${orb.bg} blur-3xl`}
          style={{ width: orb.size, height: orb.size, left: orb.left, top: orb.top }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/home/blog";

  useEffect(() => {
    if (user && !authLoading) router.replace(redirect);
  }, [user, authLoading, router, redirect]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast("error", "请输入用户名和密码");
      return;
    }
    setLoading(true);
    const err = await login(username.trim(), password);
    setLoading(false);
    if (err) {
      addToast("error", err);
    } else {
      addToast("success", "登录成功！");
      setTimeout(() => router.push(redirect), 600);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-rose-50">
        <div className="animate-pulse text-lg tracking-widest text-violet-300">✦</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-rose-50 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-50/50" />
      <FloatingOrbs />
      <SparkleBg />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 via-pink-400 to-amber-300 p-[3px] shadow-xl shadow-violet-200/50"
            animate={{ boxShadow: ["0 0 30px rgba(167,139,250,0.3)", "0 0 50px rgba(244,114,182,0.35)", "0 0 30px rgba(167,139,250,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <LogIn size={28} className="text-violet-500" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-800">欢迎回来</h1>
          <p className="mt-2 text-slate-400">登录你的 WPL Space 账号</p>
        </div>

        <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl shadow-violet-200/20 border border-white/80 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">用户名</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                placeholder="输入用户名" autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">密码</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                placeholder="输入密码" autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold hover:from-violet-600 hover:to-pink-600 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-60 cursor-pointer">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (<><span>登录</span><ArrowRight size={18} /></>)}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-400 text-center">
            还没有账号？ <Link href="/auth/register" className="text-violet-500 hover:text-violet-600 font-medium">注册</Link>
          </p>
        </div>
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-300 hover:text-slate-400 transition-colors">← 返回引导页</Link>
        </div>
      </motion.div>
    </div>
  );
}
