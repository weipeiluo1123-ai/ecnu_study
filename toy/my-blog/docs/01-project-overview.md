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
| **nodemailer** | SMTP 邮件发送（验证码） |
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
│   │   ├── page.tsx          # 网关首页（项目门户/导航页）
│   │   ├── home/
│   │   │   └── page.tsx      # 博客首页（精选文章/分类/标签）
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

MDX 文章在中文档中算作对应作者的**归属文章**，在个人主页、排行榜、个人设置积分中均被纳入统计。

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

**注册流程（邮箱验证）：**
```
填写邮箱 → 点击发送验证码 → QQ SMTP 发送 6 位验证码 → 输入验证码 → 校验通过 → 注册成功
```
- 验证码 5 分钟有效，60 秒内不可重复发送
- QQ SMTP 会检测邮箱是否存在，不存在的邮箱会提示用户
- 注册成功后 `email_verified` 字段标记为已验证

**超级管理员（weipeiluo）：**
- 系统预设的唯一超级管理员账号
- 头像带有金色皇冠动态标识（渐变 + 发光效果）
- 拥有管理员所有权限，且不能被普通管理员修改或删除
- `关于` 页面展示超级管理员的个人资料信息

### 3. 评论系统

- 内建评论系统，不依赖第三方
- 仅登录用户可评论
- 支持**多级嵌套回复**，可对任意评论进行回复，回复内容带 @提及
- 评论内容支持简单 Markdown 格式（**加粗**、*斜体*、`代码`、[链接](url)）
- 评论输入框旁有 **Emoji 选择器**，分类展示常用表情
- 删除评论时同时删除其所有子回复
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
- 操作：点击卡片查看文章、编辑（标题/内容/分类/标签）、删除（仅数据库文章）
- 编辑页面支持 Markdown 实时预览（编辑/预览模式切换）

**写文章（`/posts/new`）：**
- 所有登录用户均可发布文章
- 支持 Markdown 语法，实时预览
- 填写标题、分类、标签、摘要
- 发布后展示在文章列表中

### 6. 互动系统

| 功能 | 说明 |
|------|------|
| ❤️ 点赞 | 登录用户可点赞/取消点赞；文章底部有独立大号圆形按钮 |
| 🔖 收藏 | 登录用户可收藏/取消收藏；文章底部有独立大号圆形按钮 |
| 👁 浏览量 | 自动计数（每次访问+1） |

**文章卡片展示：**
- 文章列表卡片上显示点赞数和收藏数（取代阅读时长）
- 文章详情页顶部信息栏显示点赞/收藏/浏览
- 文章内容底部有加大圆形点赞和收藏按钮，更显眼易操作

**文章格式：**
- 用户发布文章时可选择 **Markdown** 或 **TXT** 格式
- Markdown 格式：渲染为 HTML（标题、代码块、链接、图片等）
- TXT 格式：按纯文本等宽展示，保留原始空白
- 格式可在编辑时切换

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

四个时间维度统计用户积分排名，数据每 **60 秒**自动刷新。前端展示每页 **10 人**，容器高度容纳约 5 人，超出部分可滚动查看：

| 标签 | 统计范围 |
|------|---------|
| 总分 | 全部时间（累计） |
| 每日 | 过去 24 小时 |
| 每周 | 过去 7 天 |
| 每月 | 过去 30 天 |

**积分公式：**
```
单篇文章积分 = 浏览量 × 1 + 点赞量 × 5 + 收藏量 × 10
用户总积分 = 该周期内所有文章的积分之和
```

积分从 `likes`、`bookmarks`、`views` 事件表中按时间范围过滤聚合，使用 **GROUP BY 批量聚合查询**代替逐文章查询（N+1 → 3 次查询），不同周期展示不同结果。默认展示"总分"（全部时间）。

### 10. 其他功能

- 深色/亮色主题切换
- 12 个文章分类 / 30 个标签
- 分页导航
- 回到顶部
- Framer Motion 动画
- 赛博朋克风格 UI

---

## 数据库 Schema

```
users                → id, username, email, password_hash, email_verified, role(user|admin|super_admin), permissions, bio, created_at
comments             → id, post_slug, author_id, content, parent_id, created_at
likes                → id, post_slug, user_id, created_at (unique)
bookmarks            → id, post_slug, user_id, created_at (unique)
views                → id, post_slug, visitor_id, created_at
user_posts           → id, title, content, description, slug, category, tags, format(markdown|txt), author_id, isPublished, likes_count, views_count, bookmarks_count, created_at, updated_at
name_change_requests → id, user_id, old_name, new_name, status(pending|approved|rejected), reviewed_by, reviewed_at, created_at
verification_codes   → id, email, code, type(register|reset), expires_at, used_at, created_at
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
