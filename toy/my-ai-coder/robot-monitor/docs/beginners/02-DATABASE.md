# 数据库 — 数据存在哪里？

> 适合完全零基础的读者。我们用日常生活的比喻来解释。

---

## 2.1 什么是数据库？

**数据库**就是存数据的地方，像家里的**冰箱**：

```
冰箱（数据库）
├── 冷藏室（表1: robots）
│   ├── 鸡蛋（Titan 的数据）
│   ├── 牛奶（Sparky 的数据）
│   └── 蔬菜（Nano 的数据）
├── 冷冻室（表2: robot_status）
│   ├── 冻肉（Titan 的状态）
│   ├── 冰淇淋（Sparky 的状态）
│   └── 冻鱼（Nano 的状态）
└── 储物柜（表3: status_history）
    └── 记录每天吃了什么（历史记录）
```

**表（Table）** 就像冰箱的一个抽屉，每个抽屉里放一类东西。

---

## 2.2 本项目用的是什么数据库？

开发时用 **SQLite**，生产时换成 **PostgreSQL**。

| 数据库 | 开发环境 | 生产环境 |
|--------|----------|----------|
| SQLite | 一个文件（`robot.db`），零配置 | ❌ |
| PostgreSQL | ❌ | 需要安装服务，支持多人同时访问 |

> **为什么开发用 SQLite？** 因为不需要安装任何东西，程序自动创建 `robot.db` 文件。换到 PostgreSQL 只需改一行配置。

---

## 2.3 项目中的三张表

### 表1: robots — 机器人登记表

记录每个机器人是谁：

```sql
┌──────────────┬──────────┬──────────┬───────────┬──────────────────┐
│ id (编号)     │ name     │ model    │ is_online │ created_at       │
│              │ (名字)    │ (型号)   │ (在线否)   │ (创建时间)        │
├──────────────┼──────────┼──────────┼───────────┼──────────────────┤
│ 182fc975-... │ Titan    │ R-646    │ true      │ 2026-04-29.......│
│ 6ebf1720-... │ Sparky   │ R-318    │ true      │ 2026-04-29.......│
│ 2a7ac7b9-... │ MegaBot  │ R-601    │ true      │ 2026-04-29.......│
└──────────────┴──────────┴──────────┴───────────┴──────────────────┘
```

类比：公司的**员工登记表**，记录姓名、工号、是否在岗。

### 表2: robot_status — 机器人当前状态

记录机器人**此刻**的状态，每个机器人只有一条记录：

```sql
┌──────────────┬─────────┬───────────┬────────┬──────────┐
│ robot_id     │ battery │ speed_..  │ status  │ temp     │
│ (谁的状态)    │ (电量)   │ (速度)     │ (状态)   │ (温度)    │
├──────────────┼─────────┼───────────┼────────┼──────────┤
│ 182fc975-... │ 55.3    │ 1.79      │ running│ 26.0     │
│ 6ebf1720-... │ 85.5    │ 0.07      │ idle   │ 30.6     │
└──────────────┴─────────┴───────────┴────────┴──────────┘
```

类比：员工的**当前状态牌**（在忙、空闲、休息）。新数据会覆盖旧数据。

### 表3: status_history — 状态历史记录

记录机器人**所有历史状态**，每次更新都新增一条：

```sql
┌────┬──────────────┬─────────┬────────┬──────────────────┐
│ id │ robot_id     │ battery │ status │ recorded_at      │
│    │              │         │        │ (记录时间)        │
├────┼──────────────┼─────────┼────────┼──────────────────┤
│ 1  │ 182fc975-... │ 55.3    │ running│ 12:04:23         │
│ 2  │ 182fc975-... │ 58.5    │ idle   │ 12:04:28         │
│ 3  │ 182fc975-... │ 72.6    │ idle   │ 12:04:33         │
└────┴──────────────┴─────────┴────────┴──────────────────┘
```

