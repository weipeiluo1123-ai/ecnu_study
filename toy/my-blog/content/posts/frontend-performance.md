---
title: "前端性能优化：从加载到渲染的全面提速"
date: 2026-04-10
author: weipeiluo
description: "系统梳理前端性能优化策略，涵盖资源加载、JavaScript 执行、渲染性能、缓存策略和 Core Web Vitals。"
category: "frontend"
tags:
  - performance
  - javascript
  - nextjs
published: true
featured: false
---

## Core Web Vitals

### LCP (Largest Contentful Paint)

目标：< 2.5s，优化最大内容元素的加载时间。

### FID (First Input Delay)

目标：< 100ms，优化 JavaScript 执行对交互响应的影响。

### CLS (Cumulative Layout Shift)

目标：< 0.1，避免页面布局偏移。

## 资源加载优化

### 图片优化

```tsx
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  priority
  placeholder="blur"
  alt="Hero"
/>
```

### 代码分割

使用 dynamic import 按需加载组件：

```tsx
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
});
```

## 渲染优化

1. 避免不必要的重渲染
2. 使用 `useMemo` 和 `useCallback`
3. 虚拟列表处理大数据集
4. Web Worker 处理计算密集型任务

## 缓存策略

- Service Worker 缓存
- HTTP 缓存头
- CDN 边缘缓存
- 内存缓存（Redis/Memcached）
