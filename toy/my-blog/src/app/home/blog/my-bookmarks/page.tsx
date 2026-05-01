import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/index";
import { bookmarks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getAllPosts } from "@/lib/posts";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Pagination } from "@/components/ui/Pagination";
import { Bookmark, Calendar, ArrowLeft, FileText } from "lucide-react";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "我的收藏",
  description: "查看我收藏的文章",
};

interface Props {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function MyBookmarksPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(sp.pageSize || "10", 10) || 10));
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const rows = db.select({
    id: bookmarks.id,
    postSlug: bookmarks.postSlug,
    createdAt: bookmarks.createdAt,
  })
    .from(bookmarks)
    .where(eq(bookmarks.userId, session.id))
    .orderBy(desc(bookmarks.createdAt))
    .all();

  // Build slug → title/description map from all posts
  const allPosts = getAllPosts();
  const postMap = new Map(allPosts.map(p => [p.slug, { title: p.title, description: p.description }]));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/home/blog"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Bookmark size={28} className="text-neon-cyan" />
          <h1 className="text-3xl font-bold text-foreground">我的收藏</h1>
        </div>
        <p className="text-muted">
          共收藏了 {rows.length} 篇文章
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8">
        {rows.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark size={48} className="mx-auto text-muted/30 mb-4" />
            <p className="text-muted">还没有收藏任何文章</p>
            <Link
              href="/home/blog/posts"
              className="inline-block mt-4 text-sm text-neon-cyan hover:underline"
            >
              浏览文章
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {rows.slice((page - 1) * pageSize, page * pageSize).map((bm, i) => {
                const info = postMap.get(bm.postSlug);
                return (
                  <Link
                    key={bm.id}
                    href={`/posts/${bm.postSlug}`}
                    className="block rounded-xl border border-border bg-surface p-4 hover:border-neon-cyan/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground hover:text-neon-cyan transition-colors">
                          {info?.title || bm.postSlug}
                        </h3>
                        {info?.description && (
                          <p className="text-sm text-muted mt-1 line-clamp-1">{info.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                          <Calendar size={12} />
                          <span>收藏于 {formatDate(bm.createdAt)}</span>
                        </div>
                      </div>
                      <FileText size={16} className="shrink-0 mt-1 text-muted" />
                    </div>
                  </Link>
                );
              })}
            </div>
            <Pagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(rows.length / pageSize))}
              basePath="/my-bookmarks"
              pageSize={pageSize}
              showSizeSelector
            />
          </>
        )}
      </AnimatedSection>
    </div>
  );
}
