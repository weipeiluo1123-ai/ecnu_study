"use client";

import { useState } from "react";
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
  const [flipped, setFlipped] = useState(false);
  const Icon = iconMap[category.icon] || Layout;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/home/blog/categories/${category.slug}`}
        className="block h-full"
        style={{ perspective: "800px" }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        <motion.div
          className="relative w-full rounded-xl border border-border bg-surface cursor-pointer
                     hover:border-neon-cyan/20 transition-colors"
          style={{ minHeight: 200 }}
        >
          <motion.div
            className="w-full rounded-xl bg-surface"
            style={{ minHeight: 200, transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* ── Front face ── */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 rounded-xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-neon-cyan/10 text-neon-cyan mb-4
                              transition-all duration-500"
              >
                <Icon size={26} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">{category.name}</h3>
              <span className="text-sm text-muted/50">{count} 篇文章</span>
            </div>

            {/* ── Back face ── */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-surface"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-neon-purple/10 text-neon-purple mb-4 shrink-0">
                <Icon size={26} />
              </div>
              <p className="text-sm text-foreground/75 leading-relaxed">
                {category.description}
              </p>
              <span className="mt-3 text-xs font-medium text-neon-cyan shrink-0">
                查看 {count} 篇文章 →
              </span>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
