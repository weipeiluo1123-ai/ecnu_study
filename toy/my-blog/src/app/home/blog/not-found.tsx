import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-6xl font-bold text-neon-cyan glitch" data-text="404">
        404
      </h1>
      <p className="mt-4 text-xl text-muted">页面未找到</p>
      <p className="mt-2 text-sm text-muted">你访问的页面不存在或已被移除</p>
      <Link
        href="/home/blog"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-all"
      >
        返回首页
      </Link>
    </div>
  );
}
