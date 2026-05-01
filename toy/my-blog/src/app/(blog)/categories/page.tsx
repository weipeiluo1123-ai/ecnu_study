import { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants";
import { getAllCategories } from "@/lib/posts";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "分类",
  description: "文章分类浏览",
};

export const revalidate = 60;

export default function CategoriesPage() {
  const categoryCounts = getAllCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-foreground">分类</h1>
        <p className="mt-2 text-muted">
          共 {CATEGORIES.length} 个分类，涵盖多个技术领域
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
              count={categoryCounts[cat.slug] || 0}
              index={i}
            />
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
