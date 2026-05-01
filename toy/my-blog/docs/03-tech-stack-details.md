# 技术栈详解

## Next.js 16

### 核心特性

- **App Router** — 基于文件系统的路由，支持布局嵌套、加载状态、错误边界
- **SSG (Static Site Generation)** — 博客文章在构建时预渲染为静态 HTML
- **Server Components** — 默认服务端组件，减少客户端包体积
- **API Routes** — 文件系统 API，轻松构建后端接口

### 项目中使用的路由模式

```
静态路由:   /about, /leaderboard, /tags, /categories
动态路由:   /posts/[slug], /categories/[category], /tags/[tag]
API 路由:   /api/auth/login, /api/comments, /api/likes, ...
查询参数:   /posts?page=1, /search?q=keyword
```

---

## SQLite + Drizzle ORM

### 为什么选择 SQLite

- **零配置** — 不需要安装数据库服务器，一个文件搞定
- **单文件存储** — `data/blog.db`，备份就是复制文件
- **并发足够** — WAL 模式支持读写并发，个人博客完全够用
- **跨平台** — Windows / Linux / Mac 通用

### Drizzle ORM

Drizzle 是一个轻量级的 TypeScript ORM，编译时检查 SQL 语句的正确性：

```typescript
// 定义 schema
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  permissions: text("permissions").default("{}"),
  createdAt: text("created_at").notNull(),
});

// 查询
const user = db.select().from(users).where(eq(users.username, "admin")).get();

// 插入
db.insert(users).values({ username, email, passwordHash, ... }).run();
```

### 数据库初始化

在 `src/lib/db/index.ts` 中：
- 自动检测并创建 `data/` 目录
- 自动建表（CREATE TABLE IF NOT EXISTS）
- 启用 WAL 模式提升并发性能
- 启用外键约束

---

## 鉴权系统（JWT + bcryptjs）

### 工作原理

```
登录 → 验证密码 → 生成 JWT → 写入 httpOnly Cookie
                                              ↓
每个请求 → Cookie 自动携带 → API 中间件验证 JWT → 获取用户信息
                                              ↓
登出 → 清除 Cookie
```

### JWT Token

- 使用 `jose` 库（Web 标准，兼容 Edge Runtime）
- Payload 包含：userId, username, role
- 签名密钥：`JWT_SECRET` **环境变量（必填）**
- 有效期：7 天
- 存储在 httpOnly Cookie 中，不可被 JS 读取，防 XSS 攻击

### JWT 密钥安全策略（重要）

```typescript
// src/lib/auth.ts — 严格检查，拒绝默认值
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET environment variable is not set. " +
    "Set a strong random string in .env.local or environment configuration."
  );
}
const SECRET = new TextEncoder().encode(jwtSecret);
```

**为什么这样设计：**

| 方案 | 风险 |
|------|------|
| `"xxx" \|\| process.env.JWT_SECRET` | 忘记设环境变量时静默使用源码中的固定密钥 |
| `process.env.JWT_SECRET \|\| "xxx"` | 同上，攻击者可从源码拿到密钥伪造任意用户身份 |
| `process.env.JWT_SECRET` + 抛错 | **安全**——不配置直接启动失败，强迫你必须配置 |

**部署时生成强密钥的命令：**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([byte[]]::new(32) | ForEach-Object { $_ = Get-Random -Max 256 })

