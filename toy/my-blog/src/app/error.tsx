"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950 px-6 text-center">
          <div className="text-8xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-4">
            500
          </div>
          <p className="text-purple-200/60 mb-2 text-lg">服务器出了点问题</p>
          <p className="text-purple-200/40 text-sm mb-8">
            {error.message || "发生了意外的错误，请稍后重试"}
          </p>
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              重试
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-purple-400/30 text-purple-200 hover:bg-purple-500/10 transition-all duration-300"
            >
              回到首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
