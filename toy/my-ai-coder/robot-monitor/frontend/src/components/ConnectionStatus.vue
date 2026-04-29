<script setup>
import { useRobotStore } from '../stores/robot'
import { storeToRefs } from 'pinia'

const store = useRobotStore()
const { isConnected } = storeToRefs(store)
</script>

<template>
  <div class="connection-status">
    <div class="dot" :class="{ online: isConnected }"></div>
    <span class="label">{{ isConnected ? '系统在线' : '已断开' }}</span>
  </div>
</template>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 180, 255, 0.08);
  padding: 8px 20px 8px 16px;
  border-radius: 30px;
  border: 1px solid rgba(0, 200, 255, 0.15);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--danger);
  transition: all 0.3s;
}

.dot.online {
  background: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  animation: pulseGlow 1.5s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
}
</style>
