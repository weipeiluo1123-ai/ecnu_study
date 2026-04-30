---
title: "前端测试策略：从单元测试到 E2E"
date: 2026-04-14
author: weipeiluo
description: "构建完整的前端测试体系，涵盖 Vitest 单元测试、Playwright E2E 测试、组件测试和性能测试。"
category: "frontend"
tags:
  - testing
  - javascript
  - performance
published: true
featured: false
---

## 测试金字塔

### 单元测试

使用 Vitest 进行快速、隔离的单元测试：

```typescript
import { describe, it, expect } from "vitest";

function add(a: number, b: number) {
  return a + b;
}

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

### 组件测试

使用 Testing Library 测试组件行为和可访问性。

### E2E 测试

使用 Playwright 模拟用户真实操作：

```typescript
test("user can login", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "admin123");
  await page.click("button[type='submit']");
  await expect(page.locator(".user-menu")).toBeVisible();
});
```

## 性能测试

使用 Lighthouse CI 监控性能指标，确保用户体验。

## 测试最佳实践

1. 测试行为而非实现
2. 避免过度 mocking
3. 关注用户关键路径
4. 持续集成中运行测试
