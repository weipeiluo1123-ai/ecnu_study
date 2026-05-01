import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getAllPosts, getFeaturedPosts, getRecentPosts } from "@/lib/posts";
import { CATEGORIES, TAGS } from "@/lib/constants";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PostCard } from "@/components/ui/PostCard";
import { TagBadge } from "@/components/ui/TagBadge";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { getAllCategories, getAllTags } from "@/lib/posts";

export const revalidate = 60;

export default function HomePage() {
  const recentPosts = getRecentPosts(5);
  const featuredPosts = getFeaturedPosts();
  const featured = featuredPosts.length > 0 ? featuredPosts : recentPosts.slice(0, 3);
  const categoryCounts = getAllCategories();
  const tagCounts = getAllTags();

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 -left-40 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <AnimatedSection>
            <div className="flex items-center gap-2 text-neon-cyan text-sm font-medium mb-4">
              <Sparkles size={16} />
              <span>个人技术博客</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              <span className="glitch text-foreground" data-text="NEXUS BLOG">
                NEXUS BLOG
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted max-w-xl">
              探索代码的边界，记录技术的脉络。前端、后端、AI、系统设计，汇聚成知识的星云。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/home/blog/posts"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-all hover:shadow-lg hover:shadow-neon-cyan/20"
              >
                浏览文章
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/home/blog/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-medium hover:border-neon-cyan/50 transition-all"
              >
                关于我
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Featured Posts ── */}
        <AnimatedSection className="mt-20" delay={0.1}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">精选文章</h2>
            <Link
              href="/home/blog/posts"
              className="text-sm text-muted hover:text-neon-cyan transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {featured.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </AnimatedSection>

        {/* ── Recent Posts ── */}
        <AnimatedSection className="mt-16" delay={0.2}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">最新文章</h2>
            <Link
              href="/home/blog/posts"
              className="text-sm text-muted hover:text-neon-cyan transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </AnimatedSection>

        {/* ── Categories ── */}
        <AnimatedSection className="mt-20" delay={0.3}>
          <h2 className="text-2xl font-bold text-foreground mb-8">分类</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.slice(0, 6).map((cat, i) => (
              <CategoryCard
                key={cat.slug}
                category={cat}
                count={categoryCounts[cat.slug] || 0}
                index={i}
              />
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/home/blog/categories"
              className="text-sm text-muted hover:text-neon-cyan transition-colors"
            >
              查看全部分类 ({CATEGORIES.length})
            </Link>
          </div>
        </AnimatedSection>

        {/* ── Tags Cloud ── */}
        <AnimatedSection className="mt-20 mb-20" delay={0.4}>
          <h2 className="text-2xl font-bold text-foreground mb-8">标签云</h2>
          <div className="tag-cloud flex flex-wrap gap-2">
            {TAGS.slice(0, 20).map((tag) => (
              <TagBadge
                key={tag.slug}
                tag={tag.slug}
                count={tagCounts[tag.slug] || 0}
                size="md"
              />
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/home/blog/tags"
              className="text-sm text-muted hover:text-neon-cyan transition-colors"
            >
              查看全部标签 ({TAGS.length})
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
