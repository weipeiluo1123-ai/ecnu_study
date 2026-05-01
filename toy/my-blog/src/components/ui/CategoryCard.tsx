"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
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
  const [flipped, setFlipped] = useState(false);
  const Icon = iconMap[category.icon] || Layout;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="[perspective:800px]"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <Link href={`/categories/${category.slug}`} className="block h-full">
        <div className="gradient-border rounded-xl p-[1px] h-full">
          <motion.div
            className="relative rounded-xl bg-surface"
            style={{ minHeight: 140, transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Front face */}
            <div
              className="absolute inset-0 rounded-xl flex flex-col items-center justify-center text-center p-5"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neon-cyan/10 text-neon-cyan mb-3">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{category.name}</h3>
              <span className="text-sm text-muted/60">{count} 篇文章</span>
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 rounded-xl flex flex-col items-center justify-center text-center p-5"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neon-purple/10 text-neon-purple mb-3">
                <Icon size={24} />
              </div>
              <p className="text-sm text-muted leading-relaxed line-clamp-3">{category.description}</p>
              <span className="mt-4 text-xs font-medium text-neon-cyan">
                查看 {count} 篇文章 →
              </span>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
