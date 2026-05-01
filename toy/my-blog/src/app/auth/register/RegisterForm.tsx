"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { UserPlus, ArrowRight, Loader2, CheckCircle } from "lucide-react";

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
        { bg: "from-emerald-400/20 to-teal-400/15", size: 300, left: "10%", top: "20%" },
        { bg: "from-violet-400/15 to-pink-400/10", size: 250, left: "75%", top: "60%" },
        { bg: "from-sky-400/15 to-amber-400/15", size: 350, left: "50%", top: "40%" },
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

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { register, sendCode, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user && !authLoading) router.replace("/home/blog");
  }, [user, authLoading, router]);

  async function handleSendCode() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast("error", "请先输入正确的邮箱地址");
      return;
    }
    setCodeSending(true);
    const err = await sendCode(email);
    setCodeSending(false);
    if (err) {
      addToast("error", err);
    } else {
      setCodeSent(true);
      addToast("success", "验证码已发送");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !code) {
      addToast("error", "请填写所有字段");
      return;
    }
    setLoading(true);
    const err = await register(username.trim(), email.trim(), password, code);
    setLoading(false);
    if (err) {
      addToast("error", err);
    } else {
      addToast("success", "注册成功！");
      setTimeout(() => router.push("/home/blog"), 800);
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-rose-50 px-4 py-12">
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
            className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-[3px] shadow-xl shadow-emerald-200/50"
            animate={{ boxShadow: ["0 0 30px rgba(52,211,153,0.3)", "0 0 50px rgba(34,211,238,0.35)", "0 0 30px rgba(52,211,153,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <UserPlus size={28} className="text-emerald-500" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-800">创建账号</h1>
          <p className="mt-2 text-slate-400">加入 WPL Space，探索更多项目</p>
        </div>

        <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl shadow-emerald-200/20 border border-white/80 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">用户名</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="2-20 个字符" minLength={2} maxLength={20} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">邮箱</label>
              <div className="flex gap-2">
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setCodeSent(false); }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="your@email.com" />
                <button type="button" onClick={handleSendCode} disabled={codeSending || cooldown > 0}
                  className="shrink-0 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer">
                  {codeSending ? "发送中" : cooldown > 0 ? `${cooldown}s` : codeSent ? "重发" : "发送验证码"}
                </button>
              </div>
            </div>
            {codeSent && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">验证码</label>
                <div className="relative">
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-center text-lg font-mono tracking-[8px] outline-none focus:border-emerald-400 transition-all"
                    placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" />
                  {code.length === 6 && <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-1">6 位验证码，5 分钟内有效</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">密码</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="至少 6 个字符" minLength={6} />
            </div>
            <button type="submit" disabled={loading || !codeSent}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 cursor-pointer mt-6">
              {loading ? <Loader2 size={18} className="animate-spin" /> : (<><span>注册</span><ArrowRight size={18} /></>)}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-400 text-center">
            已有账号？ <Link href="/auth/login" className="text-emerald-500 hover:text-emerald-600 font-medium">登录</Link>
          </p>
        </div>
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-300 hover:text-slate-400 transition-colors">← 返回引导页</Link>
        </div>
      </motion.div>
    </div>
  );
}
