# Nexus Blog — 项目文档

## 项目概述

Nexus Blog 是一个基于 **Next.js 16** 构建的个人技术博客系统，采用赛博朋克风格 UI，支持深色/亮色主题切换、文章分类/标签体系、全文搜索、用户系统、评论、点赞、收藏、排行榜等功能。

### 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 (App Router) | React 全栈框架，SSG 静态生成 |
| TypeScript | 类型安全 |
| Tailwind CSS v4 | 原子化样式 |
| Framer Motion 12 | 页面动画 / 微交互 |
| next-mdx-remote | MDX 文章渲染 |
| gray-matter | Markdown 前置元数据解析 |
| next-themes | 深色/亮色主题切换 |
| **SQLite + Drizzle ORM** | 数据库（评论/用户/点赞/收藏） |
| **better-sqlite3** | SQLite 驱动 |
| **bcryptjs** | 密码加密 |
| **jose** | JWT 会话令牌 |
| Fuse.js | 客户端全文搜索 |
| Lucide React | 图标库 |

---

## 项目结构

```
my-blog/
├── content/
│   └── posts/                # 📝 MDX/MD 文章存放目录（管理员文章）
│
├── data/                     # 🗄 SQLite 数据库文件（自动生成）
│   └── blog.db
│
├── public/images/            # 静态资源
│
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── globals.css       # 全局样式（赛博朋克主题）
│   │   ├── layout.tsx        # 根布局
│   │   ├── page.tsx          # 首页
│   │   ├── not-found.tsx     # 404 页面
│   │   │
│   │   ├── posts/
│   │   │   ├── page.tsx      # 文章列表（分页）
│   │   │   ├── new/page.tsx  # 用户发布文章
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # 文章详情页
│   │   ├── categories/
│   │   │   ├── page.tsx      # 全部分类
│   │   │   └── [category]/
│   │   │       └── page.tsx  # 分类下的文章
│   │   ├── tags/
│   │   │   ├── page.tsx      # 全部标签
│   │   │   └── [tag]/
│   │   │       └── page.tsx  # 标签下的文章
│   │   ├── search/           # 搜索
│   │   ├── leaderboard/      # 排行榜
│   │   ├── about/            # 关于
│   │   │
│   │   ├── auth/             # 🔐 认证
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/            # ⚙️ 管理后台
│   │   │   ├── page.tsx      # 仪表盘
│   │   │   └── users/page.tsx# 用户管理
│   │   │
│   │   └── api/              # 🔌 API 路由
│   │       ├── auth/         # 登录/注册/登出/会话
│   │       ├── comments/     # 评论 CRUD（支持全部评论查询）
│   │       ├── likes/        # 点赞/取消点赞
│   │       ├── bookmarks/    # 收藏/取消收藏
│   │       ├── views/        # 浏览计数
│   │       ├── users/        # 用户管理（管理员）
│   │       ├── user-posts/   # 用户发布文章
│   │       ├── name-change/  # 改名申请与审核
│   │       ├── admin/posts/  # 管理员文章管理
│   │       └── leaderboard/  # 排行榜数据
│   │
│   ├── app/admin/comments/   # 评论管理（按时间线，可跳转原文）
│   ├── app/admin/reviews/    # 改名审核 + 用户文章管理
│   ├── app/my-posts/         # 用户文章管理
│   │   └── [id]/edit/        # 编辑文章
│   ├── app/settings/         # 个人设置（资料/积分/改名）
│   │
│   ├── app/users/[id]/       # 用户个人主页
│   │
│   ├── components/
│   │   ├── providers.tsx     # 主题 Provider
│   │   ├── layout/           # Header, Footer, ThemeToggle
│   │   ├── ui/               # PostCard, Pagination, LikeButton,
│   │   │                     # BookmarkButton, ViewCounter, 等
│   │   ├── comments/         # CommentSection（内建评论）
│   │   └── auth/             # AuthProvider
│   │
│   ├── hooks/
│   │   └── useAuth.tsx       # Auth Context + Hook
│   │
│   └── lib/
│       ├── constants.ts      # 常量（导航、分类、标签）
│       ├── posts.ts          # MDX 文章数据层
│       ├── auth.ts           # JWT 鉴权工具
│       ├── db/
│       │   ├── schema.ts     # Drizzle ORM schema
│       │   ├── index.ts      # DB 连接 + 自动建表
│       │   └── seed.ts       # 管理员种子数据
│       ├── format.ts
│       └── utils.ts
│
├── docs/                     # 📚 项目文档
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 核心功能模块

### 1. 文章系统

**两种文章来源：**

| 类型 | 存储 | 作者 | 特点 |
|------|------|------|------|
| MDX 文章 | `content/posts/*.md` | 管理员 | SSG 静态生成，速度快 |
| 用户文章 | SQLite `user_posts` 表 | 注册用户 | 动态渲染，支持排行榜 |

MDX 文章 YAML 前置元数据：

```yaml
---
title: "文章标题"
date: 2026-04-30
description: "文章摘要"
category: "frontend"
tags:
  - react
  - typescript
published: true
featured: true
---
```

### 2. 用户系统

**三种角色：**

| 角色 | 权限 |
|------|------|
| 👤 游客 | 浏览文章、搜索、查看排行榜 |
| 👥 普通用户 | 评论、点赞、收藏、发布文章、修改用户名（需审核） |
| ⚙️ 管理员 | 全部权限 + 用户管理（编辑权限、删除账号）+ 审核管理 |
| 👑 超级管理员 | 全部权限 + 不可被修改/删除 + 特殊标识 |

**超级管理员（weipeiluo）：**
- 系统预设的唯一超级管理员账号
- 头像带有金色皇冠动态标识（渐变 + 发光效果）
- 拥有管理员所有权限，且不能被普通管理员修改或删除
- `关于` 页面展示超级管理员的个人资料信息

### 3. 评论系统

- 内建评论系统，不依赖第三方
- 仅登录用户可评论
- 支持删除自己的评论（管理员可删除任意评论）
- 用户删除账号后，其评论会**匿名化保留**（显示"已注销"），不会丢失
- **评论管理**（管理员）：`/admin/comments` 按时间线展示所有评论，每条评论可跳转到原文

### 4. 用户个人主页

每个用户拥有独立的个人主页 `/users/[id]`：
- 用户信息（头像、用户名、角色、加入时间）
- 发布的文章列表
- 最近的评论列表
- 全局可点击：文章作者、评论区用户名、排行榜用户名 → 跳转至个人主页

### 5. 用户文章管理

**我的文章（`/my-posts`）：**
- 用户可管理自己发布的所有文章
- 操作：查看文章、编辑（标题/内容/分类/标签）、删除
- 编辑页面支持 Markdown 实时预览（编辑/预览模式切换）

**写文章（`/posts/new`）：**
- 所有登录用户均可发布文章
- 支持 Markdown 语法，实时预览
- 填写标题、分类、标签、摘要
- 发布后展示在文章列表中

### 6. 互动系统

| 功能 | 说明 |
|------|------|
| ❤️ 点赞 | 登录用户可点赞/取消点赞 |
| 🔖 收藏 | 登录用户可收藏/取消收藏 |
| 👁 浏览量 | 自动计数（每会话计一次） |

### 7. 审核管理

**改名审核流程：**
1. 用户在 `/settings` 提交改名申请
2. 用户名立即更新生效
3. 生成一条"待审核"记录
4. 管理员在 `/admin/reviews` 查看
5. 管理员可 **批准**（保留新名称）或 **驳回**（回滚到原名称）

**用户文章管理：**
- 管理员在 `/admin/reviews` 可查看所有用户发布的文章
- 支持操作：上架 / 下架（隐藏）、删除（永久移除）

### 8. 管理后台

- `/admin` — 系统概览
- `/admin/users` — 用户管理（编辑权限、切换角色、删除账号）
- `/admin/reviews` — 改名审核 + 用户文章管理
- `/admin/comments` — 评论管理（按时间线，可跳转原文）

### 8. 搜索（双栏搜索）

- **文章搜索** — 基于 Fuse.js 的客户端全文搜索，模糊匹配标题、描述、标签、分类
- **用户搜索** — 按用户名、个人简介搜索注册用户，结果以卡片展示
- 标签切换：文章/用户，实时搜索结果计数

### 9. 排行榜

按周期（日/周/月）统计用户积分排名，数据每 **60 秒**自动刷新：

**积分公式：**
```
单篇文章积分 = 浏览量 × 1 + 点赞量 × 5 + 收藏量 × 10
用户总积分 = 该周期内所有文章的积分之和
```

### 10. 其他功能

- 深色/亮色主题切换
- 12 个文章分类 / 23 个标签
- 分页导航
- 回到顶部
- Framer Motion 动画
- 赛博朋克风格 UI

---

## 数据库 Schema

```
users                → id, username, email, password_hash, role(user|admin|super_admin), permissions, ...
comments             → id, post_slug, author_id, content, created_at
likes                → id, post_slug, user_id, created_at (unique)
bookmarks            → id, post_slug, user_id, created_at (unique)
views                → id, post_slug, visitor_id, created_at
user_posts           → id, title, content, slug, author_id, likes_count, views_count, ...
name_change_requests → id, user_id, old_name, new_name, status(pending|approved|rejected), reviewed_by, reviewed_at, created_at
```

---

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `weipeiluo` | `weipeiluo123` | 超级管理员 |
| `admin` | `admin123` | 管理员 |
| `morn1ng` | `123456` | 测试用户 |
| `alice` | `123456` | 测试用户 |
| `bob` | `123456` | 测试用户 |

> ⚠️ 部署到生产环境后请立即修改密码
