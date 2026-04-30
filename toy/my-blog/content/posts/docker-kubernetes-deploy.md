---
title: "Docker 与 Kubernetes 容器化部署实战"
date: 2026-04-18
author: weipeiluo
description: "从 Docker 基础到 Kubernetes 编排，完整掌握容器化技术的核心概念和生产环境部署流程。"
category: "devops"
tags:
  - docker
  - kubernetes
  - devops
  - linux
published: true
featured: false
---

## Docker 基础

### Dockerfile 编写

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### 常用命令

```bash
docker build -t my-app .
docker run -d -p 3000:3000 my-app
docker compose up -d
```

## Kubernetes 编排

### Pod 与 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:latest
        ports:
        - containerPort: 3000
```

### 生产环境注意事项

1. 资源限制（CPU/Memory）
2. 健康检查（Liveness/Readiness Probe）
3. 配置管理（ConfigMap/Secret）
4. 日志收集
5. 监控告警

## CI/CD 集成

将 Docker 和 K8s 集成到 CI/CD 流水线中，实现自动构建、测试和部署。
