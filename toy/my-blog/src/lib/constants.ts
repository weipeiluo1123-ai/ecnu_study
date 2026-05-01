export const BLOG_TITLE = "NEXUS BLOG";
export const BLOG_SUBTITLE = "思考 · 代码 · 生活";
export const BLOG_DESCRIPTION = "个人技术博客 — 分享编程、技术与思考";

export const POSTS_PER_PAGE = 10;

export const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/leaderboard", label: "排行" },
  { href: "/search", label: "搜索" },
  { href: "/about", label: "关于" },
] as const;

export const CATEGORIES = [
  {
    slug: "frontend",
    name: "前端开发",
    description: "HTML、CSS、JavaScript、React、Vue 等前端技术",
    icon: "Layout",
  },
  {
    slug: "backend",
    name: "后端开发",
    description: "Node.js、Python、Go、数据库、API 设计",
    icon: "Server",
  },
  {
    slug: "devops",
    name: "运维与部署",
    description: "Docker、CI/CD、云服务、Linux 运维",
    icon: "Cloud",
  },
  {
    slug: "ai-ml",
    name: "人工智能",
    description: "机器学习、深度学习、LLM 应用、AI 工具",
    icon: "Brain",
  },
  {
    slug: "algorithm",
    name: "算法与数据结构",
    description: "算法题解、复杂度分析、经典数据结构",
    icon: "Code",
  },
  {
    slug: "system-design",
    name: "系统设计",
    description: "架构设计、分布式系统、设计模式",
    icon: "GitBranch",
  },
  {
    slug: "tooling",
    name: "开发工具",
    description: "编辑器、CLI、Git、效率工具推荐与配置",
    icon: "Wrench",
  },
  {
    slug: "mobile",
    name: "移动开发",
    description: "iOS、Android、React Native、Flutter",
    icon: "Smartphone",
  },
  {
    slug: "security",
    name: "安全技术",
    description: "网络安全、加密、认证机制、最佳实践",
    icon: "Shield",
  },
  {
    slug: "career",
    name: "职业成长",
    description: "面试经验、学习方法、技术路线、软技能",
    icon: "TrendingUp",
  },
  {
    slug: "notes",
    name: "学习笔记",
    description: "读书笔记、课程笔记、技术总结与备忘",
    icon: "BookOpen",
  },
  {
    slug: "projects",
    name: "项目实战",
    description: "开源项目、Side Project 实战分享",
    icon: "Rocket",
  },
] as const;

export const TAGS = [
  { slug: "react", name: "React" },
  { slug: "nextjs", name: "Next.js" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "javascript", name: "JavaScript" },
  { slug: "nodejs", name: "Node.js" },
  { slug: "python", name: "Python" },
  { slug: "rust", name: "Rust" },
  { slug: "go", name: "Go" },
  { slug: "docker", name: "Docker" },
  { slug: "kubernetes", name: "Kubernetes" },
  { slug: "tailwind", name: "Tailwind CSS" },
  { slug: "framer-motion", name: "Framer Motion" },
  { slug: "database", name: "数据库" },
  { slug: "api", name: "API 设计" },
  { slug: "testing", name: "测试" },
  { slug: "git", name: "Git" },
  { slug: "linux", name: "Linux" },
  { slug: "performance", name: "性能优化" },
  { slug: "security", name: "安全" },
  { slug: "ai", name: "AI" },
  { slug: "llm", name: "LLM" },
  { slug: "tutorial", name: "教程" },
  { slug: "insights", name: "心得" },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type TagSlug = (typeof TAGS)[number]["slug"];

export function normalizeTags(tags: string[]): string[] {
  return tags.map((t) => {
    // If the tag matches a TAGS name, use the slug
    const byName = TAGS.find((tag) => tag.name === t);
    if (byName) return byName.slug;
    // If it's already a valid slug, keep it
    const bySlug = TAGS.find((tag) => tag.slug === t);
    if (bySlug) return bySlug.slug;
    // Fallback: strip non-ASCII
    return t.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase() || "unknown";
  });
}
