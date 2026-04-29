<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'idle' },
})

const colorMap = {
  running: 'var(--success)',
  idle: 'var(--text-secondary)',
  charging: 'var(--warning)',
  error: 'var(--danger)',
  offline: 'var(--danger)',
}

const color = computed(() => colorMap[props.status] || 'var(--text-secondary)')
</script>

<template>
  <span class="badge" :style="{ background: color + '22', color }">
    <span class="dot" :style="{ background: color }"></span>
    {{ status }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
