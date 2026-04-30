---
title: "Web 安全入门：常见漏洞与防护实践"
date: 2026-04-08
author: weipeiluo
description: "深入理解 XSS、CSRF、SQL 注入、点击劫持等常见 Web 安全漏洞的原理与防护方案。"
category: "security"
tags:
  - security
  - javascript
  - api
published: true
featured: false
---

## 常见 Web 漏洞

### XSS（跨站脚本攻击）

**原理**：攻击者在页面中注入恶意脚本。

**防护**：
- 输入验证和输出编码
- Content-Security-Policy HTTP 头
- httpOnly Cookie 防止脚本读取

### CSRF（跨站请求伪造）

**防护**：
- SameSite Cookie 属性
- CSRF Token
- 关键操作二次确认

### SQL 注入

使用 ORM 参数化查询避免 SQL 注入：

```typescript
// 安全的 ORM 查询
db.select().from(users).where(eq(users.username, username)).get();
```

## 认证安全

### JWT 最佳实践

1. 使用 httpOnly Cookie 存储 token
2. 设置合理的过期时间（7 天）
3. HTTPS 传输
4. 密钥轮换

### 密码安全

```typescript
const hash = await bcrypt.hash(password, 10);
// 绝不明文存储密码
```

## 安全头配置

```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

## 总结

安全是一个持续的 process，需要持续关注和更新。
