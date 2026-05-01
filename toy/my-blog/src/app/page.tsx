"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, ExternalLink, Mail, Sparkles } from "lucide-react";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 3,
}));

function FloatingParticle({ x, y, size, delay, duration }: { x: number; y: number; size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(255,182,255,0.6), rgba(180,220,255,0.3))",
      }}
      animate={{
        y: [-20, 20, -20],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl tracking-widest text-pink-300">✦ WPL ✦</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950">
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(p => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      {/* Large decorative circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Logo / Avatar */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-300 p-[3px] shadow-2xl shadow-purple-500/30">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-pink-300 to-cyan-300 bg-clip-text text-transparent">
              W
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Hello, I&apos;m WPL
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-purple-200/70 max-w-lg mb-12 leading-relaxed"
        >
          一个喜欢写代码、打算法竞赛、看番的开发者。
          <br />
          这里是我的个人空间。
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <a
            href="/home"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
          >
            <BookOpen size={18} />
            <span>进入博客</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://github.com/weipeiluo1123-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-purple-400/30 text-purple-200 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-300"
          >
            <ExternalLink size={18} />
            <span>GitHub</span>
          </a>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full"
        >
          {[
            { label: "文章", href: "/posts", icon: BookOpen },
            { label: "分类", href: "/categories", icon: Sparkles },
            { label: "排行榜", href: "/leaderboard", icon: ArrowRight },
            { label: "联系", href: "mailto:i@weipeiluo.space", icon: Mail },
          ].map((link, i) => {
            const Icon = link.icon;
            return (
              <a
                key={i}
                href={link.href}
                className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-300 backdrop-blur-sm"
              >
                <Icon size={16} className="text-purple-300 group-hover:text-pink-300 transition-colors" />
                <span className="text-sm text-purple-200/80 group-hover:text-white transition-colors">{link.label}</span>
              </a>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 text-xs text-purple-300/30"
        >
          © {new Date().getFullYear()} WPL Space. Built with love.
        </motion.p>
      </div>
    </div>
  );
}
