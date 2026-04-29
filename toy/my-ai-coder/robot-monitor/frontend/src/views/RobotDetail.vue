<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRobotStore } from '../stores/robot'
import { storeToRefs } from 'pinia'
import RobotIllustration from '../components/RobotIllustration.vue'
import PartsList from '../components/PartsList.vue'
import ActivityLog from '../components/ActivityLog.vue'
import StatusChart from '../components/StatusChart.vue'
import StatusBadge from '../components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const store = useRobotStore()
const { currentRobot, realtimeStatus, loading } = storeToRefs(store)

const robotId = computed(() => route.params.id)
const highlightedPart = ref(null)
const logSource = ref('')
const logRef = ref(null)

// Sensor simulation data (frontend side, derived from real backend data)
const sensorReadings = ref([
  { id: 'temp', label: '核心温度', icon: '🌡️', get value() { return s?.temperature?.toFixed(1) ?? '--' }, unit: '°C', get pct() { return Math.min(100, (s?.temperature ?? 35) * 2) }, warn: false, cool: true },
  { id: 'cpu', label: 'CPU 负载', icon: '🧠', get value() { return Math.round(s?.cpu_usage ?? 0).toString() }, unit: '%', get pct() { return Math.round(s?.cpu_usage ?? 0) }, warn: false, cool: false },
  { id: 'mem', label: '内存占用', icon: '💾', get value() { return Math.round(s?.memory_usage ?? 0).toString() }, unit: '%', get pct() { return Math.round(s?.memory_usage ?? 0) }, warn: false, cool: false },
  { id: 'bat', label: '电量', icon: '🔋', get value() { return (s?.battery ?? 0).toFixed(0) }, unit: '%', get pct() { return Math.round(s?.battery ?? 0) }, get warn() { return (s?.battery ?? 100) < 20 }, cool: false },
  { id: 'spd', label: '线速度', icon: '📊', get value() { return (s?.speed_linear ?? 0).toFixed(2) }, unit: 'm/s', get pct() { return Math.min(100, Math.round((s?.speed_linear ?? 0) * 50)) }, warn: false, cool: false },
  { id: 'ang', label: '角速度', icon: '🔄', get value() { return (s?.speed_angular ?? 0).toFixed(2) }, unit: 'rad/s', get pct() { return Math.min(100, Math.abs(Math.round((s?.speed_angular ?? 0) * 50))) }, warn: false, cool: false },
])

const s = computed(() => currentRobot.value?.status || {})

// System stats derived from real data
const sysStats = computed(() => [
  { label: 'CPU', pct: Math.round(s.value.cpu_usage ?? 0), color: '#00b4ff' },
  { label: '内存', pct: Math.round(s.value.memory_usage ?? 0), color: '#00ff88' },
  { label: '电量', pct: Math.round(s.value.battery ?? 0), color: (s.value.battery ?? 100) > 50 ? '#00ff88' : '#ffaa00' },
  { label: '温度', pct: Math.min(100, Math.round((s.value.temperature ?? 35) * 2)), color: (s.value.temperature ?? 35) > 45 ? '#ff4466' : '#a855f7' },
])

// Charts history
const batteryHistory = ref([])
const speedHistory = ref([])
const tempHistory = ref([])
const historyLimit = 60

function onPartClick(partId) {
  highlightedPart.value = partId
  const partNames = {
    head: '头部系统', torso: '核心躯干', arm_left: '左臂', arm_right: '右臂',
    leg_left: '左腿', leg_right: '右腿', sensor_pack: '传感器阵列', power_cell: '能源单元'
  }
  logRef.value?.addLog(`查看 ${partNames[partId] || partId} 详情`)
  setTimeout(() => { highlightedPart.value = null }, 3000)
}

function simulateFault() {
  const warnParts = ['arm_right', 'power_cell']
  const targetId = warnParts[Math.floor(Math.random() * warnParts.length)]
  const names = { arm_right: '右臂', power_cell: '能源单元' }
  logRef.value?.addLog(`⚠️ 模拟故障: ${names[targetId]} 异常`, 'warn')
  highlightedPart.value = targetId
  setTimeout(() => { highlightedPart.value = null }, 3000)
}