# 复制输出结果，写入 .env.local
echo "JWT_SECRET=你的随机密钥" >> .env.local
```

> ⚠️ 生产环境的 `JWT_SECRET` 必须是一个**至少 32 字节的随机字符串**。不要在开发环境和生产环境使用同一个密钥。如果更换密钥，所有已签发的 JWT 将立即失效，所有用户需要重新登录。

### 密码安全

- 使用 `bcryptjs` 进行密码哈希
- 加盐 10 轮
- 绝不明文存储密码

### 权限控制

每个用户有一个 `permissions` JSON 字段：

```json
{
  "canComment": true,
  "canPost": true,
  "canLike": true
}
```

管理员不受权限限制，普通用户的权限可在管理后台动态调整。

### 超级管理员

超级管理员（`super_admin`）是凌驾于普通管理员之上的特殊角色：
- 系统中唯一预设的超级管理员用户：`weipeiluo`
- 不能被普通管理员修改或删除
- 在 API 层面做了双重保护：前端按钮禁用 + 后端接口校验
- 所有界面（导航栏、用户主页、文章卡片）均有金色皇冠动态标识
- 渐变背景 + 发光效果的头像，区别于普通用户的简约风格

### 权限检查

```typescript
// API 路由中的权限检查
const session = await getSession();
if (!session || !canUser(session, "canComment")) {
  return NextResponse.json({ error: "请先登录" }, { status: 401 });
}
```

```typescript
// 权限检查函数（auth.ts）
export function canUser(user, permission): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "super_admin") return true;
  return user.permissions[permission] === true;
}
```

---

## 内建评论系统

### 对比 Giscus

| 特性 | Giscus | 内建评论 |
|------|--------|---------|
| 依赖 | GitHub 账号 + OAuth | 本博客账号 |
| 访客门槛 | 必须有 GitHub | 注册即可 |
| 存储 | GitHub Discussions | 本地 SQLite |
| 管理 | GitHub 后台 | 博客管理后台 |
| 速度 | 依赖 GitHub API | 本地直连 |

### 用户删除保护

删除用户账号时，其评论会**匿名化保留**而非删除：
- `author_id` 置为 `NULL`
- `author_name` 设为 `已注销(原用户名)`
- 评论内容、所属文章、发表时间均保留
- 数据显示为 "已注销"，不可再删除

### 多级嵌套回复

评论系统支持无限层级嵌套（UI 限制最多 2 级展示）：

- `comments` 表新增 `parent_id` 字段，指向父评论 ID
- 删除评论时自动删除所有子回复
- 回复时自动 @提及被回复者用户名
- 前端按树形结构渲染，子评论缩进展示

### Emoji 选择器

评论输入框旁有一个 Emoji 选择器按钮：

- 分类展示（表情、手势、爱心、符号）
- 点击即插入到当前输入框光标位置
- 选择器浮窗，点击外部自动关闭

### 评论内容格式

评论内容支持轻量 Markdown 渲染：

- `**加粗**`、`*斜体*`、`***加粗斜体***`
- `` `代码` `` 行内代码
- `[链接文字](url)` 超链接
- 纯文本保留换行

### API

```
GET  /api/comments?postSlug=xxx      → 获取指定文章评论（含 parentId）
GET  /api/comments?postSlug=__all__   → 获取全部评论（管理员）
POST /api/comments                    → 发表评论（可选 parentId 回复）
DELETE /api/comments?id=xxx           → 删除评论（本人或管理员，含子回复）
```

### PostActions 底部操作栏

文章详情页底部（评论区上方）有一个独立操作栏 `PostActions`：

- **点赞按钮**（心形）：霓虹粉色，`rounded-full` 椭圆形
- **收藏按钮**（书签形）：霓虹青色，`rounded-full` 椭圆形
- 尺寸：`px-6 py-3`，比顶部栏按钮更大更明显
- 未登录时点击跳转登录页
- 已登录时即时交互（乐观更新 + 服务端同步）
- 同时显示当前计数
- 使用 `AnimatedSection` 带有入场动画

### 文章卡片点赞/收藏展示

文章列表卡片（`PostCard`）不再显示阅读时长，改为展示：
- 点赞数（Heart 图标 + 数字）
- 收藏数（Bookmark 图标 + 数字）
- 数据来源：用户文章从 `user_posts` 表实时读取；MDX 文章从 `likes`/`bookmarks` 表批量查询聚合

---

## 排行榜系统

### 积分算法

| 指标 | 权重 |
|------|------|
| 浏览量 | × 1 |
| 点赞量 | × 5 |
| 收藏量 | × 10 |

积分统计**覆盖所有文章来源**（MDX 文件 + 用户数据库文章），每次点赞/收藏/浏览后实时同步更新 `user_posts` 表的聚合计数，个人主页和文章详情页显示的计数始终保持最新。

### 周期

四个时间维度标签页，默认展示"总分"：

| 标签 | API range 参数 | 时间范围 |
|------|---------------|---------|
| 总分 | `all` | 全部时间（无时间过滤） |
| 每日 | `daily` | 过去 24 小时 |
| 每周 | `weekly` | 过去 7 天 |
| 每月 | `monthly` | 过去 30 天 |

### 实现细节（性能优化）

积分基于 `likes`、`bookmarks`、`views` 事件表中的 `created_at` 时间戳进行范围过滤。原始实现使用**逐文章查询**（N+1 问题），已优化为**批量聚合查询**：

```typescript
// 优化前：每篇文章分别查 3 次 DB → N 篇文章 = N×3 次查询
for (const post of allPosts) {
  const likesCount = db.select({ count: count() })
    .from(likes).where(timeFilter(likes, post.slug)).get();
  const bmCount = db.select({ count: count() })
    .from(bookmarks).where(timeFilter(bookmarks, post.slug)).get();
  // ...
}

