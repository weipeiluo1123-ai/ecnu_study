# Robot Monitor — 系统架构文档

> **版本**: v1.0  
> **最后更新**: 2026-04-29  
> **技术栈**: FastAPI + Vue 3 + SQLite/PostgreSQL

---

## 目录

1. [项目概述](#sec-1)
2. [技术选型与理由](#sec-2)
3. [整体架构](#sec-3)
4. [后端设计](#sec-4)
5. [数据库设计](#sec-5)
6. [前端设计](#sec-6)
7. [实时通信设计](#sec-7)
8. [API 接口文档](#sec-8)
9. [数据流](#sec-9)
10. [开发环境搭建](#sec-10)
11. [项目目录结构](#sec-11)
12. [未来扩展](#sec-12)
13. [Swagger 交互式 API 文档使用指南](#sec-13)
14. [下一步行动](#sec-14)

> **💡 新手入门**：如果对文中的技术概念不熟悉，`docs/beginners/` 目录下有 5 篇面向零基础读者的技术科普文档，每个都结合本项目具体讲解。

---

<a name="sec-1"></a>

## 1. 项目概述

### 1.1 目标

构建一个 **机器人状态监控 Web 仪表盘**，能够:
- 实时展示机器人的各项运行状态（位置、电量、速度、传感器等）
- 记录历史状态数据，支持回溯查询
- 通过 WebSocket 实现前后端实时通信
- 为后续硬件接入和移动端 App 预留扩展接口

### 1.2 核心功能

| 功能 | 说明 |
|------|------|
| 机器人概览 | 仪表盘展示所有机器人状态卡片 |
| 实时状态 | WebSocket 推送实时更新的各项指标 |
| 历史查询 | 按时间范围查询机器人的状态变化 |
| 状态告警 | 异常状态（低电量、离线、错误）的检测与提示 |
| 数据可视化 | 图表展示速度、电量等随时间变化的趋势 |

---

<a name="sec-2"></a>

## 2. 技术选型与理由

### 2.1 后端: FastAPI (Python)

**选择理由：**

| 特性 | 优势 |
|------|------|
| **原生异步支持** | `async/await` 原生支持 WebSocket 长连接，一台服务器可处理数百个并发连接，这对实时机器人监控至关重要 |
| **自动 API 文档** | 内置 Swagger UI (`/docs`) 和 ReDoc (`/redoc`)，开发调试零成本 |
| **Pydantic 模型** | 请求/响应自动校验，保证数据完整性 |
| **轻量高性能** | 性能与 Node.js/Go 接近，但 Python 在机器人生态中优势明显（ROS、串口、GPIO） |
| **硬件集成路径顺滑** | 后续接入真实机器人时，Python 可直接操作 serial、socket、ROS2 等库，无需跨语言桥接 |

### 2.2 数据库: SQLite (开发) → PostgreSQL (生产)

| 阶段 | 数据库 | 理由 |
|------|--------|------|
| 开发 | SQLite | 零配置，单文件，无需安装数据库服务 |
| 生产 | PostgreSQL | 支持并发写入、时间序列优化、成熟稳定 |

使用 SQLAlchemy 异步引擎，切换数据库只需修改一行连接串。

### 2.3 前端: Vue 3 + Vite + Pinia

| 技术 | 版本 | 作用 |
|------|------|------|
| Vue 3 | ^3.4 | Composition API + `<script setup>` 组合式开发 |
| Vite | ^5 | 极速开发服务器，秒级热更新 |
| Pinia | ^2 | 轻量状态管理，TS 支持优秀 |
| Chart.js | ^4 | 数据可视化图表 |
| Vue Router | ^4 | 前端路由 |

### 2.4 实时通信: WebSocket

**为什么选 WebSocket 而非 SSE 或轮询：**

| 方案 | 延迟 | 方向性 | 适用场景 |
|------|------|--------|----------|
| **WebSocket** ✅ | 低 | 双向 | 实时监控 + 后续发送控制指令 |
| SSE | 低 | 单向（服务器→客户端） | 纯推送场景 |
| 轮询 | 高 | 双向 | 无长连接需求 |

WebSocket 的双向通信能力为后续"从仪表盘给机器人发指令"预留了通道。

---

<a name="sec-3"></a>

## 3. 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                        浏览器 (Vue 3)                         │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ 仪表盘   │  │ 机器人详情 │  │ 历史数据  │  │ WebSocket    │  │
│  │ (Dashboard)│  │ (Detail)  │  │ (History) │  │ 客户端       │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │             │             │               │           │
│  ┌────┴─────────────┴─────────────┴───────────────┴───────┐  │
│  │                    Pinia 状态管理                        │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│              ┌────────────┴────────────┐                     │
│              │   HTTP (Axios)          │  WebSocket           │
│              │   REST API 调用          │  实时数据推送          │
│              └────────────┬────────────┘                     │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    后端 FastAPI                              │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │                   路由层 (Routers)                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │  │
│  │  │ /api/robots │  │ /api/status│  │ /ws/{robot_id}  │  │  │
│  │  └──────┬─────┘  └──────┬─────┘  └───────┬─────────┘  │  │
│  └─────────┼───────────────┼─────────────────┼────────────┘  │
│            │               │                 │               │
│  ┌─────────┴───────────────┴─────────────────┴────────────┐  │
│  │                    业务逻辑层                            │  │
│  │              CRUD / 数据聚合 / 状态管理                   │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────┴───────────────────────────────┐  │
│  │                    数据模型层 (SQLAlchemy)               │  │
│  │             Robot | RobotStatus | StatusHistory         │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   数据库       │
                    │  (SQLite/     │
                    │   PostgreSQL)  │
                    └───────────────┘
```

### 3.1 请求处理流程

```
前端发起请求
    │
    ▼
HTTP 请求 ──────────────────→ Axios 拦截器 ─────────→ FastAPI Router
                              (添加基础URL / 错误处理)    │
                                                         ▼
                                                    Pydantic Schema 校验
                                                         │
                                                         ▼
                                                    Service 业务逻辑
                                                         │
                                                         ▼
                                                    SQLAlchemy ORM 查询
                                                         │
                                                         ▼
                                                    数据库
                                                         │
                                                    ←─── 返回数据 ───→ JSON 响应 → 前端渲染
```

### 3.2 实时数据推送流程

```
机器人模拟器 / 真实机器人
    │
    ▼
后端数据采集服务 (每 x 秒生成状态数据)
    │
    ├──→ 状态存入数据库 (status_history)
    │
    └──→ WebSocket Manager 广播 ──→ 所有连接的客户端
                                       │
                                       ▼
                                  Pinia Store 更新
                                       │
                                       ▼
                                  Vue 组件响应式更新
```

---

<a name="sec-4"></a>

## 4. 后端设计

### 4.1 技术栈详情

```
Python 3.11+
├── FastAPI              # Web 框架
├── uvicorn[standard]    # ASGI 服务器
├── SQLAlchemy 2.0       # ORM (异步)
├── aiosqlite            # SQLite 异步驱动
├── asyncpg              # PostgreSQL 异步驱动（生产）
├── Pydantic v2          # 数据校验
├── websockets           # WebSocket 支持
├── alembic              # 数据库迁移（可选）
└── python-dotenv        # 环境变量管理
```

### 4.2 应用配置 (`config.py`)

所有配置集中管理，通过环境变量覆盖：

```python
# 核心配置项
DATABASE_URL: str          # 数据库连接串，默认 sqlite+aiosqlite:///./robot.db
WS_HEARTBEAT_INTERVAL: int # WebSocket 心跳间隔（秒），默认 30
STATUS_UPDATE_INTERVAL: int# 状态更新间隔（秒），默认 5
CORS_ORIGINS: list[str]    # 允许的前端域名
```

### 4.3 API 路由设计

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/robots` | GET | 获取所有机器人列表 |
| `/api/robots` | POST | 注册新机器人 |
| `/api/robots/{id}` | GET | 获取单个机器人详情 |
| `/api/robots/{id}/status` | GET | 获取机器人当前状态 |
| `/api/robots/{id}/history` | GET | 获取历史状态（支持分页 + 时间范围） |
| `/api/robots/{id}/status` | DELETE | 删除机器人 |
| `/ws/{robot_id}` | WebSocket | 建立实时状态通道 |

### 4.4 WebSocket 消息格式

**服务端 → 客户端：**

```json
{
  "type": "status_update",
  "data": {
    "robot_id": "robot-001",
    "timestamp": "2026-04-29T12:00:00Z",
    "battery": 85.5,
    "position": { "x": 1.2, "y": 3.4, "z": 0.0 },
    "speed": 0.5,
    "temperature": 32.1,
    "status": "running"
  }
}
```

**客户端 → 服务端：**

```json
{
  "type": "subscribe",
  "robot_id": "robot-001"
}
```

---

<a name="sec-5"></a>

## 5. 数据库设计

### 5.1 ER 图

```
┌──────────────┐       ┌──────────────────┐
│    robots     │       │   robot_status    │ (当前状态，1:1)
│──────────────│       │──────────────────│
│ id (PK)      │──1:1──│ robot_id (FK)     │
│ name          │       │ battery           │
│ model         │       │ position_x/y/z    │
│ created_at    │       │ speed_linear      │
│ updated_at    │       │ speed_angular     │
└──────────────┘       │ temperature       │
       │               │ status            │
       │               │ cpu_usage         │
       │ 1:N           │ memory_usage      │
       │               │ updated_at        │
       ▼               └──────────────────┘
┌──────────────────┐
│ status_history    │ (历史记录，1:N)
│──────────────────│
│ id (PK)           │
│ robot_id (FK)     │
│ battery           │
│ position_x/y/z    │
│ speed_linear      │
│ speed_angular     │
│ temperature       │
│ status            │
│ cpu_usage         │
│ memory_usage      │
│ recorded_at       │ ← 索引字段，用于时间范围查询
└──────────────────┘
```

### 5.2 表结构

#### robots — 机器人注册表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, Default | 唯一标识 |
| name | VARCHAR(100) | NOT NULL | 机器人名称 |
| model | VARCHAR(100) | nullable | 型号 |
| is_online | Boolean | Default False | 在线状态 |
| created_at | DateTime | Default now | 创建时间 |
| updated_at | DateTime | onupdate now | 最后更新 |

#### robot_status — 机器人当前状态 (1:1)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| robot_id | UUID | PK, FK → robots.id | 机器人 ID |
| battery | Float | 0-100 | 电量百分比 |
| position_x | Float | Default 0 | X 坐标 (m) |
| position_y | Float | Default 0 | Y 坐标 (m) |
| position_z | Float | Default 0 | Z 坐标 (m) |
| speed_linear | Float | Default 0 | 线速度 (m/s) |
| speed_angular | Float | Default 0 | 角速度 (rad/s) |
| temperature | Float | nullable | 核心温度 (°C) |
| cpu_usage | Float | 0-100 | CPU 使用率 |
| memory_usage | Float | 0-100 | 内存使用率 |
| status | VARCHAR(20) | Default 'idle' | idle/running/error/charging |
| updated_at | DateTime | onupdate now | 最后更新 |

#### status_history — 状态历史 (N:1)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, Auto | 自增 ID |
| robot_id | UUID | FK → robots.id, Index | 机器人 ID |
| battery | Float | nullable | 电量 |
| position_x/y/z | Float | Default 0 | 位置 |
| speed_linear/angular | Float | Default 0 | 速度 |
| temperature | Float | nullable | 温度 |
| status | VARCHAR(20) | Default 'idle' | 状态 |
| cpu_usage | Float | nullable | CPU |
| memory_usage | Float | nullable | 内存 |
| recorded_at | DateTime | Index, Default now | 记录时间 |

> **设计决策**：`robot_status` 存储当前最新状态（每次更新覆盖），`status_history` 存储历史记录（每次更新插入）。这是经典的"当前值 + 时间序列"模式。

---

<a name="sec-6"></a>

## 6. 前端设计

### 6.1 页面路由

| 路径 | 视图 | 说明 |
|------|------|------|
| `/` | Dashboard | 仪表盘，展示所有机器人及关键指标 |
| `/robot/:id` | RobotDetail | 单个机器人的详细状态面板 |

### 6.2 视觉主题

整体采用 **赛博朋克风格** 暗色主题：

- **背景**: `#0a0e1a` 深蓝黑，配合径向渐变光晕 + 粒子动画
- **强调色**: `#00b4ff` 青色为主，`#00ff88` 绿色表示正常，`#ffaa00` 黄色表示警告，`#ff4466` 红色表示危险
- **卡片**: 半透明毛玻璃效果 (`backdrop-filter: blur`)
- **装饰**: 扫描线动画、发光边框、脉冲光效

所有颜色和间距通过 CSS 变量集中管理 (`style.css` 中的 `:root`)。

### 6.3 组件树

```
App.vue                                          # 根组件：粒子背景 + 赛博朋克顶栏 + 时钟
│
├── Dashboard.vue (/)                            # 仪表盘页面
│   ├── RobotCard.vue (循环使用)                   # 机器人卡片（圆形电量环、四格参数）
│   │   └── StatusBadge.vue                      # 在线/离线/运行中状态标签
│   └── ConnectionStatus.vue                     # WebSocket 连接状态指示器（脉冲绿点）
│
└── RobotDetail.vue (/robot/:id)                 # 机器人指挥中心页面
    │
    ├── [主网格 - 3列]
    │   ├── PartsList.vue                        # 8个身体部位状态列表（可点击，联动机器人高亮）
    │   ├── RobotIllustration.vue                # CSS 纯绘制动画机器人（头部/躯干/双臂/双腿）
    │   └── [传感器网格]                           # 6项传感器实时数据（温度/CPU/内存/电量/速度/角速度）
    │
    ├── [底部网格 - 3列]
    │   ├── [系统负载]                             # CPU/内存/电量/温度 进度条
    │   ├── ActivityLog.vue                      # 滚动活动日志
    │   └── [快捷操作]                             # 自检/重启/模拟故障/紧急停止 按钮
    │
    └── [历史趋势图]                               # Battery/Speed/Temperature 曲线
        └── StatusChart.vue (×3)                 # 复用图表组件
```

### 6.4 状态管理 (Pinia)

**robotStore.js**

| State | 类型 | 说明 |
|-------|------|------|
| robots | Array | 所有机器人列表 |
| currentRobot | Object/null | 当前选中的机器人详情 |
| realtimeStatus | Object | WebSocket 推送的实时状态 |
| isConnected | Boolean | WebSocket 连接状态 |
| loading | Boolean | 加载状态 |
| error | String/null | 错误信息 |

| Action | 说明 |
|--------|------|
| fetchRobots() | GET /api/robots |
| fetchRobotDetail(id) | GET /api/robots/{id} |
| fetchStatusHistory(id, params) | GET /api/robots/{id}/history |
| connectWebSocket(robotId) | 建立 WebSocket 连接 |
| disconnectWebSocket() | 断开 WebSocket |

### 6.4 数据流

```
                    ┌─────────────────────────┐
                    │     WebSocket 消息        │
                    │  {type: "status_update"}  │
                    └───────────┬─────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │   Pinia Store 更新        │
                    │   realtimeStatus = data   │
                    └───────────┬─────────────┘
                                ▼
              ┌─────────────────────────────────┐
              │    Vue 响应式系统检测变更          │
              │    触发组件重新渲染               │
              └──────┬──────────┬──────────────┘
                     ▼          ▼
              ┌──────────┐ ┌──────────┐
              │ 数值变化   │ │ 图表更新   │
              │ (数字跳变)  │ │ (曲线延伸)  │
              └──────────┘ └──────────┘
```

---

<a name="sec-7"></a>

## 7. 实时通信设计

### 7.1 WebSocket 连接管理

后端 `WebSocketManager` 负责：

1. **连接注册**: 客户端连接 `/ws/{robot_id}` 时注册
2. **心跳维持**: 每 30 秒发送 ping 帧，检测断线
3. **自动清理**: 断线后自动移除失效连接
4. **广播推送**: 数据更新时推送给所有订阅该机器人 ID 的客户端

```
┌───────────┐     ┌──────────────────────┐     ┌───────────┐
│ 客户端 A   │────▶│  WebSocket Manager    │◀────│ 客户端 B   │
│ (robot-001)│     │                      │     │ (robot-001)│
└───────────┘     │  connections: {       │     └───────────┘
                  │    "robot-001": [A, B]│
                  │  }                    │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │  状态更新服务           │
                  │  (每 5 秒推送一次)      │
                  └──────────────────────┘
```

### 7.2 重连策略

前端 WebSocket 客户端自动重连：

```
连接断开
    │
    ▼
等待 1 秒 → 尝试重连 → 失败 → 等待 2 秒 → 尝试重连
                                      → 失败 → 等待 4 秒 → ...
                                      → 成功 → 重置重连延迟
                                      → 最大等待 30 秒
```

指数退避 + 随机抖动，避免同时重连风暴。

### 7.3 消息协议

| 方向 | type | data | 说明 |
|------|------|------|------|
| 服务端 → 客户端 | `status_update` | 完整状态对象 | 状态更新推送 |
| 服务端 → 客户端 | `heartbeat` | `{ "server_time": "..." }` | 心跳确认 |
| 服务端 → 客户端 | `error` | `{ "message": "..." }` | 错误通知 |
| 服务端 → 客户端 | `connected` | `{ "robot_id": "..." }` | 连接成功确认 |
| 客户端 → 服务端 | `subscribe` | `{ "robot_id": "..." }` | 订阅机器人状态 |

---

<a name="sec-8"></a>

## 8. API 接口文档

### GET /api/robots

获取所有机器人列表。

**响应 200：**

```json
{
  "robots": [
    {
      "id": "uuid",
      "name": "Robot-001",
      "model": "R2-D2",
      "is_online": true,
      "status": {
        "battery": 85.5,
        "status": "running"
      },
      "created_at": "2026-04-29T10:00:00Z"
    }
  ]
}
```

### GET /api/robots/{id}

获取单个机器人详情及当前状态。

### POST /api/robots

注册新机器人。支持一次性设置所有机器人和状态字段。

**请求体 (JSON)：**

```json
{
  "name": "MyRobot",
  "model": "R-999",
  "is_online": true,
  "battery": 88.5,
  "position_x": 1.5,
  "position_y": 2.0,
  "position_z": 0.0,
  "speed_linear": 1.2,
  "speed_angular": 0.0,
  "temperature": 36.5,
  "cpu_usage": 45.0,
  "memory_usage": 60.0,
  "status": "running"
}
```

**字段说明：**

| 字段 | 类型 | 默认值 | 约束 | 说明 |
|------|------|--------|------|------|
| `name` | string | (必填) | 最长 100 字符 | 机器人名称 |
| `model` | string | `null` | 最长 100 字符 | 机器人型号 |
| `is_online` | bool | `false` | — | 是否在线 |
| `battery` | float | `null` | 0–100 | 电量百分比 |
| `position_x` | float | `0.0` | — | X 坐标 (m) |
| `position_y` | float | `0.0` | — | Y 坐标 (m) |
| `position_z` | float | `0.0` | — | Z 坐标 (m) |
| `speed_linear` | float | `0.0` | — | 线速度 (m/s) |
| `speed_angular` | float | `0.0` | — | 角速度 (rad/s) |
| `temperature` | float | `null` | — | 核心温度 (°C) |
| `cpu_usage` | float | `null` | 0–100 | CPU 使用率 |
| `memory_usage` | float | `null` | 0–100 | 内存使用率 |
| `status` | string | `"idle"` | 任意字符串 | 运行状态 |

**最小请求（只需 name）：**

```json
{
  "name": "MiniBot"
}
```

此时所有未填字段使用默认值（`is_online=false`，无初始状态）。

**响应 201：**

```json
{
  "id": "a1b2c3d4-...",
  "name": "MyRobot",
  "model": "R-999",
  "is_online": true,
  "status": {
    "battery": 88.5,
    "position_x": 1.5,
    "position_y": 2.0,
    "position_z": 0.0,
    "speed_linear": 1.2,
    "speed_angular": 0.0,
    "temperature": 36.5,
    "cpu_usage": 45.0,
    "memory_usage": 60.0,
    "status": "running",
    "updated_at": "2026-04-29T12:00:00Z"
  },
  "created_at": "2026-04-29T12:00:00Z",
  "updated_at": "2026-04-29T12:00:00Z"
}
```

> **注意：** 创建成功后，模拟器后台每 5 秒会自动更新所有在线机器人的状态（位置、速度、电量等会变化）。如果只想看静态数据，创建时将 `is_online` 设为 `false`。`id` 由服务器自动生成（UUID）。

### GET /api/robots/{id}/status

获取机器人当前详细状态。

### GET /api/robots/{id}/history

获取历史状态记录。

**参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| start_time | ISO datetime | 24小时前 | 起始时间 |
| end_time | ISO datetime | 现在 | 结束时间 |
| limit | int | 100 | 返回条数 |
| offset | int | 0 | 分页偏移 |

**响应 200：**

```json
{
  "history": [
    {
      "recorded_at": "2026-04-29T12:00:00Z",
      "battery": 85.0,
      "speed_linear": 0.5,
      "temperature": 32.0,
      "status": "running"
    }
  ],
  "total": 1000,
  "limit": 100,
  "offset": 0
}
```

### WebSocket /ws/{robot_id}

建立 WebSocket 连接以接收实时状态更新。

---

<a name="sec-9"></a>

## 9. 数据流

### 9.1 页面初始化流程

```
用户访问 Dashboard
        │
        ▼
  Vue Router → / → Dashboard.vue
        │
        ├── onMounted()
        │       │
        │       ├── robotStore.fetchRobots()    ← HTTP GET /api/robots
        │       │       │
        │       │       ▼
        │       │   返回机器人列表，渲染 RobotCard
        │       │
        │       └── 遍历 robots，为每个建立 WebSocket
        │               │
        │               ▼
        │           /ws/{robot_id} 连接建立
        │               │
        │               ▼
        │          实时状态推送 → 更新 realtimeStatus
        │
        ▼
  Dashboard 实时更新所有卡片
```

### 9.2 实时更新流程

```
后端模拟器 / 硬件
    │  每 5 秒生成状态
    ▼
后端 StatusService.update_status(robot_id, data)
    │
    ├── 1. 写入 status_history 表 (INSERT)
    ├── 2. 更新 robot_status 表 (UPSERT)
    ├── 3. 检查是否需要告警 (低电量等)
    └── 4. ws_manager.broadcast(robot_id, status_update)
            │
            ▼
      WebSocket 推送给所有订阅者
            │
            ▼
      前端 Pinia store 更新
            │
            ▼
      Vue 组件响应式刷新
```

---

<a name="sec-10"></a>

## 10. 开发环境搭建

### 10.1 前置条件

| 工具 | 版本要求 | 用途 |
|------|----------|------|
| Python | >= 3.11 | 后端运行环境 |
| Node.js | >= 18 | 前端构建 |
| npm / yarn | 任意 | 前端包管理 |

### 10.2 后端启动

```bash
# 1. 进入后端目录
cd robot-monitor/backend

# 2. 创建虚拟环境（如果未创建）
python -m venv .venv

# 3. 激活虚拟环境
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 启动开发服务器（热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**访问地址：**
- API 服务: `http://localhost:8000`
- Swagger 文档: `http://localhost:8000/docs`
- ReDoc 文档: `http://localhost:8000/redoc`

### 10.3 前端启动

```bash
# 1. 进入前端目录
cd robot-monitor/frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

**访问地址：**
- 前端页面: `http://localhost:5173`

### 10.4 环境变量

**backend/.env:**

```env
# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./robot.db

# WebSocket 心跳间隔（秒）
WS_HEARTBEAT_INTERVAL=30

# 状态更新间隔（秒）
STATUS_UPDATE_INTERVAL=5

# CORS 允许的前端地址
CORS_ORIGINS=["http://localhost:5173"]

# 日志级别
LOG_LEVEL=INFO
```

---

<a name="sec-11"></a>

## 11. 项目目录结构

```
robot-monitor/
├── docs/
│   └── ARCHITECTURE.md          # 本文档
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # 应用入口，创建 FastAPI 实例
│   │   ├── config.py            # 配置管理
│   │   ├── database.py          # 数据库引擎和会话
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── robot.py         # Robot ORM 模型
│   │   │   └── status.py        # RobotStatus + StatusHistory ORM 模型
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── robot.py         # Pydantic 请求/响应模型
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── robots.py        # 机器人 CRUD 路由
│   │   │   └── status.py        # 状态相关路由
│   │   ├── websocket/
│   │   │   ├── __init__.py
│   │   │   └── manager.py       # WebSocket 连接管理器
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── robot_service.py # 机器人业务逻辑
│   │       └── status_service.py# 状态更新业务逻辑
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js         # Axios 实例 + API 函数
│   │   ├── stores/
│   │   │   └── robot.js         # Pinia 状态管理
│   │   ├── views/
│   │   │   ├── Dashboard.vue    # 仪表盘页面
│   │   │   └── RobotDetail.vue  # 机器人详情页
│   │   ├── components/
│   │   │   ├── RobotCard.vue         # 机器人卡片（Dashboard用）
│   │   │   ├── RobotIllustration.vue # CSS 动画机器人（身体各部件）
│   │   │   ├── PartsList.vue         # 8个身体部位状态列表
│   │   │   ├── ActivityLog.vue       # 滚动活动日志
│   │   │   ├── StatusBadge.vue       # 状态标签
│   │   │   ├── ConnectionStatus.vue  # WebSocket 连接状态指示
│   │   │   └── StatusChart.vue       # 历史趋势图
│   │   ├── App.vue              # 根组件
│   │   ├── main.js              # 入口文件
│   │   └── style.css            # 全局样式
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md                    # 项目根 README
```

---

<a name="sec-12"></a>

## 12. 未来扩展

### 12.1 硬件接入

当真实机器人就绪时：

```
┌──────────────────┐
│  真实机器人硬件     │
│  ┌──────────────┐│
│  │ ROS2 / Serial ││──→ 替换当前 StatusService 中的模拟数据源
│  │ 串口 / CAN    ││
│  └──────────────┘│
└──────────────────┘
```

Python 版的 FastAPI 天然适合硬件接入，可直接使用：
- `pyserial` — 串口通信
- `rclpy` — ROS2 Python 客户端
- `socket` — TCP/UDP 网络通信

### 12.2 移动端 App

Web 端完成后，可基于同一套 API 开发移动端：

| 方案 | 技术 | 说明 |
|------|------|------|
| WebView 封装 | Capacitor + Vue | 现有代码直接打包，快速出 App |
| 原生 | React Native / Flutter | 性能更好，需重写 UI |

### 12.3 更多功能

- **用户认证**: JWT 登录 + RBAC 权限控制
- **多机器人集群**: 机器人分组管理，地图展示
- **远程控制**: 通过 WebSocket 发送控制指令（方向、速度）
- **告警通知**: 异常状态触发 WebSocket 推送 + 邮件/短信
- **视频流**: 集成机器人摄像头实时画面 (WebRTC / MJPEG)

---

---

<a name="sec-13"></a>

## 13. Swagger 交互式 API 文档使用指南

当你打开 `http://localhost:8000/docs`，会看到 FastAPI 自动生成的 Swagger UI 页面。这个页面让你可以直接在浏览器里测试所有 API 接口，无需写代码。

### 13.1 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  Robot Monitor API                              [Home] [Docs]│
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ▼ robots — 机器人 CRUD                                     │
│    │                                                       │
│    ├── GET   /api/robots         ← 展开后点击 "Try it out"  │
│    ├── POST  /api/robots                                    │
│    ├── GET   /api/robots/{robot_id}                         │
│    └── DELETE /api/robots/{robot_id}                        │
│                                                             │
│  ▼ status — 状态查询                                        │
│    │                                                       │
│    ├── GET   /api/robots/{robot_id}/status                  │
│    └── GET   /api/robots/{robot_id}/history                 │
│                                                             │
│  ▼ WebSocket — 实时通信                                     │
│    └── WebSocket /ws/{robot_id}                             │
└─────────────────────────────────────────────────────────────┘
```

每个接口（Endpoint）是一个可折叠的面板。点击接口名称即可展开。

### 13.2 基本操作步骤

以 **查询机器人列表** 为例：

```
Step 1: 找到 GET /api/robots
           ↓
Step 2: 点击接口名称行 (蓝色)，展开面板
           ↓
Step 3: 点击右上角 "Try it out" 按钮
           ↓
Step 4: 点击 "Execute" 按钮
           ↓
Step 5: 查看返回结果
```

**详细说明：**

| 步骤 | 界面元素 | 操作 |
|------|----------|------|
| 展开 | 接口名称行 (蓝色/绿色/黄色) | 点击行展开详情面板 |
| 试用 | "Try it out" 按钮 | 点击进入测试模式，输入参数区域变为可编辑 |
| 填写 | 参数输入框 | 输入需要的参数值（如 robot_id、limit 等） |
| 执行 | "Execute" 按钮 | 点击发送真实 HTTP 请求到后端 |
| 查看 | Responses 区域 | 查看服务器返回的 JSON 数据、HTTP 状态码和响应头 |

### 13.3 各接口操作详解

#### GET /api/robots — 获取所有机器人

最简单的接口，不需要任何参数：

1. 展开 `GET /api/robots`
2. 点击 **Try it out**
3. 点击 **Execute**
4. 在 **Responses** 区域查看返回的 6 个机器人数据

**返回示例：**
```json
{
  "robots": [
    {
      "id": "182fc975-...",
      "name": "Titan",
      "model": "R-646",
      "is_online": true,
      "status": {
        "battery": 55.3,
        "status": "running"
      }
    }
  ]
}
```

#### POST /api/robots — 注册新机器人

1. 展开 `POST /api/robots`
2. 点击 **Try it out**
3. 在 **Request body** 输入框中填入：
   ```json
   {
     "name": "MyRobot",
     "model": "R-999"
   }
   ```
4. 点击 **Execute**
5. 返回的 **201** 表示创建成功，响应体中包含完整的新机器人信息（包括自动生成的 id）

#### GET /api/robots/{robot_id} — 获取单个机器人

需要填入机器人 ID 参数：

1. 展开 `GET /api/robots/{robot_id}`
2. 点击 **Try it out**
3. 在 **robot_id** 输入框中粘贴从列表接口获取到的 ID（如 `182fc975-f868-4251-a99d-69c56915a53a`）
4. 点击 **Execute**
5. 查看该机器人的完整信息

> **小技巧：** 打开两个浏览器标签页，一个放 `GET /api/robots` 获取 ID，另一个放这个接口查详情。

#### DELETE /api/robots/{robot_id} — 删除机器人

1. 展开 `DELETE /api/robots/{robot_id}`
2. 点击 **Try it out**
3. 输入要删除的机器人 ID
4. 点击 **Execute**
5. 返回 **204 No Content** 表示删除成功

#### GET /api/robots/{robot_id}/history — 查看历史状态

这个接口有可选参数：

| 参数 | 说明 | 用法 |
|------|------|------|
| `robot_id` | 机器人 ID | **必填** |
| `start_time` | 起始时间 | 可选，默认 24 小时前。格式: `2026-04-29T00:00:00Z` |
| `end_time` | 结束时间 | 可选，默认当前时间 |
| `limit` | 返回条数 | 可选，默认 100，最大 1000 |
| `offset` | 跳过条数 | 可选，用于翻页。第 1 页填 0，第 2 页填 limit |

**分页查询示例（第 2 页，每页 20 条）：**

| 参数 | 值 |
|------|-----|
| robot_id | `182fc975-...` |
| limit | `20` |
| offset | `20` |

### 13.4 查看自己的 API 调用

每个接口执行后，Swagger 会显示：

- **Curl 命令** — 你可以直接复制并在终端中运行
  ```
  curl -X 'GET' 'http://localhost:8000/api/robots/182fc975-...' -H 'accept: application/json'
  ```
- **Request URL** — 完整的请求地址
- **Response Body** — 服务器返回的原始 JSON 数据
- **Response Code** — HTTP 状态码（200 成功，404 未找到，422 参数错误，500 服务器错误）
- **Response Headers** — 响应头信息

### 13.5 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 点击 Execute 后一直在转圈 | 后端没有运行 | 确保已在终端执行 `uvicorn app.main:app --reload --port 8000` |
| 返回 404 | 机器人 ID 不对 | 先用 `GET /api/robots` 查看正确的 ID |
| 返回 422 Validation Error | 请求参数格式不对 | 检查是否按要求填了必填字段，JSON 格式是否正确 |
| 页面空白或无法访问 | 服务未启动或端口错误 | 确认地址是 `http://localhost:8000/docs`（不是 5173） |

> **经验总结：** Swagger 页面最常用的场景是：
> 1. 先用 `GET /api/robots` 看看数据长什么样
> 2. 复制某个机器人的 ID
> 3. 用 `GET /api/robots/{robot_id}` 查详情
> 4. 用 `GET /api/robots/{robot_id}/history?limit=5` 看最近几条历史记录
>
> 前后端联调时，Swagger 也是验证后端接口是否正常的最快方式。

<a name="sec-14"></a>

> **下一步行动**：
>
> 1. 阅读本文档，确认技术方案是否满意
> 2. 启动后端：`cd robot-monitor/backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
> 3. 启动前端：`cd robot-monitor/frontend && npm install && npm run dev`
> 4. 打开浏览器访问以下地址：
>    - 前端仪表盘: `http://localhost:5173`
>    - Swagger API 文档: `http://localhost:8000/docs`
> 5. 在 Swagger 页面尝试 `GET /api/robots` 接口验证后端运行正常
>
> 需要调整的地方随时告诉我，所有代码和文档都可以快速迭代修改。
