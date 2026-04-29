# 前端 — 你看到的页面是怎么来的？

> 适合完全零基础的读者。我们用日常生活的比喻来解释。

---

## 5.1 什么是前端？

**前端**就是你用浏览器打开网页时，看到的**所有内容**：

- 布局、颜色、字体（**HTML + CSS**）
- 按钮点击、数据加载、页面跳转（**JavaScript**）
- 动态效果、实时更新（**Vue.js**）

类比：前端是餐厅的**装修和菜单设计**，后端是厨房的**厨师和食材**。

---

## 5.2 本项目用到的核心技术

```
Vue 3          ← 前端框架（搭积木一样搭页面）
├── Vite       ← 构建工具（帮 Vue 跑起来的引擎）
├── Pinia      ← 状态管理（全局数据仓库）
├── Axios      ← HTTP 客户端（发请求到后端）
├── Chart.js   ← 图表库（画曲线图）
└── npm        ← 包管理器（下载各种工具的"应用商店"）
```

---

## 5.3 Vue 3 — 搭积木的方式建页面

**Vue** 是一个前端框架，它的核心理念是：把页面拆成**组件**，每个组件是一块独立的"积木"。

### 组件化思维

```
App.vue（根组件）
├── 粒子背景动画
├── 赛博朋克风格顶栏 + 实时时钟
│
├── Dashboard.vue（仪表盘）
│   ├── RobotCard.vue（机器人卡片，×N）
│   │   └── StatusBadge.vue（状态标签）
│   └── ConnectionStatus.vue（连接状态）
│
└── RobotDetail.vue（机器人详情）
    ├── PartsList.vue（身体部位列表）
    ├── RobotIllustration.vue（CSS 动画机器人）
    ├── [传感器数据网格]
    ├── [系统负载进度条]
    ├── ActivityLog.vue（活动日志）
    ├── [快捷操作按钮]
    └── StatusChart.vue ×3（历史趋势图）
```

> **与之前相比**：旧版页面较素净，新版采用了**赛博朋克风格**——深色背景、青色发光、毛玻璃卡片、粒子动画。最重要的是新增了**CSS 绘制的机器人**（`RobotIllustration.vue`），它完全用 CSS 画了一个机器人，头部会发光，手臂会摆动，躯干有旋转光环，点击身体部位会高亮联动。

每个积木（组件）：
- 有自己的**样子**（HTML + CSS 模板）
- 有自己的**行为**（JavaScript 逻辑）
- 可以**嵌套**其他积木
- 可以**复用**（同一个 BatteryGauge 用在 Dashboard 和 Detail 页）

### 一个组件的例子

```vue
<!-- frontend/src/components/StatusBadge.vue -->
<script setup>
// JavaScript 部分：组件的行为
const props = defineProps({
  status: { type: String, default: 'idle' }
})
</script>

<template>
  <!-- HTML 部分：组件的样子 -->
  <span class="badge">
    <span class="dot"></span>
    {{ status }}
  </span>
</template>

<style scoped>
/* CSS 部分：组件的样式 */
.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
```

**一个 .vue 文件 = 一个完整的组件**，包含三大块：
- `<template>` — 长得什么样（HTML）
- `<script setup>` — 有什么行为（JavaScript）
- `<style scoped>` — 穿什么衣服（CSS）

---

## 5.4 页面路由 — 网址对应哪个页面

**Vue Router** 决定：用户访问某个网址时，显示哪个页面。

```javascript
// frontend/src/main.js
const routes = [
  { path: '/',               component: Dashboard },   // 访问 / → 仪表盘
  { path: '/robot/:id',      component: RobotDetail }, // 访问 /robot/xxx → 详情页
]
```

> **`/robot/:id`** 中的 `:id` 是一个变量，访问 `/robot/123` 时 `id` 就是 `123`。

---

## 5.5 Pinia — 全局数据仓库

**Pinia** 是一个"数据仓库"，让所有组件都能访问和修改共享数据。

想象一下：你和家人共享一个**微信群**。

```
没有 Pinia：
  你（仪表盘）← 单独问后端要数据
  你爸（详情页）← 也单独问后端要数据
  你妈（历史页）← 还得再问一次
  → 浪费！各说各话！

有 Pinia：
  你问后端 → 数据存到微信群
  你爸从群里看 → 不用再问
  你妈从群里看 → 也不用再问
  → 高效！数据统一！
```

```javascript
// frontend/src/stores/robot.js
export const useRobotStore = defineStore('robot', () => {
  const robots = ref([])          // 共享数据：机器人列表
  const isConnected = ref(false)  // 共享数据：连接状态

  async function fetchAllRobots() {
    robots.value = await api.fetchRobots()  // 获取数据，存入仓库
  }

  return { robots, isConnected, fetchAllRobots }
})
```

用的时候，任何组件都可以：

```javascript
const store = useRobotStore()
store.fetchAllRobots()        // 获取数据
console.log(store.robots)     // 读取数据
```

**Pinia + WebSocket = 实时更新**：  
WebSocket 收到新数据 → 更新 Pinia 仓库 → 所有用到该数据的组件自动刷新。

---

## 5.6 图表 — 把数字变成曲线

**Chart.js** 把数据可视化成曲线图。

在前端的 `StatusChart.vue` 里：