// 优化后：3 次 GROUP BY 聚合查询，用 Map 索引内存拼接
function batchCount(table, since) {
  let q = db.select({ slug: table.postSlug, count: count() }).from(table);
  if (since) q = q.where(sql`${table.createdAt} >= ${since.toISOString()}`);
  return q.groupBy(table.postSlug).all();
}
const likesBatch = batchCount(likes, since);     // 1 次查询
const bmBatch = batchCount(bookmarks, since);     // 1 次查询
const viewsBatch = batchCount(views, since);      // 1 次查询
// 总计：无论多少篇文章都只需要 3 次查询
```

**为什么这样做？** 聚合查询将所有文章的计数一次性查出（`GROUP BY post_slug`），通过 `Map` 索引在内存中匹配到每篇文章。无论数据库中有 10 篇文章还是 1000 篇，排行榜接口都只执行 3 条 SQL 语句。

### 分页与滚动

排行榜前端展示每页 **10 人**，容器高度约 **5 人**（`max-h-[460px]`），超出部分可上下滚动：
- 自定义 `.scrollbar-thin` CSS 类，Chrome（`::-webkit-scrollbar`）和 Firefox（`scrollbar-width: thin`）均生效
- 底部页码导航按钮，切换周期标签时自动重置到第 1 页
- 不再硬编码前 20 名的限制——有多少人展示多少人，由前端分页控制

### API

```
GET /api/leaderboard?range=all|daily|weekly|monthly
```

返回按积分降序排列的**所有用户**（不再限制前 20 名）。`range` 参数默认为 `all`。前端根据返回数据自行分页（每页 10 人）。

---

## 主题系统（next-themes）

### CSS 变量驱动

```css
:root {
  --background: #0a0a0f;     /* 暗色背景 */
  --foreground: #e4e4e7;
  --surface: #12121a;
  --accent: #00f0ff;         /* 霓虹青 */
}

.light {
  --background: #f8f8fc;
  --foreground: #1a1a2e;
  --surface: #ffffff;
  --accent: #6d28d9;         /* 紫色 */
}
```

### 自定义 CSS 效果

| 效果 | 类名 | 说明 |
|------|------|------|
| 扫描线 | `.scan-line` | 固定位置的扫描线动画 |
| 网格背景 | `.bg-grid` | 重复网格图案 |
| 故障文字 | `.glitch` | 霓虹色偏移抖动 |
| 渐变边框 | `.gradient-border` | 青-紫-粉渐变边框 |

---

## 改名审核系统

### 工作流程

```
用户提交新用户名 → 立即更新用户名 → 创建待审核记录
                                              ↓
管理员在后台查看 ← 通知有新的待审核请求
       ↓                    ↓
   批准（保留）          驳回（回滚）
