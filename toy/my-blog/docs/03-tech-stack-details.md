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
- 签名密钥：`JWT_SECRET` 环境变量（开发环境有默认值）
- 有效期：7 天
- 存储在 httpOnly Cookie 中，不可被 JS 读取，防 XSS 攻击

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

### API

```
GET  /api/comments?postSlug=xxx    → 获取指定文章评论
GET  /api/comments?postSlug=__all__ → 获取全部评论（管理员）
POST /api/comments                  → 发表评论
DELETE /api/comments?id=xxx         → 删除评论（本人或管理员）
```

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

- **每日**：24 小时内数据
- **每周**：7 天内数据
- **每月**：30 天内数据

### API

```
GET /api/leaderboard?range=daily|weekly|monthly
```

返回按积分降序排列的前 20 名用户。

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

## Framer Motion

### 项目中使用的动画

- **AnimatedSection** — 滚动到视口时淡入上移动画
- **导航栏指示器** — layoutId 实现平滑切换
- **微交互** — 按钮缩放、弹窗过渡、回到顶部
- **PostCard** — 交错入场（index * 0.08 延迟）
