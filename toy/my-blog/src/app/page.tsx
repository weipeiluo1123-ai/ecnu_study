"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Code, Server, Brain, Palette, Cpu } from "lucide-react";

const projects = [
  {
    id: "nexus-blog",
    title: "NEXUS Blog",
    description: "思考 · 代码 · 生活 — 个人技术博客，分享编程、技术与思考",
    icon: Code,
    href: "/home",
    color: "neon-cyan",
    status: "已上线" as const,
    featured: true,
  },
  {
    id: "code-arena",
    title: "Code Arena",
    description: "算法竞技场 — 在线刷题、竞赛、算法可视化",
    icon: Cpu,
    href: "#",
    color: "neon-purple",
    status: "开发中" as const,
    featured: false,
  },
  {
    id: "dev-forge",
    title: "DevForge",
    description: "开发工坊 — 开源工具、CLI 脚手架、代码生成器",
    icon: Server,
    href: "#",
    color: "neon-green",
    status: "开发中" as const,
    featured: false,
  },
  {
    id: "ai-playground",
    title: "AI Playground",
    description: "AI 实验室 — LLM 应用、模型微调、智能体实验",
    icon: Brain,
    href: "#",
    color: "neon-pink",
    status: "开发中" as const,
    featured: false,
  },
  {
    id: "pixel-lab",
    title: "Pixel Lab",
    description: "像素设计室 — 组件库、设计系统、动效 showcase",
    icon: Palette,
    href: "#",
    color: "neon-orange",
    status: "开发中" as const,
    featured: false,
  },
];

const colorMap: Record<string, string> = {
  "neon-cyan": "shadow-neon-cyan/20 border-neon-cyan/30 hover:shadow-neon-cyan/30 hover:border-neon-cyan/60",
  "neon-purple": "shadow-neon-purple/20 border-neon-purple/30 hover:shadow-neon-purple/30 hover:border-neon-purple/60",
  "neon-green": "shadow-neon-green/20 border-neon-green/30 hover:shadow-neon-green/30 hover:border-neon-green/60",
  "neon-pink": "shadow-neon-pink/20 border-neon-pink/30 hover:shadow-neon-pink/30 hover:border-neon-pink/60",
  "neon-orange": "shadow-neon-orange/20 border-neon-orange/30 hover:shadow-neon-orange/30 hover:border-neon-orange/60",
};

const glowMap: Record<string, string> = {
  "neon-cyan": "bg-neon-cyan",
  "neon-purple": "bg-neon-purple",
  "neon-green": "bg-neon-green",
  "neon-pink": "bg-neon-pink",
  "neon-orange": "bg-neon-orange",
};

const textColorMap: Record<string, string> = {
  "neon-cyan": "text-neon-cyan",
  "neon-purple": "text-neon-purple",
  "neon-green": "text-neon-green",
  "neon-pink": "text-neon-pink",
  "neon-orange": "text-neon-orange",
};

const badgeBgMap: Record<string, string> = {
  "neon-cyan": "bg-neon-cyan/15 text-neon-cyan",
  "neon-purple": "bg-neon-purple/15 text-neon-purple",
  "neon-green": "bg-neon-green/15 text-neon-green",
  "neon-pink": "bg-neon-pink/15 text-neon-pink",
  "neon-orange": "bg-neon-orange/15 text-neon-orange",
};

function ProjectCard({ project, index }: { project: typeof projects[number]; index: number }) {
  const Icon = project.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
      className={`group relative rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 ${
        project.featured
          ? "md:col-span-2 md:row-span-1 " + colorMap[project.color]
          : colorMap[project.color]
      } ${project.featured ? "bg-surface/60" : "bg-surface/30"}`}
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowMap[project.color]}/[0.03] blur-xl`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${glowMap[project.color]}/10 border ${glowMap[project.color]}/20`}>
            <Icon size={22} className={textColorMap[project.color]} />
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase ${badgeBgMap[project.color]}`}>
            {project.status}
          </span>
        </div>

        <h3 className={`text-lg font-bold mb-1.5 ${project.featured ? "text-foreground" : "text-foreground/90"}`}>
          {project.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed mb-5">
          {project.description}
        </p>

        {project.href !== "#" ? (
          <Link
            href={project.href}
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${textColorMap[project.color]} hover:brightness-125`}
          >
            进入
            <ArrowRight size={14} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted/50 cursor-not-allowed">
            敬请期待
            <ExternalLink size={14} />
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/[0.02] rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/[0.02] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
              weipeiluo.space
            </div>
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter mb-4">
              <span className="glitch text-foreground" data-text="NEXUS">
                NEXUS
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted max-w-lg mx-auto">
              探索技术的边界，汇聚创新的星云
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted/60">
              <span className="w-16 h-px bg-border" />
              <span>Gateway to Innovation</span>
              <span className="w-16 h-px bg-border" />
            </div>
          </motion.div>

          {/* Project grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>

          {/* Footer text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-16 text-xs text-muted/40"
          >
            <span className="inline-flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-muted/30" />
              {new Date().getFullYear()} · Built with Next.js
              <span className="w-1 h-1 rounded-full bg-muted/30" />
            </span>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
