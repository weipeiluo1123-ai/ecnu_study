import Link from "next/link";
import { BLOG_TITLE, CATEGORIES, TAGS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/home" className="text-lg font-bold tracking-tight">
              <span className="text-neon-cyan">NEXUS</span>
              <span className="text-foreground">.</span>
            </Link>
            <p className="mt-2 text-sm text-muted max-w-sm">
              个人技术博客，专注于 Web 开发、系统设计与 AI 应用。记录学习，分享思考。
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">分类</h3>
            <ul className="space-y-1.5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-muted hover:text-neon-cyan transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">链接</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/leaderboard" className="text-sm text-muted hover:text-neon-cyan transition-colors">
                  排行榜
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-muted hover:text-neon-cyan transition-colors">
                  搜索文章
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-sm text-muted hover:text-neon-cyan transition-colors">
                  标签云
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-muted hover:text-neon-cyan transition-colors">
                  登录 / 注册
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} {BLOG_TITLE}. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            基于 Next.js · Framer Motion · Tailwind CSS 构建
          </p>
        </div>
      </div>
    </footer>
  );
}
