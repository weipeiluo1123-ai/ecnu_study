# 实时通信 — 数据为什么自动更新？

> 适合完全零基础的读者。我们用日常生活的比喻来解释。

---

## 4.1 问题：为什么数据自己会变？

你打开仪表盘，看到机器人的电量 85%，过了几秒变成 76%，再过几秒变成 92%...

这不是 bug，是**故意设计的**！

本项目有两个机制导致数据变化：

1. **模拟器** — 后端每 5 秒自动更新所有在线机器人的数据（制造假数据）
2. **WebSocket 实时推送** — 后端主动把新数据推送给前端，不用手动刷新

---

## 4.2 两种通信方式的区别

### 方案A：普通 HTTP（一问一答）

```
你                                   朋友
 │                                    │
 │ "现在几点了？"  (GET /time)        │
 │───────────────────────────────────>│
 │                                    │
 │ "3:00"                            │
 │<───────────────────────────────────│
 │                                    │
 │ (过了10分钟)                       │
 │                                    │
 │ "现在几点了？"                     │
 │───────────────────────────────────>│
 │                                    │
 │ "3:10"                            │
 │<───────────────────────────────────│
```

**缺点**：你每次都要主动问，不问了就不知道变化。

### 方案B：WebSocket（保持通话）

```
你                                   朋友
 │                                    │
 │ "从现在开始，时间变了就告诉我"     │
 │═══════════════════════════════════│  ← 一条持续连接的电话线
 │                                    │
 │ "3:05了"                           │
 │<═══════════════════════════════════│
 │                                    │
 │ "3:10了"                           │
 │<═══════════════════════════════════│
 │                                    │
 │ "3:15了"                           │
 │<═══════════════════════════════════│
```

**优点**：一次连接，持续推送，不用反复问。

> **这就像对讲机 vs 电话**：  
> HTTP = 对讲机（按一下说一句，说完就断）  
> WebSocket = 电话（拨通后一直聊，随时可以说话）

---

## 4.3 本项目的数据推送流程

```
后端模拟器（每5秒）
    │
    │  生成新的随机数据
    │
    ├──→ 写入数据库（更新当前状态 + 追加历史记录）
    │
    └──→ WebSocket Manager 广播
            │
            │  把数据推送给所有连接的浏览器
            │
            ▼
        前端 Pinia Store 更新数据
            │
            ▼
        Vue 组件自动重新渲染
            │
            ▼
        仪表盘上的数字和图表自己变了
```

整个过程只需要**几毫秒**。

---

## 4.4 模拟器：假数据的来源

模拟器的代码在 `backend/app/services/robot_service.py`：

```python
async def simulate_status_update():
    # 1. 找到所有在线的机器人
    robots = await db.execute(select(Robot).where(Robot.is_online == True))
    
    for robot in robots:
        # 2. 生成随机但"看起来真实"的数据
        status = {
            "battery": random.gauss(70, 15),    # 70%左右波动
            "speed_linear": random.uniform(0, 2),  # 0-2 m/s
            "temperature": random.uniform(25, 50), # 25-50°C
            "status": random.choice(["running", "running", "running", "idle"])
        }
        
        # 3. 更新当前状态表
        update_current_status(robot.id, status)
        
        # 4. 追加历史记录
        insert_history(robot.id, status)
        
        # 5. 推送给前端
        ws_manager.broadcast(robot.id, status)
```

> **为什么要用 random.gauss(70, 15) 而不是 random(0, 100)？**  
> `gauss` 生成**正态分布**的随机数 — 大部分数值在 55-85 之间，偶尔出现极低或极高值。这样模拟的数据看起来更真实，不会在 0 和 100 之间疯狂跳动。

当你接入真实硬件时，只需要把"生成随机数据"替换成"读取真实传感器数据"，其他代码完全不用改。

---

## 4.5 WebSocket Manager — 推送消息的中枢

```python
# backend/app/websocket/manager.py

class WebSocketManager:
    def __init__(self):
        # 存着所有连接的客户端，按机器人 ID 分组
        # {"robot-001": [WebSocketA, WebSocketB], ...}
        self._connections = {}

    async def connect(self, robot_id, ws):
        # 新客户端连接进来了，记下来
        self._connections[robot_id].append(ws)

    def disconnect(self, robot_id, ws):
        # 客户端断开了，移除
        self._connections[robot_id].remove(ws)

    async def broadcast(self, robot_id, message):
        # 给所有订阅这个机器人的客户端发消息
        for ws in self._connections.get(robot_id, []):
            await ws.send_text(json.dumps(message))
```

**可以把 WebSocket Manager 理解成一个"微信群"：**
- 每个机器人 ID = 一个群
- 前端的仪表盘 = 群成员
- 后端 = 群里自动发消息的机器人
- `broadcast` = 在群里@所有人

---

## 4.6 前端的 WebSocket 连接

```javascript
// frontend/src/api/index.js
export function createStatusSocket(robotId, onMessage, onError) {
    const socket = new WebSocket(`ws://localhost:8000/ws/${robotId}`)
    
    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        onMessage(msg)  // 收到新数据，更新页面
    }
    
    socket.onclose = () => {
        // 断线后自动重连
        setTimeout(() => connectWebSocket(robotId), 3000)
    }
}
```

前端会自动：
- 连接到 WebSocket
- 收到消息 → 更新页面
- 断线 → 3 秒后自动重连

---

## 4.7 "实时"在项目中的体现

| 场景 | 数据来源 | 更新频率 |
|------|----------|---------|
| 仪表盘初始数据 | HTTP GET /api/robots | 页面加载时一次 |
| 仪表盘实时更新 | WebSocket 推送 | 每 5 秒 |
| 详情页曲线图 | HTTP GET /api/robots/{id}/history | 页面加载时一次 |
| 详情页实时数据 | WebSocket 推送 | 每 5 秒追加一个点 |

---

## 关键知识点小结

| 术语 | 大白话解释 |
|------|-----------|
| HTTP | 一问一答（你问一句，服务器答一句） |
| WebSocket | 持续通话（一次连接，随时推送） |
| 模拟器 | 后端每 5 秒自动生成随机数据 |
| 广播 | 服务器同时给所有连接的客户端发消息 |
| 自动重连 | 网络断了后自动再连上 |
| 实时 | 不需要手动刷新，数据自己更新 |

## 相关的项目文件

| 文件 | 在此项目中的作用 |
|------|----------------|
| `backend/app/services/robot_service.py` | 模拟器，每 5 秒生成数据 |
| `backend/app/websocket/manager.py` | WebSocket 连接管理 |
| `backend/app/main.py` | 启动模拟器循环 |
| `frontend/src/api/index.js` | 前端 WebSocket 连接代码 |
| `frontend/src/stores/robot.js` | 处理实时数据的状态管理 |