onMounted(async () => {
  await store.fetchRobotDetail(robotId.value)
  store.connectWebSocket(robotId.value)

  const result = await store.fetchStatusHistory(robotId.value, { limit: 60 })
  if (result.history) {
    const points = result.history.reverse()
    batteryHistory.value = points.map(p => ({ t: p.recorded_at, v: p.battery }))
    speedHistory.value = points.map(p => ({ t: p.recorded_at, v: p.speed_linear }))
    tempHistory.value = points.map(p => ({ t: p.recorded_at, v: p.temperature }))
  }

  logRef.value?.addLog(`✅ 连接机器人 ${currentRobot.value?.name || robotId.value}`)
})

onUnmounted(() => {
  store.disconnectWebSocket(robotId.value)
})

watch(() => realtimeStatus.value[robotId.value], (data) => {
  if (!data) return
  const now = new Date().toISOString()
  const push = (arr, val) => {
    if (val == null) return
    arr.push({ t: now, v: val })
    if (arr.length > historyLimit) arr.shift()
  }
  push(batteryHistory.value, data.battery)
  push(speedHistory.value, data.speed_linear)
  push(tempHistory.value, data.temperature)
})

const robotName = computed(() => currentRobot.value?.name || '加载中...')
const statusData = computed(() => currentRobot.value?.status || {})
</script>

