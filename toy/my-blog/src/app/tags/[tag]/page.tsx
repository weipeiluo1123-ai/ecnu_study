import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPostsByTag, getAllPosts } from "@/lib/posts";
import { TAGS } from "@/lib/constants";
import { PostCard } from "@/components/ui/PostCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const revalidate = 60;

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  return allTags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const tagInfo = TAGS.find((t) => t.slug === tag);
  return {
    title: `#${tagInfo?.name || tag}`,
    description: `标签 #${tagInfo?.name || tag} 下的文章`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  const tagInfo = TAGS.find((t) => t.slug === tag);

  if (!tagInfo) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/tags"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          全部标签
        </Link>

        <h1 className="text-3xl font-bold text-foreground">
          <span className="text-neon-cyan">#</span>
          {tagInfo.name}
        </h1>
        <p className="mt-2 text-muted">{posts.length} 篇文章</p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-10">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted">该标签暂无文章</p>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
