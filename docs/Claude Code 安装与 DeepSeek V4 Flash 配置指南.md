# Claude Code 安装与 DeepSeek V4 Flash 配置指南

> 适用系统：Windows / macOS / Linux
> 最后更新：2026-05-07

---

## 目录

- [一、前置要求](#一前置要求)
- [二、安装 Node.js](#二安装-nodejs)
- [三、安装 Claude Code](#三安装-claude-code)
- [四、配置 DeepSeek V4 Flash（核心）](#四配置-deepseek-v4-flash核心)
- [五、验证安装](#五验证安装)
- [六、永久生效配置](#六永久生效配置)
- [七、常见问题](#七常见问题)

---

## 一、前置要求

| 依赖 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | 18+ | 运行 Claude Code CLI |
| npm | 随 Node.js 自带 | 包管理器 |
| Git | 可选 | 项目克隆 |
| 终端 | bash / zsh / PowerShell | 命令行交互 |

---

## 二、安装 Node.js

### macOS

**方式一（推荐，Homebrew）：**
```bash
brew install node
```

**方式二（官方安装包）：**
1. 访问 https://nodejs.org 下载 LTS 版本（.pkg）
2. 双击安装，一路默认即可
3. 验证：`node -v && npm -v`

### Windows

**方式一（推荐，官方安装包）：**
1. 访问 https://nodejs.org 下载 LTS 版本（.msi）
2. 双击安装，**勾选"Add to PATH"**
3. 验证：打开 PowerShell 或 CMD，运行 `node -v && npm -v`

**方式二（winget）：**
```powershell
winget install OpenJS.NodeJS.LTS
```

### Linux（Ubuntu/Debian）

```bash
# 使用 NodeSource 官方源
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node -v && npm -v
```

### Linux（CentOS/RHEL/Fedora）

```bash
# 使用 NodeSource 官方源
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs
```

---

## 三、安装 Claude Code

### macOS / Linux

```bash
# 全局安装 Claude Code
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

如果遇到权限错误，使用：
```bash
# 方式一：配置 npm 前缀（推荐）
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc   # macOS 默认用 zsh
source ~/.zshrc
npm install -g @anthropic-ai/claude-code

# 方式二：直接使用 sudo（不推荐，有安全隐患）
sudo npm install -g @anthropic-ai/claude-code
```

### Windows

```powershell
# 打开 PowerShell（管理员），运行：
npm install -g @anthropic-ai/claude-code

# 验证
claude --version
```

如果提示 `claude 不是内部或外部命令`，检查 npm 全局路径是否在 PATH 中：
```powershell
# 查看 npm 全局模块路径
npm config get prefix
# 将输出的路径（如 C:\Users\你的用户名\AppData\Roaming\npm）添加到系统 PATH
```

---

## 四、配置 DeepSeek V4 Flash（核心）

Claude Code 默认连接 Anthropic API。要使用 DeepSeek V4 Flash，需要配置 **API 代理层**。

### 方案一：通过 OpenRouter（推荐，最简单）

OpenRouter 提供统一的 API 网关，支持 DeepSeek 模型与 Anthropic 协议兼容。

**步骤 1：注册 OpenRouter**
1. 访问 https://openrouter.ai 注册账号
2. 进入 [Keys](https://openrouter.ai/keys) 页面
3. 点击 **Create Key**，保存生成的 `sk-or-v1-xxxxxxxx` 密钥

**步骤 2：配置 Claude Code**

每次使用时指定：
```bash
claude \
  --model deepseek/deepseek-chat \
  --base-url https://openrouter.ai/api/v1 \
  --api-key sk-or-v1-你的密钥
```

> **说明**：OpenRouter 的 `/api/v1` 端点兼容 Anthropic Messages API 格式，会自动将 DeepSeek 的响应转换为 Claude Code 期望的格式。

**永久配置（见第六章）。**

### 方案二：通过 LiteLLM 本地代理（更可控）

LiteLLM 是一个本地代理服务器，可以在 Anthropic 协议和 OpenAI 协议之间翻译。

**步骤 1：安装 LiteLLM**
```bash
# 需要 Python 3.8+
pip install 'litellm[proxy]'
```

**步骤 2：获取 DeepSeek API Key**
1. 访问 https://platform.deepseek.com 注册
2. 进入 API Keys 页面，创建新 Key
3. 保存生成的 `sk-xxxxxxxx` 密钥

**步骤 3：启动 LiteLLM 代理**

macOS / Linux：
```bash
# 启动代理（需要保持终端开着）
litellm --model deepseek/deepseek-chat --api_key sk-你的DeepSeek密钥 --port 4000
```

Windows（PowerShell）：
```powershell
# 启动代理
litellm --model deepseek/deepseek-chat --api_key sk-你的DeepSeek密钥 --port 4000
```

**步骤 4：连接 Claude Code**

新开一个终端，运行：
```bash
claude \
  --model deepseek-chat \
  --base-url http://localhost:4000 \
  --api-key sk-your-deepseek-key
```

---

## 五、验证安装

### 1. 测试 Claude Code 启动

在任意项目目录下运行：
```bash
claude
```

应看到 Claude Code 的交互式界面，显示 `>` 提示符。

如果使用 OpenRouter 配置：
```bash
claude --model deepseek/deepseek-chat --base-url https://openrouter.ai/api/v1 --api-key sk-or-v1-你的密钥
```

输入 `/help` 查看可用命令。

### 2. 测试 DeepSeek 响应

进入 Claude Code 后，发送一条消息测试：
```
你好，用中文回复我，并告诉我你是什么模型
```

如果响应正常且使用 DeepSeek 模型，说明配置成功。

### 3. 测试项目理解

在 wplSpace 项目目录中运行：
```bash
cd wplSpace
claude --model deepseek/deepseek-chat --base-url https://openrouter.ai/api/v1 --api-key sk-or-v1-你的密钥
```

进入后问：
```
先读 CLAUDE.md 了解项目，然后告诉我这个项目是做什么的
```

---

## 六、永久生效配置

每次手动输入 `--api-key` 和 `--base-url` 很麻烦。以下方法可以永久配置。

### 方案 A：环境变量（推荐，通用所有系统）

编辑 shell 配置文件，添加以下环境变量：

**macOS（默认 zsh）：**
```bash
# 编辑 ~/.zshrc
echo 'export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"' >> ~/.zshrc
echo 'export ANTHROPIC_API_KEY="sk-or-v1-你的密钥"' >> ~/.zshrc
echo 'export CLAUDE_MODEL="deepseek/deepseek-chat"' >> ~/.zshrc
source ~/.zshrc
```

**Linux（默认 bash）：**
```bash
# 编辑 ~/.bashrc
echo 'export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"' >> ~/.bashrc
echo 'export ANTHROPIC_API_KEY="sk-or-v1-你的密钥"' >> ~/.bashrc
echo 'export CLAUDE_MODEL="deepseek/deepseek-chat"' >> ~/.bashrc
source ~/.bashrc
```

**Windows PowerShell：**
```powershell
# 编辑 PowerShell profile（一次性设置）
$profilePath = "$HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
$config = @'
$env:ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"
$env:ANTHROPIC_API_KEY="sk-or-v1-你的密钥"
$env:CLAUDE_MODEL="deepseek/deepseek-chat"
'@
# 确保目录存在
New-Item -ItemType File -Path $profilePath -Force
Add-Content -Path $profilePath -Value $config

# 立即生效
. $profilePath
```

**Windows CMD（命令提示符）：**
```cmd
:: 永久环境变量（需要管理员）
setx ANTHROPIC_BASE_URL "https://openrouter.ai/api/v1"
setx ANTHROPIC_API_KEY "sk-or-v1-你的密钥"
setx CLAUDE_MODEL "deepseek/deepseek-chat"
```
> 注意：`setx` 设置后需要重新打开 CMD 窗口才会生效。

### 方案 B：项目级配置（适用于特定项目）

在项目根目录创建 `.env` 文件：
```bash
cd /path/to/your/project
cat > .env << 'EOF'
ANTHROPIC_BASE_URL=https://openrouter.ai/api/v1
ANTHROPIC_API_KEY=sk-or-v1-你的密钥
CLAUDE_MODEL=deepseek/deepseek-chat
EOF
```

然后在项目目录下运行 `claude` 时会自动读取 `.env`。

### 方案 C：LiteLLM 作为系统服务（Linux / macOS）

如果使用 LiteLLM 本地代理，可以配置为开机自启：

**macOS（使用 launchd）：**
```bash
# 创建 plist 文件
cat > ~/Library/LaunchAgents/com.litellm.proxy.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.litellm.proxy</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/litellm</string>
        <string>--model</string>
        <string>deepseek/deepseek-chat</string>
        <string>--api_key</string>
        <string>sk-你的DeepSeek密钥</string>
        <string>--port</string>
        <string>4000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# 加载服务
launchctl load ~/Library/LaunchAgents/com.litellm.proxy.plist
```

**Linux（使用 systemd）：**
```bash
# 创建 systemd 服务
sudo cat > /etc/systemd/system/litellm-proxy.service << 'EOF'
[Unit]
Description=LiteLLM Proxy for DeepSeek
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/litellm --model deepseek/deepseek-chat --api_key sk-你的DeepSeek密钥 --port 4000
Restart=always
User=你的用户名

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动
sudo systemctl daemon-reload
sudo systemctl enable litellm-proxy
sudo systemctl start litellm-proxy
```

配置好 LiteLLM 服务后，环境变量只需设置：
```bash
export ANTHROPIC_BASE_URL="http://localhost:4000"
export ANTHROPIC_API_KEY="sk-你的DeepSeek密钥"
export CLAUDE_MODEL="deepseek-chat"
```

---

## 七、各系统验证清单

### macOS 验证清单
- [ ] `node -v` → v18+
- [ ] `npm -v` → v9+
- [ ] `claude --version` → 有版本号
- [ ] `echo $ANTHROPIC_BASE_URL` → OpenRouter 地址
- [ ] `echo $ANTHROPIC_API_KEY` → 有值
- [ ] `echo $CLAUDE_MODEL` → deepseek 模型名

### Windows 验证清单
- [ ] `node -v` → v18+
- [ ] `npm -v` → v9+
- [ ] `claude --version` → 有版本号
- [ ] `$env:ANTHROPIC_BASE_URL` → OpenRouter 地址
- [ ] `$env:ANTHROPIC_API_KEY` → 有值
- [ ] `$env:CLAUDE_MODEL` → deepseek 模型名

### Linux 验证清单
- [ ] `node -v` → v18+
- [ ] `npm -v` → v9+
- [ ] `claude --version` → 有版本号
- [ ] `echo $ANTHROPIC_BASE_URL` → OpenRouter 地址
- [ ] `echo $ANTHROPIC_API_KEY` → 有值
- [ ] `echo $CLAUDE_MODEL` → deepseek 模型名

---

## 八、常见问题

### Q1：claude 命令找不到

**macOS/Linux：** npm 全局模块不在 PATH 中
```bash
# 定位全局模块路径
npm config get prefix
# 输出如 /usr/local → 说明在 /usr/local/bin
# 如果输出 ~/.npm-global，则需要添加到 PATH
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.zshrc
```

**Windows：** 需要手动添加 PATH
```powershell
# npm 全局路径通常为：
# C:\Users\<用户名>\AppData\Roaming\npm
# 请将该路径添加到系统环境变量 PATH 中
```

### Q2：连接 OpenRouter 超时

可能原因：OpenRouter 在中国大陆无法直接访问
```bash
# 方案一：配置系统代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 方案二：使用 LiteLLM 本地代理（不需要访问外网）
# 详见第四章方案二
```

### Q3：LiteLLM 安装失败

```bash
# 确保 Python 和 pip 已安装
python3 --version

# 如果 pip 安装慢，使用国内镜像
pip install 'litellm[proxy]' -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q4：如何确认当前使用的是 DeepSeek 模型？

进入 Claude Code 后直接问：
```
你当前使用的是哪个模型？你的提供商是谁？
```

### Q5：DeepSeek API Key 在哪里获取？

1. 访问 https://platform.deepseek.com
2. 注册账号 → 进入 Dashboard
3. 左侧菜单 → API Keys → 创建新 Key
4. 充值（DeepSeek 价格很低，通常 $10 足够用很久）

---

## 九、快速安装参考（一键命令）

### macOS
```bash
# 一条命令完成安装
brew install node && npm install -g @anthropic-ai/claude-code && echo 'export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"\nexport ANTHROPIC_API_KEY="sk-or-v1-你的密钥"\nexport CLAUDE_MODEL="deepseek/deepseek-chat"' >> ~/.zshrc && source ~/.zshrc && echo "安装完成，请编辑 ~/.zshrc 填入你的 OpenRouter API Key"
```

### Windows（PowerShell）
```powershell
# 一条命令完成安装
winget install OpenJS.NodeJS.LTS; npm install -g @anthropic-ai/claude-code; $config = "`n`$env:ANTHROPIC_BASE_URL=`"https://openrouter.ai/api/v1`"`n`$env:ANTHROPIC_API_KEY=`"sk-or-v1-你的密钥`"`n`$env:CLAUDE_MODEL=`"deepseek/deepseek-chat`""; Add-Content -Path $PROFILE -Value $config; echo "安装完成，请编辑 PowerShell profile 填入你的 OpenRouter API Key"
```

### Linux（Ubuntu）
```bash
# 一条命令完成安装
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs && npm install -g @anthropic-ai/claude-code && echo 'export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"\nexport ANTHROPIC_API_KEY="sk-or-v1-你的密钥"\nexport CLAUDE_MODEL="deepseek/deepseek-chat"' >> ~/.bashrc && source ~/.bashrc && echo "安装完成，请编辑 ~/.bashrc 填入你的 OpenRouter API Key"
```

---

*文档生成时间：2026-05-07*
*如有问题，建议查阅 https://docs.anthropic.com/en/docs/claude-code/overview 获取 Claude Code 最新信息*
