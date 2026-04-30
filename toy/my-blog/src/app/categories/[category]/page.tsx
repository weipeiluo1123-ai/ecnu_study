import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPostsByCategory, getAllPosts } from "@/lib/posts";
import { CATEGORIES } from "@/lib/constants";
import { PostCard } from "@/components/ui/PostCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const revalidate = 60;

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  const cats = [...new Set(posts.map((p) => p.category))];
  return cats.map((cat) => ({ category: cat }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const catInfo = CATEGORIES.find((c) => c.slug === category);
  return {
    title: catInfo?.name || category,
    description: catInfo?.description || `${category} 分类的文章`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  const catInfo = CATEGORIES.find((c) => c.slug === category);

  if (!catInfo) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          全部分类
        </Link>

        <h1 className="text-3xl font-bold text-foreground">{catInfo.name}</h1>
        <p className="mt-2 text-muted">{catInfo.description}</p>
        <p className="mt-1 text-sm text-muted">{posts.length} 篇文章</p>
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
            <p className="text-muted">该分类暂无文章</p>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
