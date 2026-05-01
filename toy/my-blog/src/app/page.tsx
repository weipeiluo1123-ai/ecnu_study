"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

// ═══════════════════════════════════════════════════════
// Floating decorations
// ═══════════════════════════════════════════════════════

function FloatingOrbs() {
  const orbs = [
    { color: "from-violet-400/30 to-pink-400/20", size: 300, left: "10%", top: "20%", delay: 0 },
    { color: "from-sky-400/25 to-cyan-400/15", size: 250, left: "75%", top: "15%", delay: 2 },
    { color: "from-amber-400/20 to-rose-400/25", size: 350, left: "50%", top: "60%", delay: 4 },
    { color: "from-emerald-400/20 to-teal-400/15", size: 200, left: "85%", top: "70%", delay: 1 },
    { color: "from-pink-400/25 to-fuchsia-400/20", size: 280, left: "20%", top: "75%", delay: 3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} blur-3xl`}
          style={{ width: orb.size, height: orb.size, left: orb.left, top: orb.top }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function SparkleTrail() {
  const symbols = ["✦", "✧", "⋆", "·", "✿", "❀", "◌", "˚", "✧", "✦"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 14 + 8}px`,
            color: [
              "#f472b6", "#c084fc", "#67e8f9", "#fb923c",
              "#fbbf24", "#a78bfa", "#f9a8d4", "#7dd3fc",
            ][i % 8],
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.1, 0.7, 0.1],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            delay: Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {symbols[i % symbols.length]}
        </motion.span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Coming soon projects
// ═══════════════════════════════════════════════════════

const upcoming = [
  { title: "Algorithm Lab", emoji: "🧩", color: "#38bdf8" },
  { title: "AI Playground", emoji: "🤖", color: "#34d399" },
  { title: "Project Gallery", emoji: "🎨", color: "#f472b6" },
  { title: "Reading Notes", emoji: "📚", color: "#fbbf24" },
  { title: "Dev Toolkit", emoji: "🛠", color: "#fb923c" },
];

// ═══════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════

export default function LandingPage() {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-rose-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-50/50" />
      <FloatingOrbs />
      <SparkleTrail />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          {/* Avatar */}
          <motion.div
            className="mx-auto mb-8 w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 via-pink-400 to-amber-300 p-[3px] shadow-xl shadow-violet-200/50"
            animate={{ boxShadow: [
              "0 0 30px rgba(167,139,250,0.3)",
              "0 0 50px rgba(244,114,182,0.4)",
              "0 0 30px rgba(167,139,250,0.3)",
            ]}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-violet-500 to-pink-500 bg-clip-text text-transparent">
              W
            </div>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-800 tracking-tight leading-none">
            Weipei Luo
          </h1>

          <p className="mt-4 text-xl md:text-2xl text-slate-400 font-light tracking-wide">
            全栈开发者 · 算法 · ACG
          </p>

          {/* Auth state */}
          <div className="mt-8 flex items-center justify-center gap-3">
            {user ? (
              <>
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 text-sm text-slate-600">
                  <User size={16} />
                  {user.username}
                </span>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm text-slate-500 transition-colors cursor-pointer"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-105"
              >
                <LogIn size={16} />
                登录 / 注册
              </Link>
            )}
          </div>
        </motion.div>

        {/* ── Featured: Nexus Blog ── */}
        <motion.a
          href="/home/blog"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl shadow-violet-200/30 border border-white/80 p-8 cursor-pointer mb-12"
        >
          {/* Animated background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/0 via-pink-400/0 to-amber-400/0 group-hover:from-violet-400/10 group-hover:via-pink-400/8 group-hover:to-amber-400/10 transition-all duration-700" />

          <div className="relative z-10 flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-400/30">
              <BookOpen size={26} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-800">Nexus Blog</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">已上线</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                个人技术博客 — 前端 · 后端 · AI · 系统设计。记录思考与代码，探索知识的边界。
              </p>
            </div>

            <ArrowRight size={20} className="shrink-0 mt-3 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.a>

        {/* ── Upcoming Projects ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-center w-full max-w-2xl"
        >
          <p className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase mb-6">
            即将上线
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {upcoming.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm cursor-default"
              >
                <span className="text-base">{item.emoji}</span>
                <span className="text-sm text-slate-500 font-medium">{item.title}</span>
                <span className="w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: item.color }} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-slate-200 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-slate-300" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
