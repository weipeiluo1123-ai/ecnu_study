---
title: "Git 高级技巧与团队协作工作流"
date: 2026-04-16
author: weipeiluo
description: "掌握 Git 的高级用法：交互式 Rebase、Git Hooks、Git Worktree，以及团队协作中的分支管理策略。"
category: "tooling"
tags:
  - git
  - testing
  - tutorial
published: true
featured: false
---

## 交互式 Rebase

```bash
git rebase -i HEAD~5
# pick, squash, reword, edit, drop
```

### 合并提交

将多个小提交合并为一个有意义的提交，保持历史清晰。

## Git Hooks

在 Git 操作的各个阶段触发自定义脚本：

- **pre-commit**: 代码格式化、lint 检查
- **commit-msg**: 提交信息格式校验
- **pre-push**: 运行测试、构建检查

## Git Worktree

同时处理多个分支，无需切换目录：

```bash
git worktree add ../branch-fix fix-branch
```

## 分支策略

### Git Flow

- `main` — 生产分支
- `develop` — 开发分支
- `feature/*` — 功能分支
- `hotfix/*` — 紧急修复

### 简洁的 Trunk-Based

- `main` — 主干，短生命周期分支
- 频繁合并，减少冲突

## 测试与 CI

结合 GitHub Actions 实现自动化测试和部署。
