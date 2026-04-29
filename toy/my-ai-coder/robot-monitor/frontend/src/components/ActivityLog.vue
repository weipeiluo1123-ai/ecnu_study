<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  logSource: { type: String, default: '' },
})

const logs = ref([
  { time: '--:--:--', msg: '系统监控面板已就绪', type: 'ok' },
])

function addLog(msg, type = 'system') {
  const now = new Date()
  const time = now.toTimeString().slice(0, 8)
  logs.value.unshift({ time, msg, type })
  if (logs.value.length > 30) logs.value.pop()
}

watch(() => props.logSource, (val) => {
  if (val) addLog(val)
})

defineExpose({ addLog })
</script>

<template>
  <div class="log-list">
    <div v-for="(log, i) in logs" :key="i" class="log-item">
      <span class="time">{{ log.time }}</span>
      <span class="msg">
        <span :class="log.type">{{ log.msg }}</span>
      </span>
    </div>
    <div v-if="logs.length === 0" class="log-empty">暂无日志</div>
  </div>
</template>

<style scoped>
.log-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 130px;
  overflow-y: auto;
  padding-right: 4px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.time {
  color: rgba(255, 255, 255, 0.2);
  min-width: 52px;
  font-family: 'Courier New', monospace;
}

.msg {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.msg .system { color: #00b4ff; }
.msg .ok { color: #00ff88; }
.msg .warn { color: #ffaa00; }
.msg .highlight { color: #00b4ff; }

.log-empty {
  color: rgba(255, 255, 255, 0.2);
  text-align: center;
  padding: 20px 0;
  font-size: 12px;
}
</style>
