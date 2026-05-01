import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag, User, Crown } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TagBadge } from "@/components/ui/TagBadge";
import { CommentSection } from "@/components/comments/CommentSection";
import { LikeButton } from "@/components/ui/LikeButton";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ViewCounter } from "@/components/ui/ViewCounter";
import { PostActions } from "@/components/ui/PostActions";
import { db } from "@/lib/db/index";
import { userPosts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Only pre-render MDX slugs, user posts are dynamic
  const mdxSlugs = getPostSlugs().map((slug) => ({ slug: slug.replace(/\.(md|mdx)$/, "") }));
  return mdxSlugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Check MDX first
  const mdxPost = getPostBySlug(slug);
  if (mdxPost) {
    return { title: mdxPost.title, description: mdxPost.description };
  }
  // Check user posts
  const userPost = db.select().from(userPosts).where(eq(userPosts.slug, slug)).get();
  if (userPost) {
    return { title: userPost.title, description: userPost.description || userPost.title };
  }
  return {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  // Try MDX post first
  const mdxPost = getPostBySlug(slug);
  if (mdxPost) {
    return renderMDXPost(mdxPost, slug);
  }

  // Fallback to user post from database
  const userPost = db.select({
    id: userPosts.id,
    title: userPosts.title,
    content: userPosts.content,
    description: userPosts.description,
    category: userPosts.category,
    tags: userPosts.tags,
    authorId: userPosts.authorId,
    isPublished: userPosts.isPublished,
    createdAt: userPosts.createdAt,
    viewsCount: userPosts.viewsCount,
    likesCount: userPosts.likesCount,
    bookmarksCount: userPosts.bookmarksCount,
    authorUsername: users.username,
    authorRole: users.role,
  })
    .from(userPosts)
    .leftJoin(users, eq(userPosts.authorId, users.id))
    .where(eq(userPosts.slug, slug))
    .get();

  if (!userPost) notFound();
  if (!userPost.isPublished) notFound();

  const tags = JSON.parse(userPost.tags || "[]");

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          返回文章列表
        </Link>

        <header>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
              {userPost.category}
            </span>
            {!userPost.isPublished && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                未发布
              </span>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2">
            <Link
              href={`/users/${userPost.authorId}`}
              className="flex items-center gap-2 text-sm text-muted hover:text-neon-cyan transition-colors"
            >
              {userPost.authorRole === "super_admin" ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                  <Crown size={14} className="text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-medium">
                  {userPost.authorUsername?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <span>{userPost.authorUsername || "已注销"}</span>
              {userPost.authorRole === "super_admin" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">超级管理员</span>
              )}
            </Link>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {userPost.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(userPost.createdAt)}
            </span>
            <ViewCounter postSlug={slug} />
            <LikeButton postSlug={slug} />
            <BookmarkButton postSlug={slug} />
          </div>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-muted" />
              {tags.map((tag: string) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          )}
        </header>
      </AnimatedSection>

      {/* Content */}
      <AnimatedSection delay={0.1} className="mt-10">
        <div className="prose-custom max-w-none prose prose-lg dark:prose-invert">
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">
            {userPost.content}
          </div>
        </div>
      </AnimatedSection>

      {/* Bottom action bar */}
      <PostActions postSlug={slug} />

      <CommentSection postSlug={slug} />
    </article>
  );
}

async function renderMDXPost(post: any, slug: string) {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          返回文章列表
        </Link>

        <header>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Link
              href={`/categories/${post.category}`}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
            >
              {post.category}
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {post.authorId ? (
              <Link
                href={`/users/${post.authorId}`}
                className="flex items-center gap-2 text-sm text-muted hover:text-neon-cyan transition-colors"
              >
                {post.authorRole === "super_admin" ? (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                    <Crown size={14} className="text-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-medium">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{post.author}</span>
                {post.authorRole === "super_admin" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">超级管理员</span>
                )}
              </Link>
            ) : (
              <span className="flex items-center gap-2 text-sm text-muted">
                <User size={16} />
                {post.author}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.date)}
            </span>
            <ViewCounter postSlug={slug} />
            <LikeButton postSlug={slug} />
            <BookmarkButton postSlug={slug} />
          </div>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-muted" />
              {post.tags.map((tag: string) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          )}
        </header>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-10">
        <div className="prose-custom max-w-none prose prose-lg dark:prose-invert">
          <MDXRemote source={post.content} />
        </div>
      </AnimatedSection>

      {/* Bottom action bar */}
      <PostActions postSlug={slug} />

      <CommentSection postSlug={slug} />
    </article>
  );
}

