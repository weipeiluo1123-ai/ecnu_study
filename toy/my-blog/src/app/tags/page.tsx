import { Metadata } from "next";
import { TAGS } from "@/lib/constants";
import { getAllTags } from "@/lib/posts";
import { TagBadge } from "@/components/ui/TagBadge";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "标签",
  description: "文章标签索引",
};

export const revalidate = 60;

export default function TagsPage() {
  const tagCounts = getAllTags();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-foreground">标签</h1>
        <p className="mt-2 text-muted">共 {TAGS.length} 个标签，方便快速定位主题</p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-10">
        <div className="tag-cloud flex flex-wrap gap-3">
          {TAGS.map((tag) => (
            <TagBadge
              key={tag.slug}
              tag={tag.slug}
              count={tagCounts[tag.slug] || 0}
              size="lg"
            />
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
