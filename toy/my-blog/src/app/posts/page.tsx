import { Metadata } from "next";
import { getAllPosts, paginatePosts } from "@/lib/posts";
import { POSTS_PER_PAGE, CATEGORIES } from "@/lib/constants";
import { PostCard } from "@/components/ui/PostCard";
import { Pagination } from "@/components/ui/Pagination";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TagBadge } from "@/components/ui/TagBadge";
import { getAllTags } from "@/lib/posts";
import Link from "next/link";

export const metadata: Metadata = {
  title: "文章",
  description: "所有博客文章列表",
};

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(params.pageSize || String(POSTS_PER_PAGE), 10) || POSTS_PER_PAGE));
  const allPosts = getAllPosts();
  const { posts, totalPages, currentPage } = paginatePosts(allPosts, page, pageSize);
  const tagCounts = getAllTags();
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-foreground">文章</h1>
        <p className="mt-2 text-muted">
          共 {allPosts.length} 篇文章，第 {currentPage}/{totalPages} 页
        </p>
      </AnimatedSection>

      {/* Tags filter */}
      <AnimatedSection delay={0.1}>
        <div className="mt-8 flex flex-wrap gap-2">
          {topTags.map(([tag]) => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
        </div>
      </AnimatedSection>

      {/* Posts */}
      <AnimatedSection delay={0.2} className="mt-10">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted">暂无文章</p>
          </div>
        )}
      </AnimatedSection>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/posts"
        pageSize={pageSize}
        showSizeSelector
      />
    </div>
  );
}
