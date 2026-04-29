# 后端 — 服务器是如何工作的？

> 适合完全零基础的读者。我们用日常生活的比喻来解释。

---

## 1.1 什么是"后端"？

把网站想象成一家**餐厅**：

```
你（浏览器）        服务员（后端）          厨房（数据库）
    │                   │                     │
    │  "我要菜单"        │                     │
    │───────────────────>│                     │
    │                   │  "厨房，菜单在哪？"   │
    │                   │─────────────────────>│
    │                   │     "给你菜单"        │
    │                   │<─────────────────────│
    │  ← 这是菜单        │                     │
    │<───────────────────│                     │
```

- **前端** = 餐厅的装潢、菜单设计（你看到的样子）
- **后端** = 服务员（处理你的请求，去厨房拿东西）
- **数据库** = 厨房（存放所有食材/数据的地方）

我们这个项目的后端，就是用 **Python 语言** 写的一个"服务员程序"。

---

## 1.2 Python 是什么？

Python 是一种**编程语言**，就像中文/英文是人与人交流的语言一样，Python 是人与计算机交流的语言。

在这个项目里，我们用 Python 来：
- 接收来自网页的请求（"给我看看所有机器人"）
- 从数据库里取数据（查询机器人状态）
- 把数据整理好发给网页
- 每 5 秒自动更新机器人的状态（模拟器）

**你在本项目中最常见的 Python 语法：**

```python
# 定义一个变量（就像放东西的盒子）
robot_name = "Titan"

# 定义一个函数（就像一台机器，输入→处理→输出）
def get_robot_name():
    return robot_name

# 条件判断（如果...就...）
if battery < 20:
    print("电量不足！")

# 列表（一串东西）
robots = ["Titan", "Sparky", "Nano"]

# 字典（键值对，像字典查词）
robot_status = {
    "name": "Titan",
    "battery": 85.5,
    "status": "running"
}
```

---

## 1.3 FastAPI — 我们的"服务员"程序

**FastAPI** 是一个 Python 的工具包（叫"框架"），专门用来写后端服务。

在我们项目里，FastAPI 负责：

1. **定义服务入口** — 比如 `http://localhost:8000/api/robots`
2. **接收 HTTP 请求** — 当你在浏览器输入网址或点按钮时
3. **执行对应的代码** — 去数据库查数据
4. **返回 JSON 数据** — 把数据打包还给浏览器

**代码实感：**

```python
# backend/app/main.py
from fastapi import FastAPI

app = FastAPI()  # 创建一个服务员

@app.get("/api/robots")  # 当客人访问这个地址时...
async def list_robots():  # ...执行这个函数
    return {"robots": [...]}  # 返回机器人列表
```

你每在浏览器访问一个网址，FastAPI 就会找到对应的函数来执行。

---

## 1.4 uvicorn — 启动服务器的开关

**uvicorn** 是一个"服务器启动器"。你运行这条命令：

```bash
uvicorn app.main:app --reload --port 8000
```

它的意思是：
- `app.main:app` → 去 `app/main.py` 里找到 `app` 这个 FastAPI 服务员
- `--reload` → 我改代码时自动重启（开发时很方便）
- `--port 8000` → 在 8000 号门口接待客人

启动后，你的电脑就成了一个**服务器**，别人可以通过 `http://localhost:8000` 来访问。

> **localhost** = 你自己的电脑  
> **8000** = 端口（像餐厅的 8 号门）

---

## 1.5 本项目后端的文件结构

```
backend/app/
├── main.py         ← 服务员本尊，一切从这里开始
├── config.py       ← 配置信息（端口号、数据库地址等）
├── database.py     ← 和后厨（数据库）的连接方式
├── models/         ← 数据模型（机器人长什么样）
│   ├── robot.py    ← Robot 模型（名字、型号...）
│   └── status.py   ← 状态模型（电量、位置...）
├── routes/         ← 菜单目录（每个网址对应什么功能）
│   ├── robots.py   ← /api/robots 相关的功能
│   └── status.py   ← /api/robots/{id}/status 相关的功能
├── schemas/        ← 数据格式（收发数据时的模板）
│   └── robot.py    ← 创建机器人时，需要哪些字段
├── services/       ← 业务逻辑（模拟器、数据处理）
│   └── robot_service.py ← 每 5 秒更新机器人状态
└── websocket/      ← 实时推送（WebSocket）
    └── manager.py  ← 管理所有实时连接
```

---

## 1.6 请求处理全过程（通俗版）

当你访问 `http://localhost:8000/api/robots`：

```
1. 浏览器发请求 ──→  2. uvicorn 收到请求
                         │
                    3. FastAPI 查"菜单"：
                       哪个函数处理 /api/robots？
                         │
                    4. 执行 list_robots() 函数
                         │
                    5. 函数去数据库查数据
                         │
                    6. 拿回数据，打包成 JSON
                         │
                    7. 通过 uvicorn 返回给浏览器
```

整个过程通常只需要**几毫秒**。

---

## 1.7 关键知识点小结

| 术语 | 大白话解释 |
|------|-----------|
| Python | 写后端用的编程语言 |
| FastAPI | 用 Python 写的一个工具包，快速搭建 API 服务 |
| uvicorn | 让 FastAPI 跑起来的启动器 |
| 服务器 (Server) | 一台 24 小时运行、等待别人来访问的电脑 |
| 请求 (Request) | 浏览器问服务器要东西 |
| 响应 (Response) | 服务器把东西给浏览器 |
| JSON | 一种数据格式，像这样：`{"name": "Titan"}` |
| 端口 (Port) | 服务器上不同的"门"，8000 是其中一扇 |

---

## 相关的项目文件

| 文件 | 在此项目中的作用 |
|------|----------------|
| `backend/app/main.py` | FastAPI 应用入口，注册所有路由 |
| `backend/app/config.py` | 读取 `.env` 配置 |
| `backend/requirements.txt` | 列出了所有 Python 工具包（FastAPI 等） |
