"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export function BackToHome() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link
        href="/"
        className="group flex items-center gap-2 px-4 py-2.5 rounded-full
                   bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500
                   text-white text-sm font-medium shadow-lg shadow-violet-500/25
                   hover:shadow-xl hover:shadow-violet-500/40
                   transition-all duration-300 hover:scale-105
                   backdrop-blur-none hover:backdrop-blur-xl hover:bg-white/20"
        title="返回主页面"
      >
        <Home size={16} className="group-hover:animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 whitespace-nowrap">
          主页面
        </span>
      </Link>
    </motion.div>
  );
}
