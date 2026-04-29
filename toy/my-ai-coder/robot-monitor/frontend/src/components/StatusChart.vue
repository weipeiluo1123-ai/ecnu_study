<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps({
  label: { type: String, default: 'Value' },
  dataPoints: { type: Array, default: () => [] },
  color: { type: String, default: '#3b82f6' },
  yLabel: { type: String, default: '' },
})

const chartData = computed(() => ({
  labels: props.dataPoints.map((p) => {
    const d = new Date(p.t)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }),
  datasets: [
    {
      label: props.label,
      data: props.dataPoints.map((p) => p.v),
      borderColor: props.color,
      backgroundColor: props.color + '22',
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      display: true,
      grid: { color: '#334155' },
      ticks: { color: '#94a3b8', maxTicksLimit: 8 },
    },
    y: {
      display: true,
      grid: { color: '#334155' },
      ticks: { color: '#94a3b8' },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
}
</script>

<template>
  <div class="chart-wrapper">
    <h4 class="chart-title">{{ label }}</h4>
    <div class="chart-canvas">
      <Line :data="chartData" :options="chartOptions" v-if="dataPoints.length" />
      <div v-else class="no-data">No data yet</div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.chart-title {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-canvas {
  height: 200px;
}

.no-data {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}
</style>
