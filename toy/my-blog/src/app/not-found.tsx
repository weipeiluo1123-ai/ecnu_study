"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950 px-6">
      <div className="text-8xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-4">
        404
      </div>
      <p className="text-purple-200/60 mb-8">这里好像什么都没有...</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
      >
        回到首页
      </Link>
    </div>
  );
}
