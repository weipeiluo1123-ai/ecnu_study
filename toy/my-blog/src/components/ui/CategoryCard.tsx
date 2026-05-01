"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layout, Server, Cloud, Brain, Code, GitBranch,
  Wrench, Smartphone, Shield, TrendingUp, BookOpen, Rocket,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Layout, Server, Cloud, Brain, Code, GitBranch,
  Wrench, Smartphone, Shield, TrendingUp, BookOpen, Rocket,
};

interface Props {
  category: Category;
  count: number;
  index?: number;
}

export function CategoryCard({ category, count, index = 0 }: Props) {
  const Icon = iconMap[category.icon] || Layout;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/categories/${category.slug}`} className="block group perspective">
        <div className="gradient-border rounded-xl p-[1px] h-full">
          <div
            className="relative rounded-xl bg-surface"
            style={{ minHeight: 140, transformStyle: "preserve-3d" }}
          >
            {/* Front face */}
            <div className="flip-face front flex flex-col items-center justify-center text-center p-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neon-cyan/10 text-neon-cyan mb-3">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{category.name}</h3>
              <span className="text-sm text-muted/60">{count} 篇文章</span>
            </div>

            {/* Back face */}
            <div className="flip-face back flex flex-col items-center justify-center text-center p-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neon-purple/10 text-neon-purple mb-3">
                <Icon size={24} />
              </div>
              <p className="text-sm text-muted leading-relaxed line-clamp-3">{category.description}</p>
              <span className="mt-4 text-xs font-medium text-neon-cyan">
                查看 {count} 篇文章 →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
