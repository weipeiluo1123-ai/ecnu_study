# REST API — 前端和后端怎么说话？

> 适合完全零基础的读者。我们用日常生活的比喻来解释。

---

## 3.1 什么是 API？

**API** (应用程序接口) = 两台机器之间的**对话规则**。

有点像你和咖啡店店员之间的默契：

```
你（客户端）                   店员（服务器）
    │                           │
    │ "你好，我要一杯拿铁"       │
    │──────────────────────────>│
    │                           │
    │ "好的，25元"              │
    │<──────────────────────────│
    │                           │
    │ （付钱）                   │
    │──────────────────────────>│
    │                           │
    │ "这是您的拿铁"            │
    │<──────────────────────────│
```

**API 就是这种"一问一答"的规则**，只不过问和答的是计算机程序。

在本项目中：
- **前端**（Vue 网页）问："给我所有机器人的数据"
- **后端**（FastAPI）答："给你 JSON 格式的数据"
- 双方用 **HTTP 协议** 和 **JSON 格式** 来交流

---

## 3.2 什么是 REST？

**REST** 是一套设计 API 的"规矩"，不是软件，而是一种**风格**。

它的核心思想：

> 把数据当成"资源"，用 HTTP 的方法来操作。

| 操作 | HTTP 方法 | 数据库类比 | 在本项目 |
|------|-----------|-----------|---------|
| 查列表 | **GET** | SELECT | `GET /api/robots` → 获取所有机器人 |
| 查单个 | **GET** | SELECT | `GET /api/robots/{id}` → 获取某个机器人 |
| 新增 | **POST** | INSERT | `POST /api/robots` → 创建新机器人 |
| 删除 | **DELETE** | DELETE | `DELETE /api/robots/{id}` → 删除 |

> **GET = 问服务器要东西**  
> **POST = 给服务器送新东西**  
> **DELETE = 让服务器删东西**

---

## 3.3 URL 的结构

一个 URL (网址) 就像一封信的地址：

```
http://localhost:8000/api/robots/182fc975-.../history
│         │            │    │      │            │
│         │            │    │      │            └── 子资源：历史记录
│         │            │    │      └── 具体资源：某个机器人
│         │            │    └── 资源类别：机器人
│         │            └── API 版本标识
│         └── 服务器地址
└── 协议
```

**路径中的变量**用 `{花括号}` 表示：

| 路径 | 说明 |
|------|------|
| `/api/robots` | 机器人列表（所有机器人） |
| `/api/robots/{id}` | 某个机器人（比如 id = 182fc975-...） |
| `/api/robots/{id}/status` | 某个机器人的状态 |
| `/api/robots/{id}/history` | 某个机器人的历史记录 |

---

## 3.4 请求和响应的格式

### 请求 (Request)

前端发给后端的数据，通常有两种形式：

**1. 路径参数** — 直接写在 URL 里：
```
GET /api/robots/182fc975-.../history?limit=5&offset=0
                                      │       │
                                      │       └── 跳过 0 条
                                      └── 只返回 5 条
```

**2. 请求体 (Body)** — 写在请求的"正文"里，用 JSON 格式：
```json
// POST /api/robots
{
    "name": "MyRobot",
    "model": "R-999",
    "is_online": true,
    "battery": 88.5
}
```

### 响应 (Response)

后端返回给前端的数据，永远是 JSON 格式：

```json
{
    "id": "182fc975-...",
    "name": "MyRobot",
    "is_online": true,
    "status": {
        "battery": 88.5,
        "temperature": 36.5
    }
}
```

**HTTP 状态码** — 告诉前端请求的结果：

| 状态码 | 含义 | 在本项目 |
|--------|------|---------|
| **200** | OK，成功了 | 查询成功 |
| **201** | Created，创建成功 | 新建机器人成功 |
| **204** | No Content，成功了但没有内容 | 删除成功 |
| **404** | Not Found，没找到 | 机器人 ID 不存在 |
| **422** | Unprocessable，格式不对 | 请求体字段错误 |
| **500** | Server Error，服务器出 bug | 代码报错了 |

---

## 3.5 本项目所有 API 接口一览

```
┌──────────────────────────────────────────────────────────────────┐
│  GET    /api/robots                   查询所有机器人               │
│  POST   /api/robots                   创建新机器人                │
│  GET    /api/robots/{id}              查询单个机器人               │
│  DELETE /api/robots/{id}              删除机器人                  │
│  GET    /api/robots/{id}/status       查询机器人当前状态            │
│  GET    /api/robots/{id}/history      查询机器人历史状态            │
│  WS     /ws/{robot_id}                WebSocket 实时连接           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3.6 API 调用示例（用 curl）

**curl** 是终端里发 HTTP 请求的工具。以下是在 bash 中直接用的命令：

### 查所有机器人
```bash
curl http://localhost:8000/api/robots
```

### 创建机器人
```bash
curl -X POST http://localhost:8000/api/robots \
  -H "Content-Type: application/json" \
  -d '{"name": "MyBot", "is_online": true, "battery": 100}'
```

### 查历史（带参数）
```bash
curl "http://localhost:8000/api/robots/182fc975-.../history?limit=5"
```

> **在 Swagger 页面 (`http://localhost:8000/docs`) 也可以做同样的事**，而且有友好的按钮界面，不需要记命令。

---

## 3.7 前端是怎么调用 API 的？

在本项目中，前端用 **Axios** 这个工具来发请求：

```javascript
// frontend/src/api/index.js
import axios from 'axios'

export async function fetchRobots() {
  const { data } = await axios.get('/api/robots')
  return data.robots
}
```

这行代码做了：
1. `axios.get('/api/robots')` → 发 GET 请求到后端的 `/api/robots`
2. `await` → 等后端返回数据
3. `data.robots` → 从响应里取出 `robots` 数组

---

## 关键知识点小结

| 术语 | 大白话解释 |
|------|-----------|
| API | 两个程序之间的对话规则 |
| REST | 一套设计 API 的风格（用 GET/POST/DELETE 操作数据） |
| HTTP | 网络传输协议（前端和后端通话用的"电话线"） |
| GET | 查数据 |
| POST | 创建数据 |
| DELETE | 删除数据 |
| JSON | 数据的格式，像 `{"key": "value"}` |
| 状态码 | 服务器告诉前端"结果怎么样"的三位数 |
| URL | 接口的地址 |

## 相关的项目文件

| 文件 | 在此项目中的作用 |
|------|----------------|
| `backend/app/routes/robots.py` | 机器人相关的 API 路由 |
| `backend/app/routes/status.py` | 状态相关的 API 路由 |
| `frontend/src/api/index.js` | 前端调用 API 的工具函数 |
| `docs/ARCHITECTURE.md#8` | 详细的 API 接口文档 |
