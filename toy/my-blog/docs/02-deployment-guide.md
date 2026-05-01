# 部署指南

## 目录

1. [本地部署](#1-本地部署)
2. [云服务器部署（Windows 作为服务器）](#2-云服务器部署windows-作为服务器)
3. [MacBook 远程管理博客](#3-macbook-远程管理博客)
4. [常见问题](#4-常见问题)

---

## 1. 本地部署

### 开发环境

```bash
# 1. 进入项目目录
cd toy/my-blog

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 浏览器打开
# http://localhost:3000
```

### 生产构建

```bash
# 1. 构建
npm run build

# 2. 启动生产服务器
npm start

# 生产服务器默认监听 http://localhost:3000
```

### 使用 PM2 持久化运行（推荐）

PM2 是一个 Node.js 进程管理器，可以让应用在后台持续运行。

```bash
# 1. 全局安装 PM2
npm install -g pm2

# 2. 在项目目录启动
pm2 start npm --name "nexus-blog" -- start

# 3. 设置开机自启
pm2 startup
pm2 save

# 4. 常用命令
pm2 list              # 查看进程列表
pm2 logs nexus-blog   # 查看日志
pm2 restart nexus-blog # 重启
pm2 stop nexus-blog   # 停止
```

### 环境变量配置

云服务器部署前，确保 `.env.local` 包含以下配置：

```env
# SMTP 邮箱配置（用于注册验证码）
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your-email@qq.com
SMTP_PASS=your-smtp-authorization-code

# JWT 密钥（生产环境请修改为强随机字符串）
JWT_SECRET=your-strong-secret-key
```

> ⚠️ `.env.local` 包含敏感信息，不要提交到 git。`.gitignore` 已默认排除。

---

## 2. 云服务器部署（Windows 作为服务器）

你的 Windows 台式机硬件配置可观、网络状态好，完全可以作为云服务器使用。

### 方案一：直接运行（最简单）

```bash
# 构建项目
cd toy/my-blog
npm run build

# 修改监听地址和端口，让局域网可访问
# 方式 1：用 PM2 启动时指定环境变量
set PORT=8080
pm2 start npm --name "nexus-blog" -- start -- -p 8080

# 方式 2：或直接在启动命令加参数
npm start -- -p 8080 -H 0.0.0.0
```

参数说明：
- `-p 8080`：监听端口（8080 / 3000 均可）
- `-H 0.0.0.0`：监听所有网络接口，允许局域网其他设备访问

### 方案二：Nginx 反向代理（推荐生产环境）

Nginx 作为反向代理可以提供 SSL 终止、负载均衡、缓存加速等功能。

#### 安装 Nginx (Windows)

1. 下载 Nginx for Windows: https://nginx.org/en/download.html
2. 解压到 `C:\nginx`
3. 编辑 `C:\nginx\conf\nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 你的域名或公网 IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. 启动 Nginx：`start nginx`
5. 访问 `http://localhost` 即可看到博客

### 配置防火墙

确保 Windows 防火墙开放对应端口：

```powershell
# 以管理员身份运行 PowerShell
New-NetFirewallRule -DisplayName "Blog Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
# 或者如果用 8080 端口
New-NetFirewallRule -DisplayName "Blog Port 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

### 内网穿透（如果无公网 IP）

如果宽带没有公网 IP，需要使用内网穿透工具。

#### 使用 frp

1. 准备一台有公网 IP 的云服务器（轻量级即可，做 frp 服务端）
2. 在云服务器上运行 frp 服务端 (`frps`)
3. 在你的 Windows 电脑上运行 frp 客户端 (`frpc`)

**frpc.ini (Windows 客户端)**:
```ini
[common]
server_addr = 你的云服务器IP
server_port = 7000

[nexus-blog]
type = tcp
local_ip = 127.0.0.1
local_port = 3000
remote_port = 8080
```

#### 使用 Tailscale / ZeroTier（更简单的方案）

直接组建虚拟局域网，所有设备在一个内网中：

1. 三台设备都安装 Tailscale: https://tailscale.com
2. 登录同一个账号
3. 设备之间可以互相用 Tailscale 分配的 IP 访问
4. 无需端口映射，无需公网 IP

```bash
# MacBook 上直接访问
http://100.x.x.x:3000    # Tailscale IP + 端口
```

### DDNS（动态域名解析）

如果宽带防火墙拨号有公网 IP 但会变化：

1. 申请一个域名（如 `yourblog.com`）
2. 使用 DDNS 服务（如阿里云 DDNS、Cloudflare DDNS）
3. 在 Windows 上运行 DDNS 客户端，自动更新域名解析
4. 通过 `http://yourblog.com:3000` 访问

---

## 3. MacBook 远程管理博客

### 3.1 通过 SSH 远程管理 Windows

在 Windows 上启用 OpenSSH Server：

```powershell
# 以管理员身份运行 PowerShell

# 检查 OpenSSH 状态
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'

# 安装 OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# 启动 SSH 服务
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# 确保防火墙允许 SSH（端口 22）
New-NetFirewallRule -DisplayName "OpenSSH Server" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow
```

在 MacBook 上连接：

```bash
# SSH 连接（局域网或公网）
ssh username@windows-ip

# 如果使用 Tailscale
ssh username@tailscale-ip

# 连接后进入博客目录
cd /path/to/my-blog

# 管理博客
git pull              # 拉取新文章
npm run build         # 重新构建
pm2 restart nexus-blog # 重启服务
```

### 3.2 通过 VS Code Remote SSH 编辑

在 MacBook 的 VS Code 中：

1. 安装 **Remote - SSH** 扩展
2. 按 `F1` → `Remote-SSH: Connect to Host...`
3. 输入 `ssh username@windows-ip`
4. 连接成功后可直接编辑 Windows 上的文件

### 3.3 Git 工作流（推荐）

```
MacBook 编写文章 → git push → Windows 拉取 → 自动部署
```

Windows 上设置自动部署：

```bash
# 在 Windows 上创建部署脚本 deploy.bat
@echo off
cd C:\path\to\my-blog
git pull origin main
npm run build
pm2 restart nexus-blog
```

配合 Git 钩子（Webhook）可以实现推送即部署。

### 3.4 直接在 Windows 上写文章

你也可以远程桌面到 Windows，直接在本地编辑。Windows 自带的 **远程桌面 (RDP)**：

```bash
# MacBook 上使用 Microsoft Remote Desktop
# App Store 搜索 "Microsoft Remote Desktop for Mac"

# 或者使用 Chrome 远程桌面
# 更简单，不需要公网 IP
```

---

## 4. 部署架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Internet                                │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   域名 / 公网 IP    │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                  Windows 台式机 (服务器)                      │
│                                                             │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐   │
│   │  Nginx       │───▶│  Next.js     │◀───│  PM2 进程    │   │
│   │  反向代理    │    │  (端口 3000)  │    │  管理器      │   │
│   └─────────────┘    └──────────────┘    └─────────────┘   │
│                                                             │
│   ┌─────────────┐    ┌──────────────┐                       │
│   │  Git        │───▶│  content/    │                       │
│   │  拉取更新   │    │  posts/      │                       │
│   └─────────────┘    └──────────────┘                       │
│                                                             │
│   ┌─────────────┐                                           │
│   │  OpenSSH    │  ← MacBook SSH 连接                       │
│   │  Server     │                                           │
│   └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘

远程管理方式（MacBook）:
  ├─ SSH 命令行 → 管理 + 部署
  ├─ VS Code Remote SSH → 远程编辑代码
  ├─ Git push → Windows 拉取自动部署
  └─ 远程桌面 (RDP) → 全功能桌面操作
```

---

## 5. 数据库备份

博客使用 SQLite 数据库，所有用户数据（评论、点赞、收藏、用户信息）存储在 `data/blog.db` 中。

### 备份方法

```bash
# 方法 1：直接复制文件（需要停止服务或确保无写入）
cp data/blog.db data/blog.db.backup

# 方法 2：使用 PM2 定时备份脚本
# 创建 backup.bat
@echo off
set BACKUP_DIR=C:\backups\blog
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%
copy /Y data\blog.db %BACKUP_DIR%\blog-%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%.db
```

### 迁移数据库

将博客迁移到新服务器时，只需要复制 `data/blog.db` 文件：

```
旧服务器                 新服务器
data/blog.db  ──复制──▶  data/blog.db
```

### 数据库文件说明

| 文件 | 说明 |
|------|------|
| `data/blog.db` | 主数据库文件 |
| `data/blog.db-wal` | WAL 日志（可安全删除） |
| `data/blog.db-shm` | 共享内存文件（可安全删除） |

> 这些文件已被 .gitignore 排除，不会提交到 Git 仓库。

---

## 6. 端口规划参考

| 端口 | 用途 | 是否需要暴露到公网 |
|------|------|-------------------|
| 22 | SSH 远程管理 | 建议仅内网或 VPN |
| 80/443 | HTTP/HTTPS | 是（通过 Nginx） |
| 3000 | Next.js 应用 | 否（仅 Nginx 内部） |
| 8080 | 备用 HTTP | 可选 |
