<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: Number, default: 80 },
})

const color = computed(() => {
  if (props.value > 50) return 'var(--success)'
  if (props.value > 20) return 'var(--warning)'
  return 'var(--danger)'
})

const dashOffset = computed(() => {
  const circumference = 2 * Math.PI * 32
  return circumference - (props.value / 100) * circumference
})
</script>

<template>
  <div class="battery-gauge" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" stroke-width="6" />
      <circle
        cx="40"
        cy="40"
        r="32"
        fill="none"
        :stroke="color"
        stroke-width="6"
        stroke-linecap="round"
        transform="rotate(-90 40 40)"
        :stroke-dasharray="2 * Math.PI * 32"
        :stroke-dashoffset="dashOffset"
        class="transition-all"
      />
      <text x="40" y="40" text-anchor="middle" dominant-baseline="central" fill="var(--text-primary)" font-size="18" font-weight="700">
        {{ Math.round(value) }}%
      </text>
    </svg>
    <span class="label" v-if="$slots.default">
      <slot />
    </span>
  </div>
</template>

<style scoped>
.battery-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.transition-all {
  transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
}
.label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>
