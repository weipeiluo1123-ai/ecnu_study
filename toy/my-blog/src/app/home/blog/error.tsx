"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-7xl font-bold text-neon-cyan glitch" data-text="500">
        500
      </h1>
      <p className="mt-4 text-xl text-muted">页面加载异常</p>
      <p className="mt-2 text-sm text-muted/60 max-w-md">
        {error.message || "发生了意外的错误，请稍后重试"}
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-all cursor-pointer shadow-lg shadow-neon-cyan/20"
        >
          重试
        </button>
        <Link
          href="/home/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-medium hover:border-neon-cyan/50 transition-all"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
