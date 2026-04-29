<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: Object, default: () => ({}) },
  highlightedPart: { type: String, default: null },
  robotName: { type: String, default: 'Robot' },
})

const emit = defineEmits(['part-click'])

const parts = computed(() => {
  const s = props.status
  const temp = s.temperature ?? 35
  const cpu = s.cpu_usage ?? 50
  const mem = s.memory_usage ?? 50
  const bat = s.battery ?? 80
  const spd = s.speed_linear ?? 0
  const online = s.status ?? 'idle'

  return [
    { id: 'head', icon: '🧠', name: '头部系统', status: temp > 45 ? 'warning' : 'ok', sub: `温度 ${temp.toFixed(1)}°C`, value: temp > 45 ? `${Math.round(100 - (temp-35)*3)}%` : '98%' },
    { id: 'torso', icon: '⚡', name: '核心躯干', status: cpu > 80 || mem > 80 ? 'warning' : 'ok', sub: `CPU ${Math.round(cpu)}% · MEM ${Math.round(mem)}%`, value: `${Math.round(100 - (cpu+mem)/2*0.3)}%` },
    { id: 'arm_left', icon: '🦾', name: '左臂', status: 'ok', sub: '运行正常', value: '95%' },
    { id: 'arm_right', icon: '🦾', name: '右臂', status: temp > 42 ? 'warning' : 'ok', sub: `关节温度 ${temp.toFixed(1)}°C`, value: temp > 42 ? `${Math.max(60, Math.round(100 - (temp-42)*3))}%` : '92%' },
    { id: 'leg_left', icon: '🦿', name: '左腿', status: spd > 0 ? 'ok' : 'idle', sub: spd > 0 ? `运动 ${spd.toFixed(2)} m/s` : '待命中', value: spd > 0 ? '88%' : '100%' },
    { id: 'leg_right', icon: '🦿', name: '右腿', status: spd > 0 ? 'ok' : 'idle', sub: spd > 0 ? `运动 ${spd.toFixed(2)} m/s` : '待命中', value: spd > 0 ? '85%' : '100%' },
    { id: 'sensor_pack', icon: '📡', name: '传感器阵列', status: online === 'error' ? 'danger' : 'ok', sub: `${online === 'running' ? '全速运行' : online === 'charging' ? '充电中' : '待命'}`, value: '100%' },
    { id: 'power_cell', icon: '🔋', name: '能源单元', status: bat < 20 ? 'danger' : bat < 50 ? 'warning' : 'ok', sub: `电量 ${bat.toFixed(1)}%`, value: bat < 20 ? `${Math.round(bat)}%` : `${Math.round(bat)}%` },
  ]
})

function statusClass(status) {
  return status === 'ok' ? 'green' : status === 'warning' ? 'yellow' : status === 'danger' ? 'red' : 'blue'
}

function tagClass(status) {
  return status === 'ok' ? 'tag-online' : status === 'warning' ? 'tag-warning' : status === 'danger' ? 'tag-offline' : 'tag-charging'
}

function tagLabel(status) {
  return status === 'ok' ? '在线' : status === 'warning' ? '警告' : status === 'danger' ? '离线' : '待命'
}
</script>

<template>
  <div class="parts-list">
    <div
      v-for="p in parts"
      :key="p.id"
      class="part-item"
      :class="{ active: highlightedPart === p.id }"
      @click="emit('part-click', p.id)"
    >
      <div class="part-icon">{{ p.icon }}</div>
      <div class="part-info">
        <div class="name">
          {{ p.name }}
          <span class="tag" :class="tagClass(p.status)">{{ tagLabel(p.status) }}</span>
        </div>
        <div class="sub">{{ p.sub }}</div>
      </div>
      <div class="part-status-dot" :class="statusClass(p.status)"></div>
      <div class="part-value">{{ p.value }}</div>
    </div>
  </div>
</template>

<style scoped>
.parts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.part-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(0, 20, 50, 0.3);
  border-radius: 14px;
  border: 1px solid rgba(0, 180, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}
.part-item:hover {
  background: rgba(0, 40, 80, 0.3);
  border-color: rgba(0, 180, 255, 0.15);
  transform: translateX(4px);
}
.part-item.active {
  border-color: rgba(0, 200, 255, 0.25);
  background: rgba(0, 50, 100, 0.2);
}

.part-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(0, 180, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.part-info {
  flex: 1;
  min-width: 0;
}
.part-info .name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  gap: 6px;
}
.part-info .name .tag {
  font-size: 10px;
  padding: 0 8px;
  border-radius: 10px;
  font-weight: 500;
}
.part-info .sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 1px;
  font-weight: 300;
}

.tag-online { background: rgba(0, 255, 136, 0.15); color: #00ff88; }
.tag-warning { background: rgba(255, 170, 0, 0.15); color: #ffaa00; }
.tag-offline { background: rgba(255, 68, 102, 0.15); color: #ff4466; }
.tag-charging { background: rgba(0, 180, 255, 0.15); color: #00b4ff; }

.part-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.part-status-dot.green { background: #00ff88; box-shadow: 0 0 12px rgba(0, 255, 136, 0.3); }
.part-status-dot.yellow { background: #ffaa00; box-shadow: 0 0 12px rgba(255, 170, 0, 0.3); animation: blink 1s ease-in-out infinite; }
.part-status-dot.red { background: #ff4466; box-shadow: 0 0 12px rgba(255, 68, 102, 0.3); animation: blink 0.7s ease-in-out infinite; }
.part-status-dot.blue { background: #00b4ff; box-shadow: 0 0 12px rgba(0, 180, 255, 0.3); animation: pulse 2s ease-in-out infinite; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }

.part-value {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 45px;
  text-align: right;
}
</style>
