<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  robot: { type: Object, required: true },
})

const statusData = computed(() => props.robot.status || {})
const isOnline = computed(() => props.robot.is_online)

const batteryColor = computed(() => {
  const v = statusData.value.battery ?? 0
  if (v > 50) return 'var(--success)'
  if (v > 20) return 'var(--warning)'
  return 'var(--danger)'
})
</script>

<template>
  <a :href="`/robot/${robot.id}`" class="card robot-card">
    <div class="scanline"></div>
    <div class="card-header">
      <div class="card-header-left">
        <div class="robot-avatar">
          <span class="robot-avatar-icon">🤖</span>
        </div>
        <div>
          <h3 class="robot-name">{{ robot.name }}</h3>
          <span class="robot-model">{{ robot.model || 'Unknown' }}</span>
        </div>
      </div>
      <StatusBadge :status="isOnline ? (statusData.status || 'idle') : 'offline'" />
    </div>

    <div class="card-body">
      <div class="battery-section">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3" />
          <circle
            cx="24" cy="24" r="18" fill="none"
            :stroke="batteryColor"
            stroke-width="3"
            stroke-linecap="round"
            transform="rotate(-90 24 24)"
            :stroke-dasharray="2 * Math.PI * 18"
            :stroke-dashoffset="2 * Math.PI * 18 * (1 - (statusData.battery ?? 0) / 100)"
            style="transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease"
          />
          <text x="24" y="24" text-anchor="middle" dominant-baseline="central" fill="var(--text-primary)" font-size="11" font-weight="700">
            {{ Math.round(statusData.battery ?? 0) }}%
          </text>
        </svg>
        <span class="battery-label">电量</span>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">速度</span>
          <span class="stat-value">{{ (statusData.speed_linear ?? 0).toFixed(1) }} <small>m/s</small></span>
        </div>
        <div class="stat-item">
          <span class="stat-label">温度</span>
          <span class="stat-value">{{ statusData.temperature?.toFixed(1) ?? '--' }} <small>°C</small></span>
        </div>
        <div class="stat-item">
          <span class="stat-label">CPU</span>
          <div class="mini-bar">
            <div class="mini-fill" :style="{ width: (statusData.cpu_usage ?? 0) + '%', background: (statusData.cpu_usage ?? 0) > 80 ? 'var(--warning)' : 'var(--accent)' }"></div>
          </div>
          <span class="stat-value-sm">{{ Math.round(statusData.cpu_usage ?? 0) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">位置</span>
          <span class="stat-value">
            ({{ (statusData.position_x ?? 0).toFixed(1) }}, {{ (statusData.position_y ?? 0).toFixed(1) }})
          </span>
        </div>
      </div>
    </div>
  </a>
</template>

<style scoped>
.robot-card {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
}
.robot-card:hover {
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.robot-avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #1a2a4a, #0f1a30);
  border-radius: 12px;
  border: 1px solid rgba(0, 180, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.robot-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 1px;
}
.robot-model {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.battery-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.battery-label {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stats-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.stat-label {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}
.stat-value small {
  font-weight: 400;
  color: var(--text-secondary);
  font-size: 11px;
}
.stat-value-sm {
  font-size: 12px;
  font-weight: 600;
}

.mini-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
  margin: 2px 0;
  width: 100%;
  max-width: 60px;
}
.mini-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
</style>
