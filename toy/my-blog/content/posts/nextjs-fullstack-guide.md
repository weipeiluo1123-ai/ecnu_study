---
title: "Next.js 16 全栈开发：从 App Router 到数据库"
date: 2026-04-26
author: weipeiluo
description: "从头搭建一个基于 Next.js 16 的全栈应用，涵盖 App Router、Server Components、数据库集成和部署最佳实践。"
category: "frontend"
tags:
  - nextjs
  - typescript
  - tailwind
  - framer-motion
published: true
featured: true
---

## Next.js 16 的新变化

Next.js 16 在性能、开发者体验和稳定性方面都有显著提升。

### App Router 深入解析

App Router 基于文件系统的路由机制，支持布局嵌套、加载状态和错误边界。

```
app/
├── layout.tsx        # 根布局
├── page.tsx          # 首页
├── posts/
│   ├── page.tsx      # 文章列表
│   └── [slug]/
│       └── page.tsx  # 文章详情
└── api/
    └── route.ts      # API 路由
```

### Server Components 优势

- 减少客户端 JavaScript 体积
- 直接访问数据库和后端资源
- 自动代码分割

## 样式方案

### Tailwind CSS v4

CSS-first 配置，结合 `@theme` 自定义设计系统。

### Framer Motion 动画

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animated Content
</motion.div>
```

## 部署

使用 PM2 持久化运行，支持 Windows 和 Linux 服务器。