<template>
  <div>
    <button class="back-btn" @click="router.push('/')">← 返回仪表盘</button>

    <div v-if="loading && !currentRobot" class="loading-spinner-wrapper">
      <div class="loading-spinner"></div>
    </div>

    <template v-else-if="currentRobot">
      <!-- Header -->
      <div class="detail-header">
        <div class="detail-header-left">
          <div class="detail-avatar">🤖</div>
          <div>
            <h1 class="detail-name">{{ currentRobot.name }}</h1>
            <span class="detail-model">{{ currentRobot.model }} · {{ currentRobot.id.slice(0, 8) }}...</span>
          </div>
        </div>
        <div class="detail-header-right">
          <StatusBadge :status="currentRobot.is_online ? (statusData.status || 'idle') : 'offline'" />
        </div>
      </div>

      <!-- Main 3-column grid -->
      <div class="main-grid">
        <!-- Left: Parts List -->
        <div class="card">
          <div class="scanline"></div>
          <div class="card-title">
            <h3>⚙️ 身体部位</h3>
            <span class="badge">8 组件</span>
          </div>
          <PartsList
            :status="statusData"
            :highlighted-part="highlightedPart"
            :robot-name="currentRobot.name"
            @part-click="onPartClick"
          />
        </div>

        <!-- Center: Robot Illustration -->
        <div class="card robot-center-card">
          <div class="scanline"></div>
          <div class="card-title" style="justify-content:center;margin-bottom:8px">
            <h3 style="text-align:center">{{ currentRobot.name }}</h3>
          </div>
          <RobotIllustration
            :status="statusData"
            :highlighted-part="highlightedPart"
            @part-click="onPartClick"
          />
        </div>

        <!-- Right: Sensors -->
        <div class="card">
          <div class="scanline"></div>
          <div class="card-title">
            <h3>📡 传感器</h3>
            <span class="badge">实时</span>
          </div>
          <div class="sensor-grid">
            <div v-for="sensor in sensorReadings" :key="sensor.id" class="sensor-item">
              <div class="sensor-label">
                <span class="sensor-icon">{{ sensor.icon }}</span> {{ sensor.label }}
              </div>
              <div class="sensor-value">
                {{ sensor.value }}
                <span class="sensor-unit">{{ sensor.unit }}</span>
              </div>
              <div class="sensor-bar">
                <div
                  class="sensor-fill"
                  :class="{ warn: sensor.warn, cool: sensor.cool }"
                  :style="{ width: sensor.pct + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom 3-column grid -->
      <div class="bottom-grid">
        <!-- System Stats -->
        <div class="card">
          <div class="scanline"></div>
          <div class="card-title">
            <h3>📊 系统负载</h3>
            <span class="badge">性能</span>
          </div>
          <div class="sys-stats">
            <div v-for="stat in sysStats" :key="stat.label" class="sys-stat-row">
              <span class="sys-stat-label">{{ stat.label }}</span>
              <div class="bar-track">
                <div class="fill" :style="{ width: stat.pct + '%', background: stat.color }"></div>
              </div>
              <span class="sys-stat-val">{{ stat.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Activity Log -->
        <div class="card">
          <div class="scanline"></div>
          <div class="card-title">
            <h3>📋 活动日志</h3>
            <span class="badge">最近</span>
          </div>
          <ActivityLog ref="logRef" :log-source="logSource" />
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="scanline"></div>
          <div class="card-title">
            <h3>⚡ 快捷操作</h3>
            <span class="badge">控制</span>
          </div>
          <div class="quick-actions">
            <button class="quick-btn primary" @click="logRef?.addLog('自检指令已发送')">
              <span class="quick-icon">🔍</span> 自检
            </button>
            <button class="quick-btn" @click="logRef?.addLog('重启通讯模块')">
              <span class="quick-icon">🔄</span> 重启网络
            </button>
            <button class="quick-btn" @click="simulateFault">
              <span class="quick-icon">⚠️</span> 模拟故障
            </button>
            <button class="quick-btn danger" @click="logRef?.addLog('紧急停止指令 ⚠️', 'warn')">
              <span class="quick-icon">⏹️</span> 紧急停止
            </button>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-section">
        <h3 class="section-title">📈 历史趋势</h3>
        <div class="charts-grid">
          <StatusChart label="Battery" :data-points="batteryHistory" color="#22c55e" y-label="%" />
          <StatusChart label="Speed" :data-points="speedHistory" color="#3b82f6" y-label="m/s" />
          <StatusChart label="Temperature" :data-points="tempHistory" color="#ef4444" y-label="°C" />
        </div>
      </div>
    </template>

    <div v-else class="loading-spinner-wrapper">
      <p style="color:var(--text-secondary)">机器人未找到</p>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  margin-bottom: 16px;
  transition: all 0.2s;
  font-family: inherit;
}
.back-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.loading-spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 180, 255, 0.1);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Header ── */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 22px;
}
.detail-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.detail-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #1a2a4a, #0f1a30);
  border-radius: 12px;
  border: 1px solid rgba(0, 180, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.detail-name {
  font-size: 20px;
  font-weight: 700;
}
.detail-model {
  font-size: 12px;
  color: var(--text-secondary);
}

/* ── Main 3-column grid ── */
.main-grid {
  display: grid;
  grid-template-columns: 1.1fr 1.2fr 1.1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.robot-center-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px 10px;
}

/* ── Sensors ── */
.sensor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.sensor-item {
  background: rgba(0, 20, 50, 0.25);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  border: 1px solid rgba(0, 180, 255, 0.04);
  transition: all 0.3s;
}
.sensor-item:hover {
  background: rgba(0, 30, 60, 0.3);
  border-color: rgba(0, 180, 255, 0.1);
}
.sensor-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 500;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.sensor-icon { font-size: 13px; }
.sensor-value {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.sensor-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 400;
}
.sensor-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  margin-top: 6px;
  overflow: hidden;
}
.sensor-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #00b4ff, #00ff88);
  transition: width 0.6s ease;
}
.sensor-fill.warn {
  background: linear-gradient(90deg, #ffaa00, #ff4466);
}
.sensor-fill.cool {
  background: linear-gradient(90deg, #0088ff, #00ddff);
}

/* ── Bottom 3-column grid ── */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

/* System stats */
.sys-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sys-stat-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sys-stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  min-width: 40px;
  font-weight: 500;
}
.sys-stat-val {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 36px;
  text-align: right;
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.quick-btn {
  padding: 12px 8px;
  background: rgba(0, 30, 60, 0.3);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 180, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  font-family: inherit;
}
.quick-btn:hover {
  background: rgba(0, 50, 100, 0.3);
  border-color: rgba(0, 180, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}
.quick-btn.primary {
  background: rgba(0, 120, 255, 0.12);
  border-color: rgba(0, 180, 255, 0.15);
}
.quick-btn.primary:hover {
  background: rgba(0, 120, 255, 0.2);
  border-color: rgba(0, 200, 255, 0.3);
}
.quick-btn.danger {
  border-color: rgba(255, 68, 102, 0.1);
}
.quick-btn.danger:hover {
  background: rgba(255, 68, 102, 0.1);
  border-color: rgba(255, 68, 102, 0.25);
  color: var(--danger);
}
.quick-icon { font-size: 20px; }

/* ── Charts ── */
.charts-section {
  margin-top: 8px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.7);
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .main-grid, .bottom-grid {
    grid-template-columns: 1fr 1fr;
  }
  .main-grid .robot-center-card {
    grid-column: span 2;
    order: -1;
  }
}
@media (max-width: 700px) {
  .main-grid, .bottom-grid {
    grid-template-columns: 1fr;
  }
  .main-grid .robot-center-card {
    grid-column: span 1;
  }
  .sensor-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
