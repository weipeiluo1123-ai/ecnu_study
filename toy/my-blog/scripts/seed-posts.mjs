import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "blog.db");
const db = new Database(dbPath);

const AUTHOR_ID = 5; // weipeiluo (super_admin)

const articles = [
  // ── frontend (3) ──
  {
    title: "React 19 新特性深度解析",
    content: `# React 19 新特性深度解析

React 19 带来了许多令人兴奋的新特性，本文将从实际开发角度深入分析这些变化。

## React Server Components（RSC）

RSC 是 React 19 中最重大的变化之一。它允许组件在服务器端渲染，减少客户端 JavaScript 体积。

\`\`\`tsx
// 这是一个 Server Component
async function PostList() {
  const posts = await db.query.posts.findAll();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Actions

React 19 引入了 Actions，让表单处理变得更加简单：

\`\`\`tsx
function CreatePost() {
  async function submit(formData: FormData) {
    'use server';
    await db.insert(formData);
    redirect('/posts');
  }
  return <form action={submit}>...</form>;
}
\`\`\`

## 新 Hooks

### use() Hook
可以在条件语句中直接使用 Promise：

\`\`\`tsx
function Comments({ promise }) {
  const comments = use(promise);
  return comments.map(c => <Comment key={c.id} data={c} />);
}
\`\`\`

## 总结

React 19 标志着 React 向全栈框架转变的关键一步。Server Components 和 Actions 让前后端协作更加自然，值得每个 React 开发者深入学习。`,
    description: "React 19 带来了 RSC、Actions、use() Hook 等重大更新，本文深入解析这些新特性的使用方法与最佳实践。",
    category: "frontend",
    tags: ["react", "javascript", "nextjs", "tutorial"],
  },
  {
    title: "Tailwind CSS v4 新特性与迁移指南",
    content: `# Tailwind CSS v4 新特性与迁移指南

Tailwind CSS v4 是一次重大更新，带来了全新的引擎和更简洁的配置方式。

## 全新引擎

v4 使用全新的 CSS-first 配置方式，不再需要 \`tailwind.config.js\`：

\`\`\`css
@import "tailwindcss";
@theme {
  --color-neon-cyan: #00f0ff;
  --font-display: "Geist", sans-serif;
}
\`\`\`

## 新的变体语法

\`\`\`html
<div class="lg:x:flex">
  <!-- 仅在大屏且非悬停时 flex -->
</div>
\`\`\`

## 自动内容检测

v4 会自动检测模板文件，无需手动配置 \`content\` 路径，大幅简化了项目设置。

## 迁移建议

1. 移除 \`tailwind.config.js\`，改用 CSS 配置
2. 更新 PostCSS 插件配置
3. 测试所有自定义主题变量

## 实际项目体验

在本博客中，我们已经全面采用了 Tailwind CSS v4，配合 Framer Motion 实现了流畅的动画效果。新的 CSS-first 配置方式让主题定制更加直观。`,
    description: "Tailwind CSS v4 引入了 CSS-first 配置、自动内容检测等重大更新，本文介绍新特性并提供迁移指南。",
    category: "frontend",
    tags: ["tailwind", "css", "react", "tutorial"],
  },
  {
    title: "TypeScript 5.x 高级技巧与模式",
    content: `# TypeScript 5.x 高级技巧与模式

TypeScript 5.x 带来了一系列强大的类型系统增强。本文整理了一些实用的高级技巧。

## 模板字面量类型

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`;
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIEndpoint = \`/api/\${string}/\${HTTPMethod}\`;
\`\`\`

## 条件类型与 infer

\`\`\`typescript
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type FunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// 实际应用：提取 API 返回类型
type ApiResponse<T> = { data: T; error?: string };
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;
\`\`\`

## const 类型参数

\`\`\`typescript
function tuple<T extends readonly string[]>(...args: T): T {
  return args;
}

const result = tuple("a", "b", "c");
// type: readonly ["a", "b", "c"] 而非 string[]
\`\`\`

## satisfies 操作符

\`\`\`typescript
const config = {
  port: 3000,
  host: "localhost",
} satisfies Record<string, string | number>;

// port 被推断为 number 而非 string | number
\`\`\`

善用这些高级类型特性，可以大幅提升代码的类型安全性和可维护性。`,
    description: "深入讲解 TypeScript 5.x 的模板字面量类型、条件类型 infer、const 类型参数和 satisfies 操作符等高级特性。",
    category: "frontend",
    tags: ["typescript", "javascript", "tutorial"],
  },

  // ── backend (3) ──
  {
    title: "Node.js 异步编程进化史：从回调到 Async/Await",
    content: `# Node.js 异步编程进化史：从回调到 Async/Await

Node.js 的异步编程模型经历了多次重大演进，理解这段历史对掌握现代 JavaScript 开发至关重要。

## 回调时代（Callback Hell）

早期 Node.js 使用 Error-First Callback 模式：

\`\`\`javascript
fs.readFile('config.json', (err, data) => {
  if (err) return console.error(err);
  parseConfig(data, (err, config) => {
    if (err) return console.error(err);
    connectDB(config, (err, db) => {
      // 回调地狱...
    });
  });
});
\`\`\`

## Promise 时代

ES6 引入 Promise，解决了回调地狱的问题：

\`\`\`javascript
fs.promises.readFile('config.json')
  .then(data => parseConfig(data))
  .then(config => connectDB(config))
  .catch(err => console.error(err));
\`\`\`

## Async/Await 时代

ES2017 引入 async/await，让异步代码看起来像同步代码：

\`\`\`javascript
async function bootstrap() {
  try {
    const data = await fs.promises.readFile('config.json');
    const config = await parseConfig(data);
    const db = await connectDB(config);
    return db;
  } catch (err) {
    console.error('启动失败:', err);
    process.exit(1);
  }
}
\`\`\`

异步编程的演进体现了 JavaScript 生态系统的成熟，掌握这些模式是每个 Node.js 开发者的必修课。`,
    description: "从 Callback 到 Promise 再到 Async/Await，回顾 Node.js 异步编程模型的演进历程，附带实战代码示例。",
    category: "backend",
    tags: ["nodejs", "javascript", "tutorial", "insights"],
  },
  {
    title: "API 设计最佳实践：RESTful 与 GraphQL 的选择",
    content: `# API 设计最佳实践：RESTful 与 GraphQL 的选择

设计良好的 API 是前后端协作的基础。本文结合实际项目经验，讨论 RESTful 和 GraphQL 的选型策略。

## RESTful 设计原则

### 资源命名

\`\`\`
GET    /api/posts         查询文章列表
GET    /api/posts/:id     查询单篇文章
POST   /api/posts         创建文章
PATCH  /api/posts/:id     更新文章
DELETE /api/posts/:id     删除文章
\`\`\`

### 分页与过滤

\`\`\`
GET /api/posts?page=1&limit=10&category=frontend&sort=createdAt
\`\`\`

### 状态码使用

- 200：成功
- 201：创建成功
- 400：请求参数错误
- 401：未认证
- 403：无权限
- 404：资源不存在

## GraphQL 的优势

GraphQL 允许客户端精确指定所需字段：

\`\`\`graphql
query {
  post(slug: "api-design") {
    title
    author { username }
    tags
  }
}
\`\`\`

## 选型建议

| 场景 | 推荐方案 |
|------|---------|
| 简单 CRUD | REST |
| 复杂数据关联 | GraphQL |
| 微服务通信 | gRPC |
| 实时推送 | WebSocket |

在本博客中，我们选择了 RESTful API 设计，因为它简单直观，适合博客系统的数据模型。`,
    description: "深入探讨 RESTful 和 GraphQL 的 API 设计理念、最佳实践与选型策略，附实际项目案例分析。",
    category: "backend",
    tags: ["api", "nodejs", "javascript", "insights"],
  },
  {
    title: "Rust vs Go：2026 年后端开发语言对比",
    content: `# Rust vs Go：2026 年后端开发语言对比

Rust 和 Go 是现代系统编程和后端开发的热门选择。本文从多个维度进行对比分析。

## 性能对比

### Go
- 轻量级 Goroutine，百万级并发
- GC 暂停时间通常 <1ms
- 编译速度极快

### Rust
- 零成本抽象，无运行时开销
- 无 GC，通过所有权机制保证内存安全
- 编译速度较慢

## 开发体验

\`\`\`go
// Go：简洁直接
func main() {
    http.HandleFunc("/", handler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}
\`\`\`

\`\`\`rust
// Rust：严谨安全
fn main() {
    let app = Router::new()
        .route("/", get(handler));
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
\`\`\`

## 生态对比

| 维度 | Go | Rust |
|------|-----|------|
| Web框架 | Gin, Echo | Axum, Actix |
| 数据库驱动 | 成熟 | 发展中 |
| 云原生 | 极佳 | 良好 |
| 学习曲线 | 平缓 | 陡峭 |

## 选型建议

- **云原生开发、API 服务**：Go 是最佳选择
- **系统工具、性能敏感场景**：Rust 更有优势
- **团队新手友好**：Go 上手更快

两种语言各有优势，选择取决于项目需求和团队背景。`,
    description: "从性能、开发体验、生态系统等维度对比 Rust 和 Go，为后端技术选型提供参考。",
    category: "backend",
    tags: ["rust", "go", "backend", "performance"],
  },

  // ── devops (3) ──
  {
    title: "Docker 容器化部署实战：从开发到生产",
    content: `# Docker 容器化部署实战：从开发到生产

Docker 已经成为现代应用部署的标准方式。本文分享从开发环境到生产部署的完整容器化实践。

## Dockerfile 优化

\`\`\`dockerfile
# 多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Docker Compose 多服务编排

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
\`\`\`

## 健康检查与重启策略

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\\
  CMD curl -f http://localhost:3000/api/health || exit 1
\`\`\`

容器化部署不仅简化了部署流程，还确保了开发环境与生产环境的一致性，是现代化运维的基石。`,
    description: "从 Dockerfile 优化、多阶段构建到 Docker Compose 编排，分享容器化部署的完整实战经验。",
    category: "devops",
    tags: ["docker", "devops", "tutorial"],
  },
  {
    title: "Kubernetes 入门：从 Docker Compose 到 K8s",
    content: `# Kubernetes 入门：从 Docker Compose 到 K8s

当你的应用需要从单机扩展到集群时，Kubernetes 是不二之选。本文帮助 Docker 用户快速上手 K8s。

## 核心概念

| 概念 | 作用 |
|------|------|
| Pod | 最小部署单元 |
| Service | 网络抽象层 |
| Deployment | 声明式更新 |
| ConfigMap | 配置管理 |
| Ingress | 外部访问入口 |

## 从 Docker Compose 迁移

### Docker Compose 配置

\`\`\`yaml
services:
  web:
    image: myapp:latest
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
\`\`\`

### 对应的 K8s 配置

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          value: db-service
\`\`\`

## 常用命令

\`\`\`bash
kubectl get pods -w
kubectl logs deployment/web -f
kubectl port-forward service/web-service 3000:80
kubectl set image deployment/web web=myapp:v2
\`\`\`

掌握 Kubernetes 是云原生时代的必备技能，建议从 minikube 开始本地练习。`,
    description: "帮助 Docker 用户快速上手 Kubernetes，从核心概念到实战迁移，涵盖 Deployment、Service、常用命令等。",
    category: "devops",
    tags: ["kubernetes", "docker", "devops", "tutorial"],
  },
  {
    title: "Linux 服务器运维常用命令速查",
    content: `# Linux 服务器运维常用命令速查

Linux 运维是后端开发者的必备技能。本文整理了最常用的服务器运维命令。

## 系统信息

\`\`\`bash
# 查看系统版本
cat /etc/os-release
uname -a

# 查看 CPU 信息
lscpu
nproc

# 查看内存
free -h

# 查看磁盘
df -h
du -sh /var/log
\`\`\`

## 进程管理

\`\`\`bash
# 查看进程
ps aux | grep nginx
htop  # 交互式进程管理器

# 端口占用
netstat -tlnp
ss -tlnp

# 后台运行
nohup npm start > app.log 2>&1 &
systemctl start nginx
\`\`\`

## 日志查看

\`\`\`bash
# 实时查看日志
tail -f /var/log/nginx/access.log

# 搜索日志
grep "ERROR" app.log | head -20

# 统计 IP 访问
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
\`\`\`

## 网络排查

\`\`\`bash
# DNS 查询
nslookup weipeiluo.space
dig weipeiluo.space

# HTTP 请求测试
curl -sI https://weipeiluo.space
\`\`\`

## 安全配置

\`\`\`bash
# 防火墙
ufw status
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
\`\`\`

掌握这些命令，可以高效地进行日常服务器运维工作。`,
    description: "Linux 服务器运维常用命令速查，涵盖系统信息、进程管理、日志查看、网络排查和安全配置。",
    category: "devops",
    tags: ["linux", "devops", "tutorial"],
  },

  // ── ai-ml (3) ──
  {
    title: "大语言模型（LLM）应用开发实战",
    content: `# 大语言模型（LLM）应用开发实战

LLM 正在重塑软件开发的方式。本文分享开发 LLM 应用的核心技术和最佳实践。

## Prompt Engineering

好的 Prompt 是 LLM 应用成功的关键：

\`\`\`python
system_prompt = """你是一个技术写作助手。
请根据提供的技术要点，生成清晰、结构化的中文技术文章。
使用适当的 Markdown 格式，包括标题、代码块和列表。"""

user_prompt = f"请解释 React Server Components 的工作原理，目标读者是中级前端开发者。"
\`\`\`

## Retrieval-Augmented Generation（RAG）

RAG 是将外部知识库与 LLM 结合的有效方法：

\`\`\`python
# 1. 文档向量化
documents = load_documents()
chunks = split_into_chunks(documents)
embeddings = embed_model.encode(chunks)

# 2. 检索相关上下文
query_embedding = embed_model.encode(user_query)
relevant_chunks = similarity_search(query_embedding, embeddings, top_k=3)

# 3. 生成回答
context = "\\n".join(relevant_chunks)
response = llm.generate(f"基于以下上下文回答问题：\\n{context}\\n\\n问题：{user_query}")
\`\`\`

## 流式输出

流式输出可以显著提升用户体验：

\`\`\`python
async def stream_response(prompt):
    async for chunk in llm.stream(prompt):
        yield chunk
        await asyncio.sleep(0.01)
\`\`\`

## 安全注意事项

1. 输入验证：过滤恶意 Prompt 注入
2. 输出审核：防止生成不当内容
3. 成本控制：设置 Token 上限
4. 隐私保护：不在 Prompt 中泄露敏感信息

LLM 应用的潜力巨大，但也需要谨慎对待其局限性和风险。`,
    description: "从 Prompt Engineering、RAG 到流式输出，全面讲解大语言模型应用的开发实践与安全注意事项。",
    category: "ai-ml",
    tags: ["ai", "llm", "python", "tutorial"],
  },
  {
    title: "机器学习模型部署：从训练到生产",
    content: `# 机器学习模型部署：从训练到生产

将机器学习模型部署到生产环境是数据科学项目中极具挑战性的环节。

## 模型序列化

\`\`\`python
import joblib
import onnx
from sklearn.ensemble import RandomForestClassifier

# 训练模型
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 序列化保存
joblib.dump(model, 'model.pkl')

# 转换为 ONNX 格式
onnx_model = onnx.convert_sklearn(model)
onnx.save_model(onnx_model, 'model.onnx')
\`\`\`

## 模型服务化

使用 FastAPI 构建模型推理 API：

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
model = joblib.load('model.pkl')

class PredictionRequest(BaseModel):
    features: list[float]

@app.post("/predict")
async def predict(request: PredictionRequest):
    prediction = model.predict([request.features])
    return {"prediction": prediction.tolist()}
\`\`\`

## 性能监控

生产环境中的模型需要持续监控：
- 推理延迟（P50/P95/P99）
- 预测分布偏移
- 特征数据质量

## A/B 测试

部署新模型时，建议通过 A/B 测试逐步放量，确保模型效果。`,
    description: "从模型序列化、ONNX 转换到 FastAPI 服务化部署，讲解 ML 模型上线的完整流程与监控策略。",
    category: "ai-ml",
    tags: ["ai", "python", "api", "tutorial"],
  },
  {
    title: "AI 辅助编程：如何高效使用 Copilot 与 Cursor",
    content: `# AI 辅助编程：如何高效使用 Copilot 与 Cursor

AI 编程助手正在改变开发者的工作方式。本文分享使用 GitHub Copilot 和 Cursor 的实战经验。

## Copilot 高效使用技巧

### 写好注释

\`\`\`typescript
// 生成一个分页函数，接收页码和每页数量，返回当前页数据和总页数
function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    totalPages: Math.ceil(items.length / pageSize),
    currentPage: page,
  };
}
\`\`\`

### 利用 Context

Copilot 会读取当前文件和相关文件作为上下文。保持文件结构清晰，Copilot 的补全会更准确。

## Cursor 的高级功能

Cursor 的 Composer 功能可以同时修改多个文件。

## 最佳实践

1. **审查生成的代码**：AI 生成的代码需要人工审查
2. **逐步提示**：复杂功能拆分为多个步骤
3. **提供示例**：给出类似的代码示例可以显著提升生成质量
4. **理解而非盲从**：理解 AI 生成的代码逻辑，确保符合项目规范

AI 编程助手是强大的生产力工具，但本质是辅助而非替代。`,
    description: "分享 GitHub Copilot 和 Cursor 的高效使用技巧，包括 Prompt 编写、Context 利用和代码审查策略。",
    category: "ai-ml",
    tags: ["ai", "llm", "tooling", "insights"],
  },

  // ── algorithm (3) ──
  {
    title: "动态规划入门：从斐波那契到背包问题",
    content: `# 动态规划入门：从斐波那契到背包问题

动态规划是算法面试中的重点和难点。本文从基础到进阶，系统讲解 DP 的核心思想。

## 什么是动态规划

动态规划的核心思想是将复杂问题分解为子问题，并缓存子问题的解以避免重复计算。

## 斐波那契数列

\`\`\`cpp
// 递归（指数级复杂度）
int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}

// 记忆化搜索（O(n)）
int fib(int n, vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fib(n-1, memo) + fib(n-2, memo);
}

// 自底向上（O(n)，O(1)空间）
int fib(int n) {
    if (n <= 1) return n;
    int prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) {
        int next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}
\`\`\`

## 0-1 背包问题

\`\`\`cpp
int knapsack(vector<int>& weights, vector<int>& values, int capacity) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= capacity; w++) {
            if (weights[i-1] <= w) {
                dp[i][w] = max(dp[i-1][w], dp[i-1][w - weights[i-1]] + values[i-1]);
            } else {
                dp[i][w] = dp[i-1][w];
            }
        }
    }
    return dp[n][capacity];
}
\`\`\`

## 经典 DP 问题分类

1. 线性 DP：最长递增子序列
2. 区间 DP：矩阵链乘
3. 树形 DP：树上最大独立集

掌握 DP 的关键是多练习、多总结模式。`,
    description: "从斐波那契数列到 0-1 背包问题，系统讲解动态规划的核心思想、状态定义和转移方程。",
    category: "algorithm",
    tags: ["cpp", "algorithm", "tutorial"],
  },
  {
    title: "排序算法可视化：从冒泡到 TimSort",
    content: `# 排序算法可视化：从冒泡到 TimSort

排序算法是计算机科学的基础。本文通过可视化的方式，帮助理解各种排序算法的原理与性能。

## 时间复杂度总览

| 算法 | 平均 | 最坏 | 最好 | 空间 |
|------|------|------|------|------|
| 冒泡排序 | O(n²) | O(n²) | O(n) | O(1) |
| 快速排序 | O(n log n) | O(n²) | O(n log n) | O(log n) |
| 归并排序 | O(n log n) | O(n log n) | O(n log n) | O(n) |
| 堆排序 | O(n log n) | O(n log n) | O(n log n) | O(1) |

## 快速排序

\`\`\`cpp
int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) swap(arr[++i], arr[j]);
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}
void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
\`\`\`

## Python 的 TimSort

Python 内置的 \`sorted()\` 使用 TimSort 算法，它是归并排序和插入排序的混合体，利用了现实数据中存在的有序片段。

理解排序算法不仅有助于面试，更能帮助在实际开发中选择合适的数据处理策略。`,
    description: "通过可视化和代码示例，从冒泡排序到 TimSort，全面理解经典排序算法的原理与性能差异。",
    category: "algorithm",
    tags: ["algorithm", "cpp", "python", "tutorial"],
  },
  {
    title: "图论算法实战：从 BFS/DFS 到最短路径",
    content: `# 图论算法实战：从 BFS/DFS 到最短路径

图论是算法竞赛和面试中的常客。本文整理最实用的图论算法模板与应用场景。

## 图的表示

\`\`\`cpp
// 邻接表
vector<vector<int>> graph(n);
graph[u].push_back(v);
graph[v].push_back(u);  // 无向图
\`\`\`

## BFS 模板

\`\`\`cpp
vector<int> bfs(vector<vector<int>>& graph, int start) {
    int n = graph.size();
    vector<int> dist(n, -1);
    queue<int> q;
    dist[start] = 0;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : graph[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}
\`\`\`

## Dijkstra 最短路径

\`\`\`cpp
vector<int> dijkstra(vector<vector<pair<int,int>>>& graph, int start) {
    int n = graph.size();
    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    dist[start] = 0;
    pq.push({0, start});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
\`\`\`

图论算法的关键在于选择合适的数据表示和遍历策略。`,
    description: "从图的邻接表表示到 BFS/DFS 遍历，再到 Dijkstra 最短路径算法，实用的图论算法模板合集。",
    category: "algorithm",
    tags: ["algorithm", "cpp", "tutorial"],
  },

  // ── system-design (2) ──
  {
    title: "设计一个高可用的博客系统架构",
    content: `# 设计一个高可用的博客系统架构

本文以 Nexus Blog 为例，分享从单体到可扩展架构的设计思路。

## 系统需求分析

### 功能需求
- 文章 CRUD
- 用户认证与权限
- 评论系统
- 点赞/收藏
- 搜索
- 排行榜

### 非功能需求
- 高可用（99.9%）
- 低延迟（<200ms）
- 可扩展
- 安全

## 架构设计

\`\`\`
┌─────────┐    ┌─────────┐    ┌──────────┐
│ 客户端   │───→│ Nginx   │───→│ Next.js  │
└─────────┘    │ 反向代理 │    │ App      │
               │ + 缓存   │    │ Router   │
               └─────────┘    └────┬─────┘
                                   │
                           ┌───────▼───────┐
                           │   SQLite DB   │
                           └───────────────┘
\`\`\`

## 缓存策略

采用多级缓存架构：

1. **浏览器缓存**：Service Worker + Cache-Control
2. **Nginx 代理缓存**：静态资源 1 年，HTML 60s
3. **应用层缓存**：ISR 增量静态生成

## 扩展性考虑

当流量增长时，可以通过以下方式扩展：
1. 引入 Redis 缓存
2. CDN 加速静态资源
3. 数据库迁移到 PostgreSQL

好的架构设计不是一开始就追求完美，而是在迭代中不断演进。`,
    description: "以 Nexus Blog 为例，分享高可用博客系统的架构设计思路，包括缓存策略、数据库选型和扩展性考虑。",
    category: "system-design",
    tags: ["system-design", "database", "performance", "nextjs"],
  },
  {
    title: "微服务 vs 单体：如何选择合适的架构",
    content: `# 微服务 vs 单体：如何选择合适的架构

架构选型是每个技术团队都要面对的重要决策。

## 单体架构的优势

### 优势
- 开发简单，适合小团队
- 部署方便，单一 artifact
- 调试容易，本地即可运行
- 事务一致性有保障

### 劣势
- 代码耦合度高
- 扩展粒度粗
- 技术栈锁定

## 微服务架构的优势

### 优势
- 独立部署
- 技术栈灵活
- 按需扩展
- 故障隔离

### 劣势
- 运维复杂度高
- 分布式事务
- 网络延迟
- 调试困难

## 决策矩阵

| 因素 | 倾向单体 | 倾向微服务 |
|------|---------|-----------|
| 团队规模 | <10人 | >20人 |
| 业务复杂度 | 低-中 | 高 |
| 部署频率 | 低 | 高 |
| 扩展需求 | 垂直扩展 | 水平扩展 |

## 务实的选择

对于个人博客和中小型项目，单体架构 + 合理的模块划分是最务实的选择。不要为了微服务而微服务，架构演进应当跟随业务发展。`,
    description: "从团队规模、业务复杂度、扩展性等多个维度分析单体架构与微服务架构的选型策略。",
    category: "system-design",
    tags: ["system-design", "backend", "insights"],
  },

  // ── tooling (2) ──
  {
    title: "Git 高级技巧：团队协作的基石",
    content: `# Git 高级技巧：团队协作的基石

Git 是现代软件开发的标配。本文分享一些提升团队协作效率的 Git 高级技巧。

## 交互式 Rebase

\`\`\`bash
# 修改最近 3 个 commit
git rebase -i HEAD~3
# pick 保留, squash 合并, reword 修改提交信息
\`\`\`

## 使用 Git Worktree

\`\`\`bash
# 同时在两个分支上工作
git worktree add ../project-feature feature-branch
\`\`\`

## 交互式暂存

\`\`\`bash
# 只提交部分修改
git add -p
# y - 暂存此块, n - 不暂存, s - 分割
\`\`\`

## 二分查找定位 Bug

\`\`\`bash
git bisect start
git bisect bad
git bisect good v1.0
# Git 自动 checkout 中间 commit，测试后标记 good/bad
git bisect reset
\`\`\`

## 定制 Git Hooks

\`\`\`bash
# .git/hooks/pre-commit
#!/bin/sh
npm run lint
if [ $? -ne 0 ]; then exit 1; fi
\`\`\`

掌握这些高级技巧，可以让团队协作更加高效。`,
    description: "交互式 Rebase、Git Worktree、二分查找、Git Hooks——提升团队协作效率的 Git 高级技巧合集。",
    category: "tooling",
    tags: ["git", "tooling", "tutorial"],
  },
  {
    title: "我的开发环境配置：从终端到编辑器",
    content: `# 我的开发环境配置：从终端到编辑器

一个舒适的开发环境能显著提升生产力。本文分享我的全套开发环境配置。

## 终端配置

### Oh My Zsh + Powerlevel10k

\`\`\`bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
\`\`\`

### 常用别名

\`\`\`bash
alias gs='git status'
alias gc='git commit'
alias gp='git push'
alias dev='npm run dev'
\`\`\`

## VS Code 配置

### 必备插件
1. ESLint
2. Prettier
3. Tailwind CSS IntelliSense
4. GitLens
5. Thunder Client

### settings.json

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.minimap.enabled": false,
  "workbench.colorTheme": "One Dark Pro",
  "terminal.integrated.fontFamily": "JetBrains Mono",
  "files.autoSave": "onFocusChange"
}
\`\`\`

好的开发环境能让编码成为一种享受，花时间配置是值得的长期投资。`,
    description: "从 Oh My Zsh 终端配置到 VS Code 插件精选，分享一套高效舒适的全栈开发环境配置方案。",
    category: "tooling",
    tags: ["tooling", "linux", "tutorial"],
  },

  // ── mobile (2) ──
  {
    title: "React Native 跨平台开发实战",
    content: `# React Native 跨平台开发实战

React Native 让 JavaScript 开发者能够构建原生移动应用。

## 核心概念

React Native 使用 JavaScript 编写逻辑，通过 Bridge 调用原生组件渲染 UI：

\`\`\`tsx
import { View, Text, StyleSheet } from 'react-native';

function PostCard({ title, content }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}
\`\`\`

## 导航配置

\`\`\`tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Post" component={PostScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
\`\`\`

## 性能优化

1. **FlatList 虚拟列表**：替代 ScrollView 渲染大量数据
2. **图片优化**：使用 react-native-fast-image
3. **Hermes 引擎**：启用 Hermes 提升启动速度

React Native 提供了接近原生的性能和开发体验。`,
    description: "从核心概念、导航配置到性能优化，分享 React Native 跨平台移动应用开发的实战经验。",
    category: "mobile",
    tags: ["react", "javascript", "mobile", "tutorial"],
  },
  {
    title: "Flutter vs React Native：2026 年跨平台框架对比",
    content: `# Flutter vs React Native：2026 年跨平台框架对比

跨平台开发框架的选择一直是移动开发者的热门话题。

## 性能对比

### Flutter
- 使用 Skia 引擎自绘 UI
- 无需 Bridge，直接编译为原生代码
- Dart 语言编译速度快

### React Native
- 使用原生组件，通过 Bridge 通信
- New Architecture 引入了 JSI，性能大幅提升
- Fabric 渲染器和 TurboModules

## 开发体验

| 维度 | Flutter | React Native |
|------|---------|-------------|
| 语言 | Dart | JavaScript/TypeScript |
| 热重载 | 支持 | 支持 |
| 学习曲线 | 中等 | 低（有 Web 经验） |
| UI 组件 | 内置丰富 | 依赖第三方库 |

## 生态系统

React Native 拥有更成熟的生态和社区。Flutter 的生态虽然年轻但发展迅速。

## 选型建议

- **优先 React Native**：团队有 Web 经验、需要与 Web 共享代码
- **优先 Flutter**：需要高性能 UI、团队愿意学习 Dart`,
    description: "从性能、开发体验、生态系统等维度深度对比 Flutter 和 React Native 两大跨平台框架。",
    category: "mobile",
    tags: ["mobile", "javascript", "react", "insights"],
  },

  // ── security (2) ──
  {
    title: "Web 安全指南：常见攻击与防御措施",
    content: `# Web 安全指南：常见攻击与防御措施

Web 安全是每个开发者都应该重视的话题。

## XSS（跨站脚本攻击）

### 存储型 XSS

在评论、个人简介等用户输入处，需要对输出进行清洗：

\`\`\`typescript
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
    .replace(/ on\\w+\\s*=\\s*"[^"]*"/gi, '')
    .replace(/javascript\\s*:/gi, 'blocked:');
}
\`\`\`

## CSRF（跨站请求伪造）

使用 SameSite Cookie 和 CSRF Token 双重防护：

\`\`\`typescript
response.cookies.set('session', token, {
  httpOnly: true,
  sameSite: 'lax',
  secure: true,
});
\`\`\`

## SQL 注入

使用 ORM 或参数化查询可以有效防止 SQL 注入：

\`\`\`typescript
// 使用 ORM 安全查询
db.select().from(users).where(eq(users.id, userId));

// 直接拼接 SQL 极其危险
db.run(\`SELECT * FROM users WHERE id = \${userId}\`);
\`\`\`

## HTTPS 与 HSTS

\`\`\`nginx
add_header Strict-Transport-Security "max-age=63072000" always;
\`\`\`

安全是一个持续的过程，需要开发者保持警惕并不断学习最新的安全实践。`,
    description: "详解 XSS、CSRF、SQL 注入等常见 Web 攻击的原理与防御措施，提供可直接使用的安全代码示例。",
    category: "security",
    tags: ["security", "web", "javascript", "tutorial"],
  },
  {
    title: "JWT 认证原理与安全实践",
    content: `# JWT 认证原理与安全实践

JWT（JSON Web Token）是现代 Web 应用中广泛使用的认证方案。

## JWT 结构

\`\`\`
header.payload.signature
\`\`\`

## 签名算法选择

\`\`\`typescript
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const token = await new SignJWT({ userId, role })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(SECRET);

const { payload } = await jwtVerify(token, SECRET);
\`\`\`

## 安全最佳实践

1. **密钥管理**：使用强随机密钥，至少 32 字节
2. **过期时间**：设置合理的过期时间（7天以内）
3. **httpOnly Cookie**：防止 XSS 窃取 Token
4. **HTTPS 传输**：防止中间人攻击
5. **无敏感信息**：Payload 中不要存储密码等敏感信息

## 常见误区

\`\`\`typescript
// 危险：使用默认密钥
const SECRET = new TextEncoder().encode('default-secret-key');

// 安全：环境变量 + 运行时校验
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET 未配置');
\`\`\`

JWT 是一种强大而灵活的认证方案，但只有在正确使用时才能保证安全。`,
    description: "深入讲解 JWT 的结构、签名算法和安全最佳实践，包括密钥管理、Token 存储和常见误区。",
    category: "security",
    tags: ["security", "api", "typescript", "tutorial"],
  },

  // ── career (2) ──
  {
    title: "技术面试准备指南：从算法到系统设计",
    content: `# 技术面试准备指南：从算法到系统设计

技术面试是每个开发者职业发展中的重要关卡。

## 算法题准备

### 核心题型

1. **数组与字符串**：双指针、滑动窗口
2. **链表**：快慢指针、反转链表
3. **树**：DFS、BFS、二叉树遍历
4. **动态规划**：背包问题、最长子序列
5. **图**：最短路径、拓扑排序

### 练习策略

\`\`\`
第一阶段（2周）：每种题型做 5-10 道基础题
第二阶段（2周）：做 30 道中等难度题
第三阶段（2周）：做 20 道难题 + 模拟面试
\`\`\`

## 系统设计面试

### 常见题目
- 设计短链接系统
- 设计聊天系统
- 设计博客平台

### 回答框架

1. 确认需求
2. 估算（QPS、存储量）
3. 数据模型设计
4. 核心架构
5. 扩展性考量

## 行为面试

准备 STAR 法则回答：
- 讲述一次解决技术难题的经历
- 讲述一次团队冲突的处理
- 讲述一个你引以为豪的项目

面试是双向选择的过程，保持自信、诚实、开放的态度。`,
    description: "系统性的技术面试准备指南，涵盖算法、系统设计、行为面试三大板块，附带练习策略和回答框架。",
    category: "career",
    tags: ["career", "insights", "tutorial"],
  },
  {
    title: "技术博客写作：如何建立个人品牌",
    content: `# 技术博客写作：如何建立个人品牌

技术博客是开发者建立个人品牌、深化技术理解的有效方式。

## 为什么要写博客

1. **加深理解**：教是最好的学
2. **建立影响力**：你的文章可能帮助成千上万的开发者
3. **职业发展**：博客是技术能力的直观证明
4. **记录成长**：回头看自己的文章，可以看到明显的进步

## 如何选题

### 好选题的标准
- 你有实践经验
- 对他人有价值
- 有独特的视角

### 选题来源
- 工作中遇到的难题
- 学习新技术的笔记
- 开源项目的贡献经验

## 写作技巧

### 文章结构
1. 引言：为什么这个话题重要
2. 正文：逐步展开，附代码示例
3. 总结：核心要点回顾

### 代码示例
- 代码要可运行
- 展示输入输出
- 解释关键行

## 坚持的力量

技能不在于天赋，而在于日复一日的坚持。写博客也是如此。`,
    description: "分享技术博客写作的经验与技巧，从选题策略、写作方法到个人品牌建设，帮助开发者建立影响力。",
    category: "career",
    tags: ["career", "insights", "tutorial"],
  },

  // ── notes (2) ──
  {
    title: "《深入理解计算机系统》读书笔记",
    content: `# 《深入理解计算机系统》读书笔记

CS:APP 是计算机科学领域的经典教材。本文记录我的核心读书笔记。

## 信息表示

计算机中所有信息都是以二进制表示的。

## 存储器层次结构

\`\`\`
寄存器      ≈ 1ns     ≈ 1KB
L1 Cache   ≈ 2ns     ≈ 32KB
L2 Cache   ≈ 10ns    ≈ 256KB
L3 Cache   ≈ 40ns    ≈ 8MB
主存        ≈ 100ns   ≈ 16GB
SSD        ≈ 100μs   ≈ 1TB
\`\`\`

利用局部性原理优化程序：

\`\`\`c
// 缓存不友好：跳跃访问
for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++)
        sum += a[i][j];

// 缓存友好：顺序访问
for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        sum += a[i][j];
\`\`\`

## 异常控制流

进程、信号、上下文切换是操作系统实现并发的基础机制。理解这些概念对编写健壮的程序至关重要。

这本书值得每年重读一遍，每次都会有新的收获。`,
    description: "《深入理解计算机系统》核心读书笔记，涵盖信息表示、存储器层次结构和异常控制流等关键概念。",
    category: "notes",
    tags: ["notes", "c", "performance", "insights"],
  },
  {
    title: "SQLite 与 Drizzle ORM 学习总结",
    content: `# SQLite 与 Drizzle ORM 学习总结

在 Nexus Blog 项目中，我们选择了 SQLite + Drizzle ORM 作为数据存储方案。

## SQLite 特性

### 适合场景
- 个人项目
- 嵌入式应用
- 原型开发

### 不适合场景
- 高并发写入
- 大规模集群

## Drizzle ORM

### Schema 定义

\`\`\`typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').notNull(),
  createdAt: text('created_at').notNull(),
});
\`\`\`

### 常用查询

\`\`\`typescript
const post = db.select()
  .from(posts)
  .where(eq(posts.id, 1))
  .get();

const result = db.select()
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .all();
\`\`\`

## 性能优化

1. **WAL 模式**：提升并发读写性能
2. **索引优化**：常用查询字段建立索引
3. **聚合查询**：使用 GROUP BY 替代 N+1 查询

SQLite + Drizzle 的组合为个人项目提供了零运维成本的数据库方案。`,
    description: "SQLite 与 Drizzle ORM 的实践总结，涵盖 Schema 定义、常用查询和性能优化技巧。",
    category: "notes",
    tags: ["notes", "database", "typescript", "tutorial"],
  },

  // ── projects (2) ──
  {
    title: "Nexus Blog 项目复盘：从构思到上线",
    content: `# Nexus Blog 项目复盘：从构思到上线

Nexus Blog 是我的个人技术博客项目。本文完整复盘从构思到上线的全过程。

## 项目动机

我希望创建一个属于自己的技术博客平台，而不依赖于第三方平台。

## 技术选型

| 技术 | 选择理由 |
|------|---------|
| Next.js 16 | SSG/SSR 混合渲染，全栈能力 |
| Tailwind CSS v4 | 原子化 CSS，高效构建 UI |
| SQLite + Drizzle | 零运维，类型安全 |
| Nginx | 反向代理 + 缓存 |
| Let's Encrypt | 免费 SSL 证书 |

## 设计理念

### 赛博朋克风格
深色主题搭配霓虹青色（#00f0ff）点缀，营造科技感十足的视觉体验。

### 内容优先
文章列表采用卡片式布局，每篇文章突出标题和摘要，减少视觉干扰。

## 开发过程中的挑战

1. **Nginx 配置**：proxy_cache 的 header 处理
2. **缓存策略**：多级缓存的协调与验证
3. **HTTPS 配置**：Let's Encrypt 证书自动化续期

## 后续计划

- 文章的 RSS 订阅支持
- 深色/亮色主题切换优化
- 性能监控面板

项目复盘是对知识的最好沉淀。`,
    description: "Nexus Blog 项目从构思到上线的完整复盘，涵盖技术选型、设计理念、开发挑战和后续计划。",
    category: "projects",
    tags: ["nextjs", "tailwind", "database", "docker", "insights"],
  },
  {
    title: "个人知识管理系统构建指南",
    content: `# 个人知识管理系统构建指南

在信息爆炸的时代，构建个人知识管理系统至关重要。

## 知识管理流程

\`\`\`
收集 → 整理 → 提炼 → 关联 → 创造
\`\`\`

### 1. 收集
使用以下工具进行信息收集：
- **浏览器书签**：Raindrop.io
- **稍后阅读**：Pocket
- **代码片段**：GitHub Gist
- **技术文章**：Nexus Blog

### 2. 整理

使用 PARA 方法组织信息：

\`\`\`
Projects（项目）
  ├── 正在进行的项目
Areas（领域）
  ├── 前端开发
  ├── 后端开发
Resources（资源）
  ├── 技术文章
Archives（归档）
  └── 已完成项目
\`\`\`

### 3. 提炼

阅读技术文章时，使用以下模板：

- 核心观点（2-3句话总结）
- 关键技术点
- 我的思考
- 行动项

## 推荐工具

| 工具 | 用途 |
|------|------|
| Obsidian | 知识库管理 |
| VS Code | 代码笔记 |
| GitHub | 项目管理 |

知识管理的核心不是工具，而是持续的习惯。`,
    description: "分享个人知识管理系统的构建方法，从收集、整理到提炼、创造，涵盖 PARA 方法和推荐工具。",
    category: "projects",
    tags: ["projects", "tooling", "insights", "tutorial"],
  },

  // ── Extra: frontend + backend to round out to 31 (one more article) ──
  {
    title: "SQL 优化实战：从慢查询到毫秒级响应",
    content: `# SQL 优化实战：从慢查询到毫秒级响应

SQL 优化是后端开发的核心技能之一。本文通过真实案例分享 SQL 优化的思路和方法。

## 识别慢查询

\`\`\`sql
EXPLAIN QUERY PLAN
SELECT * FROM posts WHERE author_id = 5 ORDER BY created_at DESC;
\`\`\`

## 索引优化

### 复合索引

\`\`\`sql
CREATE INDEX idx_posts_author_cat_time
ON posts(author_id, category, created_at DESC);
\`\`\`

## N+1 查询问题

### 问题案例

\`\`\`typescript
// N+1：每条评论都查一次用户
const comments = await db.select().from(comments).all();
for (const comment of comments) {
  const user = await db.select().from(users)
    .where(eq(users.id, comment.authorId)).get();
}
\`\`\`

### 优化方案

\`\`\`typescript
// JOIN 一次查询
const results = db.select()
  .from(comments)
  .leftJoin(users, eq(comments.authorId, users.id))
  .all();
\`\`\`

## 聚合查询优化

\`\`\`typescript
const counts = db.select({
  slug: likes.postSlug,
  count: count(),
}).from(likes)
  .groupBy(likes.postSlug)
  .all();
\`\`\`

SQL 优化没有银弹，关键在于理解数据访问模式，针对性地建立索引和优化查询。`,
    description: "通过真实案例分享 SQL 优化实战经验，涵盖索引优化、N+1 查询修复和聚合查询优化。",
    category: "backend",
    tags: ["database", "sql", "performance", "tutorial"],
  },
  {
    title: "用 Framer Motion 打造丝滑的 React 动画",
    content: `# 用 Framer Motion 打造丝滑的 React 动画

Framer Motion 是 React 生态中最流行的动画库之一。

## 基本用法

\`\`\`tsx
import { motion } from "framer-motion";

function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
\`\`\`

## 滚动动画

\`\`\`tsx
function AnimatedSection({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}
\`\`\`

## 列表交错动画

\`\`\`tsx
{posts.map((post, i) => (
  <motion.div
    key={post.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.08 }}
  >
    <PostCard post={post} />
  </motion.div>
))}
\`\`\`

Framer Motion 的声明式 API 让动画开发变得简单直观。在本博客中，几乎所有页面过渡和微交互都使用了 Framer Motion，为用户带来流畅的浏览体验。`,
    description: "分享 Framer Motion 在 React 项目中的实战经验，从基本动画、滚动触发到列表交错和 LayoutId 动画。",
    category: "frontend",
    tags: ["framer-motion", "react", "javascript", "tutorial"],
  },
];