```

### 数据库表

```sql
CREATE TABLE name_change_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  old_name TEXT NOT NULL,
  new_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  created_at TEXT NOT NULL
);
```

### API

```
POST  /api/name-change          → 提交改名申请（需登录）
GET   /api/name-change          → 获取所有申请记录（管理员）
PATCH /api/name-change          → 审核申请（批准/驳回，管理员）
```

### 审核动作

| 动作 | 后端行为 |
|------|---------|
| 批准 | 更新 `status = 'approved'`，保留当前用户名 |
| 驳回 | 更新 `status = 'rejected'`，将 `users.username` 回滚为 `old_name` |

## 邮件服务（nodemailer + SMTP）

### 工作原理

```
注册页面 → POST /api/auth/send-code → 生成 6 位验证码 → 存储到 verification_codes 表
                                                            ↓
                                                     nodemailer → SMTP → QQ邮箱
                                                            ↓
注册页面 → 填写验证码 → POST /api/auth/register → 校验 verification_codes 表 → 注册
```

### 配置

通过 `.env.local` 中的环境变量配置 SMTP：

```env
SMTP_HOST=smtp.qq.com       # SMTP 服务器地址
SMTP_PORT=587               # 端口（587 为 STARTTLS）
SMTP_USER=xxx@qq.com        # 邮箱账号
SMTP_PASS=xxxxxxxxxxxx      # SMTP 授权码（非登录密码）
```

### 验证码表

```sql
CREATE TABLE verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,        -- 接收验证码的邮箱
  code TEXT NOT NULL,         -- 6 位数字验证码
  type TEXT DEFAULT 'register', -- 类型：register / reset
  expires_at TEXT NOT NULL,   -- 过期时间（当前 + 5 分钟）
  used_at TEXT,               -- 使用时间（null 表示未使用）
  created_at TEXT NOT NULL
);
```

### 安全策略

- **有效期**：验证码生成后 5 分钟过期
- **单次使用**：验证码使用后标记 `used_at`，不可重复使用
- **频率限制**：同一邮箱 60 秒内不可重复发送（前后端双重限制）
- **发送前清理**：新发码前自动删除该邮箱之前未使用的验证码
- **邮箱验证**：QQ SMTP 返回 550 错误时，提示用户"邮箱地址不存在"
- **索引优化**：`verification_codes` 表在 `email` 和 `code` 列建有索引

### 邮件模板

使用 nodemailer 发送 HTML 邮件，暗色风格与博客主题一致，包含：
- Nexus Blog 品牌标识（渐变标题）
- 6 位验证码（大号字体、等宽排版）
- 有效期提示
- 安全提醒

---

### 文章数据层融合

项目有两种文章来源：MDX 文件（`content/posts/`）和数据库用户文章（`user_posts` 表）。`getAllPosts()` 函数会自动合并两者并去重（按 slug）：

```
MDX 文件  ──→  getAllMdxPosts()  ──┐
                                   ├──→  getAllPosts() (合并 + 去重)
