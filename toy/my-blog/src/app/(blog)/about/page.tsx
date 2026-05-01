import { Metadata } from "next";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import {
  Code,
  Terminal,
  Server,
  Database,
  Cloud,
  GitBranch,
  Crown,
  Globe,
  BookOpen,
  Zap,
} from "lucide-react";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我和这个博客",
};

const skills = [
  { icon: Code, label: "前端开发", desc: "React, Next.js, TypeScript, Tailwind" },
  { icon: Server, label: "后端开发", desc: "Node.js, Python, Go, Rust" },
  { icon: Database, label: "数据库", desc: "PostgreSQL, SQLite, Redis, MongoDB" },
  { icon: Cloud, label: "云服务", desc: "Docker, Kubernetes, AWS, GCP" },
  { icon: Terminal, label: "开发工具", desc: "Vim, Git, Linux, CI/CD" },
  { icon: GitBranch, label: "系统设计", desc: "微服务, 分布式, API 设计" },
];

const projects = [
  { icon: Globe, label: "Nexus Blog", desc: "全栈个人博客系统，赛博朋克风格，内建账号/评论/排行榜" },
  { icon: BookOpen, label: "技术笔记", desc: "持续积累的前端、后端、DevOps 学习笔记" },
  { icon: Zap, label: "效率工具", desc: "CLI 工具、自动化脚本、开发者工作流优化" },
];

export default async function AboutPage() {
  // Fetch weipeiluo's data from the database
  const superAdmin = db.select().from(users).where(eq(users.username, "weipeiluo")).get();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-foreground">关于</h1>
      </AnimatedSection>

      {/* Profile Card */}
      <AnimatedSection delay={0.1} className="mt-8">
        <div className="gradient-border rounded-2xl p-[1px]">
          <div className="rounded-2xl bg-surface p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                <Crown size={36} className="text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-foreground">
                    {superAdmin?.username || "weipeiluo"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Crown size={12} />
                    超级管理员
                  </span>
                </div>
                <p className="mt-2 text-muted leading-relaxed">
                  {superAdmin?.bio || "Nexus Blog 创始人 · 全栈开发者 · 开源爱好者"}
                </p>
                {superAdmin && (
                  <p className="mt-1 text-xs text-muted">
                    加入于 {new Date(superAdmin.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Bio */}
      <AnimatedSection delay={0.15} className="mt-8">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-muted leading-relaxed">
            热衷于探索前沿技术，构建富有表现力的数字产品。从架构设计到像素级实现，享受全栈开发的每一个环节。
            这个博客是记录技术思考、分享项目经验、沉淀知识体系的地方。
          </p>
          <p className="text-muted leading-relaxed mt-3">
            主要关注领域：Web 前端/后端开发、系统架构设计、人工智能应用、以及开发者工具链。
            相信持续学习和知识分享是技术成长的最佳路径。
          </p>
        </div>
      </AnimatedSection>

      {/* Skills Grid */}
      <AnimatedSection delay={0.2} className="mt-10">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Code size={20} className="text-neon-cyan" />
          技能栈
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-5 hover:border-neon-cyan/30 transition-all"
              >
                <Icon size={20} className="text-neon-cyan mb-3" />
                <h3 className="font-medium text-foreground">{skill.label}</h3>
                <p className="text-sm text-muted mt-1">{skill.desc}</p>
              </div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Projects */}
      <AnimatedSection delay={0.25} className="mt-10">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <GitBranch size={20} className="text-neon-cyan" />
          项目
        </h2>
        <div className="space-y-3">
          {projects.map((project, i) => {
            const Icon = project.icon;
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-neon-cyan" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{project.label}</h3>
                  <p className="text-sm text-muted mt-1">{project.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Quote */}
      <AnimatedSection delay={0.3} className="mt-12 mb-20">
        <div className="rounded-xl border border-border bg-surface-alt p-8 text-center">
          <p className="text-muted italic">
            &ldquo;代码是写给人读的，顺便能在机器上运行。&rdquo;
          </p>
          <p className="text-sm text-muted mt-2">— Harold Abelson</p>
        </div>
      </AnimatedSection>
    </div>
  );
}