类比：员工的**打卡记录**，每次状态变化都记下来，用来做历史报表。

> **为什么需要两张状态表？**  
> 表2 用来**实时展示**（快速查当前状态），表3 用来**画趋势图**（查历史变化）。如果只从历史记录取最新一条，会很慢。

---

## 2.4 SQLAlchemy — 用代码操作数据库

**SQLAlchemy** 是一个 Python 工具包，让你用 **Python 代码**（而不是 SQL 语句）来操作数据库。

### ORM 是什么？

**ORM** (Object-Relational Mapping) = 对象关系映射。简单说：**把数据库里的"行"变成 Python 里的"对象"**。

没有 ORM 时（直接写 SQL）：
```sql
SELECT * FROM robots WHERE name = 'Titan';
```

有 ORM 时（用 Python）：
```python
result = await db.execute(select(Robot).where(Robot.name == "Titan"))
```

后者更像在写 Python 代码，不容易写错，IDE 还能自动补全。

### 本项目中 ORM 模型的写法

```python
# backend/app/models/robot.py
class Robot(Base):
    __tablename__ = "robots"       # 对应数据库里的 robots 表

    id = Column(String(36), primary_key=True)     # id 列
    name = Column(String(100))                     # name 列
    is_online = Column(Boolean, default=False)     # is_online 列
```

每个 **类属性** 对应数据库中的 **一列**，每个 **类的实例** 对应数据库中的 **一行**。

---

## 2.5 Pydantic — 数据检查员

**Pydantic** 是另一个 Python 工具包，用来**检查数据格式是否正确**。

比如创建机器人时，用户发送了：
```json
{"name": "MyBot", "battery": 999}
```

Pydantic 会检查：
- ✓ `name` 有没有超过 100 个字符？
- ✗ `battery` 不能超过 100（我们设置的 0-100 范围）

如果格式不对，Pydantic 会自动返回错误信息，不需要我们手动写检查代码。

```python
# backend/app/schemas/robot.py
class RobotCreate(BaseModel):
    name: str = Field(..., max_length=100)      # 必填，最长100字符
    battery: Optional[float] = Field(None, ge=0, le=100)  # 可选，0-100
```

> **ORM vs Pydantic 的区别：**  
> - ORM (SQLAlchemy) ↔ 与**数据库**打交道  
> - Pydantic ↔ 与**网络请求/响应**的数据打交道  
> 两者都涉及数据格式，但负责的环节不同。

---

## 2.6 本项目的数据库操作流程

```
用户发送请求
    │
    ▼
Pydantic 检查格式 ← 如果格式不对，直接返回错误
    │
    ▼
SQLAlchemy 把请求转成数据库操作
    │
    ├── 查询 → 返回 Python 对象
    └── 写入 → 保存到数据库
    │
    ▼
Pydantic 把数据库对象转成 JSON ← 发给用户
```

---

## 关键知识点小结

| 术语 | 大白话解释 |
|------|-----------|
| 数据库 | 存数据的地方（像冰箱） |
| 表 (Table) | 冰箱里的一个抽屉（存一类东西） |
| 行 (Row) / 记录 | 抽屉里的一件东西 |
| 列 (Column) / 字段 | 这件东西的一个属性 |
| SQLite | 开发时用的数据库（一个文件搞定） |
| ORM | 用代码操作数据库的"翻译官" |
| SQLAlchemy | Python 里的 ORM 工具包 |
| Pydantic | Python 里的数据检查员 |

## 相关的项目文件

| 文件 | 在此项目中的作用 |
|------|----------------|
| `backend/app/database.py` | 建立数据库连接 |
| `backend/app/models/robot.py` | Robot 表的 ORM 模型 |
| `backend/app/models/status.py` | RobotStatus 和 StatusHistory 表的 ORM 模型 |
| `backend/app/schemas/robot.py` | Pydantic 数据校验模型 |
| `backend/robot.db` | SQLite 数据库文件（实际运行后生成） |