// ── Run ──
const existing = db.prepare("SELECT slug FROM user_posts WHERE author_id = ?").all(AUTHOR_ID);
const existingSlugs = new Set(existing.map((r) => r.slug));

let inserted = 0;
for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  const daysAgo = articles.length - i;
  const ts = Date.now() - daysAgo * 86400000;
  const slugBase = a.title
    .slice(0, 40)
    .replace(/[^a-zA-Z0-9一-鿿]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const slug = `user-${ts}-${slugBase}`;

  if (existingSlugs.has(slug)) {
    console.log(`  ⏭️  [${i + 1}/${articles.length}] ${a.title} (slug 已存在)`);
    continue;
  }

  const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
  db.prepare(`
    INSERT INTO user_posts (title, content, description, slug, category, tags, format, author_id, is_published, likes_count, views_count, bookmarks_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'markdown', ?, 1, ?, ?, ?, ?, ?)
  `).run(
    a.title,
    a.content,
    a.description,
    slug,
    a.category,
    JSON.stringify(a.tags),
    AUTHOR_ID,
    Math.floor(Math.random() * 20),
    Math.floor(Math.random() * 200) + 50,
    Math.floor(Math.random() * 10),
    createdAt,
    createdAt,
  );
  inserted++;
  console.log(`  ✅ [${i + 1}/${articles.length}] ${a.title}`);
}

console.log(`\n📊 共插入 ${inserted}/${articles.length} 篇文章`);
db.close();
console.log("🎉 文章种子数据创建完成！");
