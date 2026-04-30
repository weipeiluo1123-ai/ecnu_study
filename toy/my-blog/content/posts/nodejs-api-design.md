---
title: "Node.js 后端开发：API 设计与数据库最佳实践"
date: 2026-04-24
author: weipeiluo
description: "使用 Node.js 构建高性能 RESTful API，涵盖 Express/Fastify 框架选择、数据库设计、认证授权和性能优化。"
category: "backend"
tags:
  - nodejs
  - api
  - database
  - security
published: true
featured: false
---

## 框架选择

Node.js 生态中有多个优秀的后端框架，各自有不同的优势。

### Express vs Fastify

| 特性 | Express | Fastify |
|------|---------|---------|
| 生态 | 庞大成熟 | 快速增长 |
| 性能 | 中等 | 高性能 |
| 插件系统 | 中间件 | 插件化 |
| TypeScript | 基础支持 | 一等支持 |

## API 设计原则

### RESTful 规范

```
GET    /api/posts       # 获取列表
POST   /api/posts       # 创建资源
GET    /api/posts/:id   # 获取详情
PATCH  /api/posts/:id   # 更新资源
DELETE /api/posts/:id   # 删除资源
```

### 数据库设计

使用 Drizzle ORM 连接 SQLite，类型安全的查询构建：

```typescript
const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
});

const result = db.select().from(users).where(eq(users.username, "admin")).get();
```

## 安全实践

- JWT + httpOnly Cookie 认证
- bcrypt 密码加密（10 轮 salt）
- 权限分层：用户/管理员/超级管理员
