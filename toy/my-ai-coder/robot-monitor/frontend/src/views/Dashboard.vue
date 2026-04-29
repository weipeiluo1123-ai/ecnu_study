<script setup>
import { onMounted, watch } from 'vue'
import { useRobotStore } from '../stores/robot'
import { storeToRefs } from 'pinia'
import RobotCard from '../components/RobotCard.vue'

const store = useRobotStore()
const { robots, loading, error, isConnected } = storeToRefs(store)

onMounted(() => {
  store.fetchAllRobots()
})

watch(robots, (list) => {
  if (list.length > 0 && isConnected.value) {
    list.forEach((r) => {
      if (r.is_online) store.connectWebSocket(r.id)
    })
  }
})

watch(isConnected, (online) => {
  if (online && robots.value.length > 0) {
    robots.value.forEach((r) => {
      if (r.is_online) store.connectWebSocket(r.id)
    })
  }
})
</script>

<template>
  <div>
    <div class="dashboard-header">
      <div class="header-title-group">
        <h1 class="page-title">仪表盘</h1>
        <span class="robot-count">{{ robots.length }} 个机器人</span>
      </div>
      <button class="btn" @click="store.fetchAllRobots()" :disabled="loading">
        {{ loading ? '刷新中...' : '⟳ 刷新' }}
      </button>
    </div>

    <div v-if="error" class="error-banner">{{ error }}</div>

    <div v-if="loading && robots.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载机器人数据...</span>
    </div>

    <div v-else-if="robots.length === 0" class="empty-state">
      <div class="empty-icon">📡</div>
      <p>暂无机器人，请先在 Swagger 页面创建</p>
      <a href="http://localhost:8000/docs" target="_blank" class="btn" style="margin-top:12px">打开 API 文档</a>
    </div>

    <div v-else class="robot-grid">
      <RobotCard v-for="robot in robots" :key="robot.id" :robot="robot" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 24px;
  backdrop-filter: blur(4px);
}

.header-title-group {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

.robot-count {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.error-banner {
  background: rgba(255, 68, 102, 0.1);
  border: 1px solid rgba(255, 68, 102, 0.2);
  color: var(--danger);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
  font-size: 14px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
  gap: 16px;
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

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.robot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}
</style>
