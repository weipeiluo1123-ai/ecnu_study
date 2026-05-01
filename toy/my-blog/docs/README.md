# Nexus Blog 文档

## 📚 文档列表

| 文档 | 说明 |
|------|------|
| [01-project-overview.md](./01-project-overview.md) | 项目结构、功能模块、数据库 Schema、默认账号 |
| [02-deployment-guide.md](./02-deployment-guide.md) | 本地部署 + Windows 云服务器 + MacBook 远程管理 |
| [03-tech-stack-details.md](./03-tech-stack-details.md) | 技术栈详解（SQLite / Drizzle / JWT / 邮件服务 / 评论 / 排行榜 / 改名审核） |
| [04-content-management.md](./04-content-management.md) | 文章写作指南（含 author 字段说明） |
| [05-user-guide.md](./05-user-guide.md) | 用户操作指南（注册/改名/评论/排行榜/用户主页/管理后台/审核） |

## 快速导航

| 操作 | 命令 |
|------|------|
| 启动开发 | `npm run dev` |
| 构建 | `npm run build` |
| 生产运行 | `npm start` |
| PM2 持久运行 | `pm2 start npm --name "nexus-blog" -- start` |
| 超级管理员 | weipeiluo / weipeiluo123 |
| 默认管理员 | admin / admin123 |
| 测试用户 | morn1ng / alice / bob (密码都是 123456) |
| 数据库位置 | `data/blog.db` |
| 文章目录 | `content/posts/` |