user_posts ──→  getAllDbPosts()  ──┘
```

所有列表页面（文章列表、分类、标签、搜索、首页）均使用 `getAllPosts()`，因此用户发布的文章会自动出现在所有页面。

各页面使用 ISR（60 秒重新验证），确保新发布的文章在 60 秒内可见。

### 用户文章管理

**用户自主管理：**
- 用户通过 `/my-posts` 管理自己发布的文章
- 编辑页面支持 Markdown 实时预览（客户端渲染）
- 支持删除自己发布的文章
- API: `GET/PATCH/DELETE /api/user-posts/[id]`

**管理员管理：**
管理员可通过 `/api/admin/posts` 管理所有用户发布的文章：

```
GET    /api/admin/posts         → 获取所有用户文章（含作者名）
PATCH  /api/admin/posts         → 修改文章（上架/下架、修改标题/描述/分类）
DELETE /api/admin/posts?id=xxx  → 删除文章
```

管理举措：
- **上架/下架** — 控制文章对外可见性，下架后用户无法访问但数据保留
- **删除** — 永久移除文章，不可恢复

---

## Markdown 渲染引擎

### renderMarkdown()

`src/lib/markdown.ts` 提供了一个轻量级的 Markdown → HTML 转换器，基于正则表达式管道处理：

**处理流程：**
1. **提取代码块**：将 ` ```lang\n...\n``` ` 替换为占位符，防止后续替换污染
2. **块级/行内转换**：标题、加粗、斜体、行内代码、图片、链接、列表、引用、分割线
3. **XSS 清洗**：剥离恶意 HTML 标签和事件处理器（见下方安全说明）
4. **段落包裹**：未以块级标签开头的内容自动包裹 `<p>`
5. **恢复代码块**：还原占位符，同时：
   - 对代码内容做 HTML 转义（`<` → `&lt;` 等）
   - 显示语言标识小标签（如 `cpp`、`js`、`python`）
   - 使用 `<pre><code>` 结构，等宽字体渲染

### XSS 防护机制

用户文章内容和评论通过 `dangerouslySetInnerHTML` 渲染到页面，因此**必须在服务端清洗输出**。清洗在 Markdown 渲染管线中的第 3 步执行：

```typescript
// src/lib/markdown.ts — XSS sanitization step
html = html
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
  .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
  .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
  .replace(/ on\w+\s*=\s*"[^"]*"/gi, "")
  .replace(/ on\w+\s*=\s*'[^']*'/gi, "")
  .replace(/ on\w+\s*=\s*[^\s>]+/gi, "")
  .replace(/javascript\s*:/gi, "blocked:");
```

**清洗范围：**

| 攻击向量 | 示例 | 防护方式 |
|---------|------|---------|
| 脚本注入 | `<script>alert(1)</script>` | 完整移除 `<script>` 标签及其内容 |
| 内联框架 | `<iframe src="恶意网站">` | 移除 `<iframe>` 标签 |
| 事件劫持 | `<img src=x onerror=alert(1)>` | 移除所有 `on*=` 属性 |
| 伪协议 | `<a href="javascript:alert(1)">` | `javascript:` 替换为 `blocked:` |
| 样式注入 | `<style>body{display:none}</style>` | 移除 `<style>` 标签 |

**为什么不在输入时转义 HTML？** 因为 Markdown 渲染器本身会生成合法的 HTML（如 `<h1>`、`<strong>`、`<a>`），输入时转义会导致这些标签被破坏。在渲染管线的**中间步骤**清洗，既保留了合法的 Markdown 输出，又拦截了恶意插入。

> 代码块中的内容在 Step 5 恢复时单独做了 HTML 转义（`<` → `&lt;`），不受此步骤影响。

**支持的语法：**

| 语法 | 渲染结果 |
|------|---------|
| `# 标题` / `## 标题` / `### 标题` | H1 / H2 / H3 |
| `**加粗**` | 加粗 |
| `*斜体*` | 斜体 |
| `` `代码` `` | 行内代码（霓虹青色） |
| ` ```lang ... ``` ` | 代码块（带语言标签 + HTML转义） |
| `[文本](url)` | 超链接 |
| `![](url)` | 图片 |
| `- 列表` | 无序列表 |
| `1. 列表` | 有序列表 |
| `> 引用` | 引用块 |
| `---` | 分割线 |

### renderContent()

统一入口函数，根据 `format` 参数分发：
- `format === "markdown"` → 调用 `renderMarkdown()` 渲染为 HTML
- `format === "txt"` → HTML 转义 + 换行转 `<br>` + 空格转 `&nbsp;`

---

## Framer Motion

### 项目中使用的动画

- **AnimatedSection** — 滚动到视口时淡入上移动画
- **导航栏指示器** — layoutId 实现平滑切换
- **微交互** — 按钮缩放、弹窗过渡、回到顶部
- **PostCard** — 交错入场（index * 0.08 延迟）
