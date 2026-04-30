# 内容管理指南

## 如何写一篇新文章

### 1. 创建文件

在 `content/posts/` 目录下新建 `.md` 文件，文件名作为 URL slug：

```
content/posts/
├── hello-world.md              → /posts/hello-world
├── react-server-components.md  → /posts/react-server-components
└── my-new-post.md              ← 新建的文件
```

### 2. 填写元数据

文件头部 YAML 前置元数据示例：

```yaml
---
title: "我的新文章"
date: 2026-05-01
author: admin           # 作者用户名（需在数据库中存在）
description: "这篇文章讲述了..."
category: "frontend"
tags:
  - react
  - typescript
  - tutorial
published: true
featured: false
coverImage: "/images/cover.jpg"
---
```

### 3. 编写正文

正文使用标准 Markdown 语法：

```markdown
## 章节标题

这是一段正文。

### 小标题

- 列表项 1
- 列表项 2

```tsx
// 代码块 (带语言标识支持语法高亮)
const greeting = "Hello World";
```

> 引用文本

| 表头1 | 表头2 |
|-------|-------|
| 内容1 | 内容2 |
```

### 4. 预览

```bash
npm run dev
# 访问 http://localhost:3000/posts/my-new-post
```

---

## 可用分类

| Slug | 分类名称 |
|------|---------|
| `frontend` | 前端开发 |
| `backend` | 后端开发 |
| `devops` | 运维与部署 |
| `ai-ml` | 人工智能 |
| `algorithm` | 算法与数据结构 |
| `system-design` | 系统设计 |
| `tooling` | 开发工具 |
| `mobile` | 移动开发 |
| `security` | 安全技术 |
| `career` | 职业成长 |
| `notes` | 学习笔记 |
| `projects` | 项目实战 |

---

## 可用标签

`react` `nextjs` `typescript` `javascript` `nodejs` `python` `rust` `go` `docker` `kubernetes` `tailwind` `framer-motion` `database` `api` `testing` `git` `linux` `performance` `security` `ai` `llm` `tutorial` `心得`

---

## 元数据字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题，会显示在页面标题和卡片上 |
| `date` | ✅ | 发布日期，格式 `YYYY-MM-DD` |
| `description` | ✅ | 文章摘要，显示在文章卡片和 SEO meta |
| `author` | ❌ | 作者用户名，默认 `admin`，需在数据库 users 表中存在 |
| `category` | ✅ | 分类 slug，必须在 CATEGORIES 中定义 |
| `tags` | ❌ | 标签列表，建议 1-5 个 |
| `published` | ❌ | 默认 `true`，设为 `false` 则不会出现在列表中 |
| `featured` | ❌ | 默认 `false`，设为 `true` 会在首页"精选文章"展示 |
| `coverImage` | ❌ | 封面图路径，放在 `public/images/` 下 |
| `updated` | ❌ | 更新日期，有重大修改时可以加上 |

---

## 批量生成文章

项目提供了批量生成文章的脚本，用于快速填充内容：

```bash
node scripts/seed-posts.js
```

该脚本会为超级管理员 **weipeiluo** 生成 23 篇文章，每个标签一篇，涵盖所有技术主题。每篇文章包含 2-3 段关于对应技术主题的实用内容。

### 注意事项

- 脚本直接写入数据库，不会创建 .md 文件
- 已存在的文章会跳过（通过 slug 前缀 `seed-` 识别）
- 生成的文章会被所有页面自动展示（文章列表、分类、标签、搜索、个人主页）
- 运行脚本后无需重新构建，页面会在 60 秒内通过 ISR 自动刷新

---

## 用户发布文章

所有注册用户均可通过网页发布文章：

1. 登录后访问 `/posts/new` 或点击"写文章"
2. 填写标题、选择分类、标签、摘要
3. 使用 Markdown 编写内容
4. 点击发布
5. 发布成功后自动跳转到文章列表页，新文章即刻可见

用户发布的文章与 MDX 文章**统一展示**在所有列表页面（文章列表、分类、标签、搜索），通过 ISR（60 秒）保持内容及时更新。

---

## Git 工作流建议

```
1. MacBook 上写文章
   → content/posts/my-new-post.md

2. 预览确认无误
   → npm run dev

3. 提交推送
   → git add content/posts/my-new-post.md
   → git commit -m "add: 新文章 - 标题"
   → git push

4. Windows 服务器拉取部署
   → git pull
   → npm run build
   → pm2 restart nexus-blog
```

---

## 写作建议

1. **文件名用英文 kebab-case** — `my-new-post.md`，SEO 友好
2. **description 控制在 120 字以内** — 搜索引擎展示摘要
3. **代码块标注语言** — 启用语法高亮
4. **配图放 `public/images/`** — 引用时用 `/images/xxx.jpg`
5. **标签最多 5 个** — 精准比多更重要
6. **文章里可以插 MDX 组件** — `.mdx` 文件支持嵌入 React 组件