```javascript
// 每收到一个实时数据点，追加到数组
const batteryHistory = ref([])

// WebSocket 收到新数据时
function onNewData(data) {
  batteryHistory.value.push({
    t: new Date(),      // 当前时间
    v: data.battery     // 电量值
  })
  // 只保留最近 60 个点
  if (batteryHistory.value.length > 60) batteryHistory.value.shift()
}
```

Chart.js 自动把 `[{t, v}, {t, v}, ...]` 画成一条曲线：

```
电量 %
100 ┤
 80 ┤      ╱╲    ╱╲
 60 ┤  ╱╲  ╱  ╲╱  ╲
 40 ┤──────────────────→ 时间
```

---

## 5.7 npm 和 Vite — 让项目跑起来的工具

### npm — JavaScript 的"应用商店"

**npm** (Node Package Manager) 用来下载和管理 JavaScript 工具包。

```bash
npm install        # 下载 package.json 里列出的所有工具
npm run dev        # 启动开发服务器
```

`package.json` 是"购物清单"：

```json
{
  "dependencies": {
    "vue": "^3.4.0",         // Vue 框架
    "pinia": "^2.1.0",       // 状态管理
    "axios": "^1.7.0",       // HTTP 请求
    "chart.js": "^4.4.0"     // 图表
  }
}
```

第一次运行项目时，执行 `npm install` 就会下载所有工具到 `node_modules/` 文件夹。

### Vite — 快速开发服务器

**Vite** 是 Vue 项目的"引擎"，它提供了：
- **开发服务器** — `http://localhost:5173`，修改代码后页面自动刷新
- **热更新** — 改一行代码，浏览器立刻看到效果，不用手动刷新
- **打包** — `npm run build` 把项目打包成最终上线用的文件

> **开发时**：用 `npm run dev`（快速迭代）  
> **上线时**：用 `npm run build`（生成优化后的文件）

### vite.config.js — 连接前端和后端的桥梁

```javascript
export default defineConfig({
  server: {
    port: 5173,  // 前端端口
    proxy: {
      '/api': 'http://localhost:8000',  // 前端发 /api/xxx 的请求时，
                                        // 自动转发到后端 8000 端口
    },
  },
})
```

> **为什么要配置 proxy？**  
> 前端在 5173 端口，后端在 8000 端口。如果不配置 proxy，前端访问 `/api` 就会出错。  
> proxy 就像一个**转接员**，前端请求 `/api/robots` → 转接员 → 实际发到 `localhost:8000/api/robots`。

---

## 5.8 页面加载全过程

```
你在浏览器输入 http://localhost:5173
    │
    ▼
Vite 开发服务器响应
    │
    ├── 发送 index.html（空壳子）
    ├── 发送 main.js（入口文件）
    │       │
    │       ├── 创建 Vue 应用
    │       ├── 安装 Pinia 仓库
    │       ├── 配置路由（/ → Dashboard）
    │       └── 启动应用
    │
    ▼
Dashboard 组件开始加载
    │
    ├── 1. 调用 fetchAllRobots()
    │       │
    │       ▼
    │   Axios 发 GET /api/robots
    │       │
    │       ▼
    │   后端返回 JSON 数据
    │       │
    │       ▼
    │   Pinia 仓库存储数据
    │       │
    │       ▼
    │   Vue 渲染 6 个 RobotCard
    │
    └── 2. 建立 WebSocket 连接
            │
            ▼
        后端开始推送实时数据
            │
            ▼
        Pinia 更新 → 页面自动刷新
```

---

## 关键知识点小结

| 术语 | 大白话解释 |
|------|-----------|
| 前端 | 你看到的页面（HTML/CSS/JS） |
| Vue 3 | 搭积木一样建页面的框架 |
| 组件 (Component) | 页面上的一块独立积木（.vue 文件） |
| Pinia | 全局数据仓库（共享数据的地方） |
| Vite | Vue 项目的引擎和构建工具 |
| npm | JavaScript 工具的"应用商店" |
| Axios | 发 HTTP 请求的工具 |
| Chart.js | 画图表的工具 |
| 热更新 (HMR) | 改代码后浏览器自动刷新 |

## 相关的项目文件

| 文件 | 在此项目中的作用 |
|------|----------------|
| `frontend/src/views/Dashboard.vue` | 仪表盘主页面 |
| `frontend/src/views/RobotDetail.vue` | 机器人详情页（指挥中心） |
| `frontend/src/components/RobotCard.vue` | 机器人卡片组件 |
| `frontend/src/components/RobotIllustration.vue` | CSS 动画机器人（头部/躯干/手臂/腿部） |
| `frontend/src/components/PartsList.vue` | 身体部位状态列表（可点击联动） |
| `frontend/src/components/ActivityLog.vue` | 滚动活动日志组件 |
| `frontend/src/components/ConnectionStatus.vue` | 连接状态指示器（脉冲绿点） |
| `frontend/src/stores/robot.js` | 数据仓库 |
| `frontend/src/api/index.js` | API 调用 + WebSocket |
| `frontend/src/style.css` | 全局样式（赛博朋克主题变量） |
| `frontend/vite.config.js` | Vite 配置（含 proxy） |
| `frontend/package.json` | 依赖清单 |
