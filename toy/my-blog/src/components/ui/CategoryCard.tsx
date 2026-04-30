"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layout,
  Server,
  Cloud,
  Brain,
  Code,
  GitBranch,
  Wrench,
  Smartphone,
  Shield,
  TrendingUp,
  BookOpen,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Layout,
  Server,
  Cloud,
  Brain,
  Code,
  GitBranch,
  Wrench,
  Smartphone,
  Shield,
  TrendingUp,
  BookOpen,
  Rocket,
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
      <Link href={`/categories/${category.slug}`} className="group block">
        <div className="gradient-border rounded-xl p-[1px]">
          <div className="rounded-xl bg-surface p-5 transition-colors group-hover:bg-surface-alt">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-neon-cyan transition-colors">
                  {category.name}
                </h3>
                <span className="text-xs text-muted">{count} 篇文章</span>
              </div>
            </div>
            <p className="text-sm text-muted line-clamp-2">{category.description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
