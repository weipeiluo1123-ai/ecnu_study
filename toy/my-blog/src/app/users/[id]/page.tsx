import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/index";
import { users, userPosts, comments } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Calendar, MessageSquare, FileText, ArrowLeft, Shield, User, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { formatDate } from "@/lib/format";
import { getAllPosts } from "@/lib/posts";
import { Pagination } from "@/components/ui/Pagination";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function UserProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(sp.pageSize || "10", 10) || 10));
  const userId = parseInt(id);
  if (!userId) notFound();

  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) notFound();

  // Get user_posts (DB posts)
  const dbPosts = db.select()
    .from(userPosts)
    .where(and(eq(userPosts.authorId, userId), eq(userPosts.isPublished, true as any)))
    .orderBy(desc(userPosts.createdAt))
    .all();

  // Get MDX posts where author matches this user's username
  const dbPostSlugs = new Set(dbPosts.map(p => p.slug));
  const allMdxPosts = getAllPosts();
  const userMdxPosts = allMdxPosts
    .filter(p => p.authorId === userId && !dbPostSlugs.has(p.slug))
    .map(p => ({
      id: 0,
      title: p.title,
      slug: p.slug,
      description: p.description,
      createdAt: p.date,
      likesCount: 0,
      viewsCount: 0,
      isPublished: true,
      isMdx: true as const,
    }));

  // Combine and sort by date
  const allPosts = [
    ...dbPosts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description || "",
      createdAt: p.createdAt,
      likesCount: p.likesCount,
      viewsCount: p.viewsCount,
      isPublished: p.isPublished,
      isMdx: false as const,
    })),
    ...userMdxPosts,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const userComments = db.select({
    id: comments.id,
    content: comments.content,
    postSlug: comments.postSlug,
    createdAt: comments.createdAt,
  })
    .from(comments)
    .where(eq(comments.authorId, userId))
    .orderBy(desc(comments.createdAt))
    .limit(20)
    .all();

  const postCount = allPosts.length;
  const commentCount = userComments.length;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>
      </AnimatedSection>

      {/* Profile Header */}
      <AnimatedSection delay={0.05}>
        <div className="gradient-border rounded-2xl p-[1px]">
          <div className="rounded-2xl bg-surface p-8">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 ${
                user.role === "super_admin"
                  ? "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-[0_0_16px_rgba(251,191,36,0.5)]"
                  : "bg-neon-cyan/20 text-neon-cyan"
              }`}>
                {user.role === "super_admin" ? (
                  <Crown size={28} />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    user.role === "super_admin"
                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                      : user.role === "admin"
                      ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                      : "bg-surface-alt text-muted border border-border"
                  }`}>
                    {user.role === "super_admin" ? <Crown size={12} /> : user.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                    {user.role === "super_admin" ? "超级管理员" : user.role === "admin" ? "管理员" : "用户"}
                  </span>
                </div>
                {user.bio && (
                  <p className="mt-1 text-sm text-muted">{user.bio}</p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    加入于 {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={0.1} className="mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <FileText size={20} className="mx-auto text-neon-cyan mb-1" />
            <div className="text-2xl font-bold text-foreground">{postCount}</div>
            <div className="text-xs text-muted">文章</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <MessageSquare size={20} className="mx-auto text-neon-cyan mb-1" />
            <div className="text-2xl font-bold text-foreground">{commentCount}</div>
            <div className="text-xs text-muted">评论</div>
          </div>
        </div>
      </AnimatedSection>

      {/* User's Posts */}
      {allPosts.length > 0 && (
        <AnimatedSection delay={0.15} className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">发布的文章</h2>
          <div className="space-y-3">
            {allPosts.slice((page - 1) * pageSize, page * pageSize).map((post, i) => (
              <Link
                key={post.isMdx ? `mdx-${post.slug}` : `db-${post.id}`}
                href={`/posts/${post.slug}`}
                className="block rounded-xl border border-border bg-surface p-4 hover:border-neon-cyan/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground hover:text-neon-cyan transition-colors">
                      {post.title}
                      {post.isMdx && (
                        <span className="ml-2 text-[10px] text-neon-cyan/60">MDX</span>
                      )}
                    </h3>
                    <p className="text-sm text-muted mt-1 line-clamp-1">{post.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      <span>{formatDate(post.createdAt)}</span>
                      {!post.isMdx && (
                        <>
                          <span>❤ {post.likesCount}</span>
                          <span>👁 {post.viewsCount}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {user.role === "super_admin" && (
                    <div className="shrink-0 mt-1">
                      <Crown size={16} className="text-amber-400" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(allPosts.length / pageSize))}
            basePath={`/users/${userId}`}
            pageSize={pageSize}
            showSizeSelector
          />
        </AnimatedSection>
      )}

      {/* User's Comments */}
      {userComments.length > 0 && (
        <AnimatedSection delay={0.2} className="mt-8 mb-20">
          <h2 className="text-lg font-semibold text-foreground mb-4">最近的评论</h2>
          <div className="space-y-3">
            {userComments.map((c) => (
              <Link
                key={c.id}
                href={`/posts/${c.postSlug}`}
                className="block rounded-xl border border-border bg-surface p-4 hover:border-neon-cyan/30 transition-colors"
              >
                <p className="text-sm text-foreground line-clamp-2">{c.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <span>{formatDate(c.createdAt)}</span>
                  <span>→ 跳转到文章</span>
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Empty state */}
      {postCount === 0 && commentCount === 0 && (
        <AnimatedSection delay={0.15} className="mt-10 text-center py-10">
          <p className="text-muted">该用户还没有任何内容</p>
        </AnimatedSection>
      )}
    </div>
  );
}
