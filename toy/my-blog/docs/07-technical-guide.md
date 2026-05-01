# NEXUS BLOG — 技术文档

## 项目概要

| 项目 | 详情 |
|------|------|
| 框架 | Next.js 16.2.4 (App Router, Turbopack) |
| 语言 | TypeScript 5 + React 19.2.4 |
| 数据库 | SQLite (better-sqlite3) + Drizzle ORM |
| 样式 | Tailwind CSS v4 + 自定义赛博朋克主题 |
| 动画 | Framer Motion |
| 认证 | JWT (jose) + httpOnly Cookie |
| 邮件 | Nodemailer (QQ SMTP) |
| 部署 | Node.js + PM2 (云服务器 43.138.158.121) |
| 图表 | ECharts (动态导入) |
| 搜索 | Fuse.js (客户端模糊搜索，300ms 防抖) |

## 目录结构

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 (Geist 字体, Providers, metadataBase)
│   ├── page.tsx                  # Landing Page (动漫风格, 首次访问跳过逻辑)
│   ├── error.tsx                 # 全局 Error Boundary
│   ├── sitemap.ts                # 动态站点地图
│   ├── robots.ts                 # robots.txt
│   ├── feed.xml/route.ts         # RSS 2.0 Feed
│   ├── globals.css               # 全局样式 (赛博朋克主题变量)
│   ├── (blog)/                   # 博客路由组
│   │   ├── layout.tsx            # 博客布局 (OG metadata, title template)
│   │   ├── error.tsx             # 博客 Error Boundary
│   │   ├── BlogLayoutClient.tsx  # AuthProvider + Header + Footer
│   │   ├── home/                 # 博客首页 (Hero + 精选 + 分类 + 标签云)
│   │   ├── posts/                # 文章列表 / [slug]详情 / new新建
│   │   ├── categories/           # 分类页 (翻牌动画卡片)
│   │   ├── tags/                 # 标签云
│   │   ├── search/               # 搜索页 (Fuse.js + 防抖)
│   │   ├── leaderboard/          # 排行榜 (4个时间范围, 响应式高度)
│   │   ├── about/                # 关于页
│   │   ├── auth/                 # 登录 / 注册 (邮箱验证码)
│   │   ├── settings/             # 个人设置 (改名, 简介, 积分统计)
│   │   ├── my-posts/             # 我的文章 (CRUD + 筛选)
│   │   ├── my-bookmarks/         # 我的收藏
│   │   ├── users/[id]/           # 用户主页
│   │   └── admin/                # 管理后台 (仪表盘, 用户, 评论, 审核)
│   └── api/                      # REST API 路由
│       ├── auth/login|register|logout|session|send-code/
│       ├── comments|likes|bookmarks|views/
│       ├── users|user-posts|user-posts/[id]/
│       ├── name-change|profile/
│       ├── leaderboard/
│       └── admin/dashboard|posts/
├── components/
│   ├── providers.tsx             # ThemeProvider + ToastProvider
│   ├── layout/
│   │   ├── Header.tsx            # 导航栏 (桌面下拉 + 移动菜单)
│   │   ├── Footer.tsx            # 页脚
│   │   └── ThemeToggle.tsx       # 暗/亮切换
│   ├── ui/                       # UI 组件库
│   │   ├── PostCard.tsx          # 文章卡片 (渐变边框)
│   │   ├── CategoryCard.tsx      # 翻牌卡片
│   │   ├── TagBadge.tsx          # 标签徽章
│   │   ├── MarkdownEditor.tsx    # Markdown 编辑器 (工具栏+预览+草稿)
│   │   ├── Pagination.tsx        # 分页组件
│   │   ├── LikeButton.tsx        # 点赞按钮 (乐观更新)
│   │   ├── BookmarkButton.tsx    # 收藏按钮 (乐观更新)
│   │   ├── ViewCounter.tsx       # 浏览量计数
│   │   ├── PostActions.tsx       # 底部操作栏
│   │   ├── AnimatedSection.tsx   # 滚动入场动画
│   │   ├── BackToTop.tsx         # 返回顶部
│   │   ├── SearchDialog.tsx      # 搜索弹窗
│   │   ├── EmojiPicker.tsx       # 表情选择器
│   │   └── Toast.tsx             # (兼容保留) Toast 组件
│   ├── comments/
│   │   ├── CommentSection.tsx    # 内置评论系统 (嵌套回复)
│   │   └── GiscusComments.tsx    # Giscus 备选方案
│   └── admin/dashboard/          # 仪表盘组件
│       ├── DashboardOverview.tsx # 仪表盘编排器
│       ├── StatCard.tsx          # 统计卡片
│       ├── TrafficChart.tsx      # 流量图 (ECharts)
│       ├── EngagementChart.tsx   # 互动图 (ECharts)
│       └── PostAnalyticsTable.tsx # 文章分析表
├── hooks/
│   ├── useAuth.tsx               # 认证 Context (user, login, register, logout)
│   └── useToast.tsx              # 全局 Toast Context (Provider + useToast hook)
└── lib/
    ├── constants.ts              # 常量 (导航链接, 12个分类, 30个标签)
    ├── posts.ts                  # 文章数据层 (MDX + DB 混合, 内存缓存60s)
    ├── auth.ts                   # JWT 认证 (createToken, verifyToken, getSession)
    ├── markdown.ts               # 自定义 Markdown → HTML 渲染器
    ├── format.ts                 # 日期格式化, 阅读时间估算
    ├── utils.ts                  # cn() 工具函数 (clsx + tailwind-merge)
    ├── dashboard.ts              # 仪表盘数据查询
    ├── email.ts                  # 邮件发送 (Nodemailer)
    └── db/
        ├── schema.ts             # Drizzle ORM Schema (7 表)
        ├── index.ts              # 数据库连接 + 自动迁移 + 种子数据
        └── seed.ts               # 种子脚本
```

## 数据库 Schema

7 张表，SQLite + WAL 模式：

| 表 | 用途 | 关键字段 |
|----|------|----------|
| `users` | 用户账户 | username, email, password_hash, role(user/admin/super_admin), permissions(JSON), bio |
| `comments` | 嵌套评论 | post_slug, author_id, content, parent_id |
| `likes` | 点赞 | post_slug, user_id (UNIQUE) |
| `bookmarks` | 收藏 | post_slug, user_id (UNIQUE) |
| `views` | 浏览量 | post_slug, visitor_id |
| `user_posts` | 用户文章 | title, content, slug(UNIQUE), category, tags(JSON), format, author_id, is_published |
| `name_change_requests` | 改名审核 | user_id, old_name, new_name, status |
| `verification_codes` | 邮箱验证码 | email, code, expires_at |

## 认证系统

- **JWT Token**: HS256 签名, 7 天过期
- **Cookie**: `nexus_token`, httpOnly, SameSite=lax, path=/
- **角色**: user / admin / super_admin
- **权限**: 基于 role 的全局权限 + per-user 细粒度权限 (JSON)
- **注册流程**: 邮箱验证码 (6位数字, 5分钟有效期, 60秒发送间隔)

## 页面渲染策略

| 策略 | 路由 | 说明 |
|------|------|------|
| 静态 (SSG) | `/posts/[slug]` | MDX 文章通过 generateStaticParams 预渲染 |
| ISR 60s | `/home`, `/posts`, `/categories`, `/tags`, `/search` | 缓存60秒后重新验证 |
| ISR 60s | `/posts/[slug]` (用户文章) | ISR + revalidatePath 在编辑时主动失效 |
| 动态 | `/api/*`, `/my-bookmarks`, `/my-posts/*` | 每次请求实时渲染 |
| 客户端 | `/auth/*`, `/settings`, `/leaderboard`, `/admin/*` | 纯客户端渲染 |

## 全局 Toast 系统

**架构**: React Context + Provider 模式

```typescript
// 使用方式
import { useToast } from "@/hooks/useToast";
const { addToast } = useToast();
addToast("success", "操作成功");
addToast("error", "操作失败");
addToast("info", "提示信息");
```

- Provider 包裹在 `providers.tsx` 中，全局可用
- 通知 4 秒后自动消失
- Framer Motion 入场/退场动画
- 三种类型: success (绿色), error (红色), info (青色)

## Error Boundary

- `src/app/error.tsx`: 全局错误捕获（动漫渐变风格）
- `src/app/(blog)/error.tsx`: 博客区域错误捕获（赛博朋克风格）
- 提供"重试"按钮和导航链接

## 搜索系统

- **Fuse.js** 客户端模糊搜索（权重: title×2, tags×1.5, description×1, category×1）
- **300ms 防抖**: 输入停止 300ms 后才触发搜索
- 支持文章搜索和用户搜索两个标签页
- 分页显示结果

## 性能优化

1. **数据层**: MDX 文章永久缓存, 混合文章列表 60s TTL
2. **ISR**: listing 页面 60s 增量重新生成
3. **ECharts**: 通过 `next/dynamic` + `ssr: false` 按需加载
4. **DB 连接**: Drizzle ORM 单例连接, 不再逐次创建新连接
5. **草稿**: MarkdownEditor localStorage 自动保存, 7 天过期

## API 端点

全部 RESTful 风格, 使用 Next.js Route Handlers:

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/auth/login` | POST | - | 用户名+密码登录 |
| `/api/auth/register` | POST | - | 邮箱验证码注册 |
| `/api/auth/logout` | POST | - | 清除 Cookie |
| `/api/auth/session` | GET | Cookie | 获取当前用户 |
| `/api/auth/send-code` | POST | - | 发送验证码 (60s 限流) |
| `/api/comments` | GET | - | 获取评论 (支持 `__all__` 管理端) |
| `/api/comments` | POST | 登录 | 发布评论 (含嵌套回复) |
| `/api/comments` | DELETE | 登录 | 删除评论 (级联删除回复) |
| `/api/likes` | GET | - | 获取点赞数 |
| `/api/likes` | POST | 登录 | 点赞/取消 (乐观更新) |
| `/api/bookmarks` | GET | - | 获取收藏数 |
| `/api/bookmarks` | POST | 登录 | 收藏/取消 |
| `/api/views` | GET/POST | - | 浏览量记录与查询 |
| `/api/users` | GET | - | 用户列表 |
| `/api/users` | PATCH | admin | 修改用户 (角色/权限) |
| `/api/users` | DELETE | admin | 删除用户 (评论匿名化) |
| `/api/user-posts` | GET/POST | POST需登录 | 用户文章 CRUD |
| `/api/user-posts/[id]` | GET/PATCH/DELETE | 登录 | 单篇文章操作 |
| `/api/profile` | GET/PATCH | 登录 | 个人资料+积分统计 |
| `/api/name-change` | POST | 登录 | 提交改名申请 |
| `/api/name-change` | PATCH | admin | 审核改名 |
| `/api/leaderboard` | GET | - | 排行榜 (all/daily/weekly/monthly) |
| `/api/admin/dashboard` | GET | admin | 仪表盘概览统计 |
| `/api/admin/dashboard/posts` | GET | admin | 文章分析数据 |
| `/api/admin/posts` | GET/PATCH/DELETE | admin | 管理全部文章 |

## SEO 基础设施

- **sitemap.xml**: 自动生成 (含所有静态路由 + 文章 slug)
- **robots.txt**: 允许博客路由, 禁止管理/API/认证路由
- **RSS Feed**: `/feed.xml` (RSS 2.0 格式, 1小时缓存)
- **Open Graph**: 全局默认 + 每篇文章独立 OG 元数据
- **Twitter Card**: summary_large_image 类型

## 关键设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| Toast 系统 | Context Provider | 与 React 树深度集成, SSR 友好 |
| Error Boundary | Next.js error.tsx | 自动路由包裹, 提供 reset() |
| 首页跳过 | localStorage | 纯客户端逻辑, 无需服务端参与 |
| 搜索防抖 | 300ms setTimeout | 平衡响应速度与性能 |
| 文章 ISR | revalidate=60 | 匹配 listing 页缓存窗口 |
| ECharts 加载 | next/dynamic | 减少初始 JS bundle |
| 数据库访问 | Drizzle ORM 单例 | 避免重复连接, 统一查询接口 |
| Markdown 渲染 | 自定义渲染器 | 轻量, 无外部依赖, 统一样式 |
