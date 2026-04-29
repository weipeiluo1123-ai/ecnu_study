<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: Object, default: () => ({}) },
  highlightedPart: { type: String, default: null },
})

const emit = defineEmits(['part-click'])

const partStatus = computed(() => {
  const s = props.status
  const temp = s.temperature ?? 35
  const cpu = s.cpu_usage ?? 50
  const mem = s.memory_usage ?? 50
  const bat = s.battery ?? 80
  const spd = s.speed_linear ?? 0

  return {
    head: temp > 45 ? 'warning' : 'ok',
    torso: cpu > 80 || mem > 80 ? 'warning' : 'ok',
    arm_left: spd > 1 ? 'ok' : 'idle',
    arm_right: temp > 42 ? 'warning' : 'ok',
    leg_left: spd > 0.5 ? 'ok' : 'idle',
    leg_right: spd > 0.5 ? 'ok' : 'idle',
    sensor_pack: 'ok',
    power_cell: bat < 20 ? 'danger' : bat < 50 ? 'warning' : 'ok',
  }
})

function isHighlight(part) {
  return props.highlightedPart === part
}

function stylePart(part) {
  const p = partStatus.value[part]
  const hl = isHighlight(part)
  return {
    filter: hl ? 'brightness(1.2) saturate(1.3)' : undefined,
    boxShadow: hl ? '0 0 40px rgba(0,200,255,0.25)' : undefined,
    borderColor: p === 'warning' ? '#ffaa00' : p === 'danger' ? '#ff4466' : undefined,
  }
}
</script>

<template>
  <div class="robot-body">
    <!-- Head -->
    <div
      class="robot-head"
      :class="{ clickable: true }"
      :style="stylePart('head')"
      @click="emit('part-click', 'head')"
    >
      <div class="head-eyes">
        <div class="eye" :class="{ warn: partStatus.head === 'warning' }"></div>
        <div class="eye" :class="{ warn: partStatus.head === 'warning' }"></div>
      </div>
      <div class="head-mouth"></div>
      <div class="head-antenna"></div>
    </div>

    <!-- Torso -->
    <div
      class="robot-torso"
      :class="{ clickable: true }"
      :style="stylePart('torso')"
      @click="emit('part-click', 'torso')"
    >
      <div class="torso-core">
        <div class="core-ring"></div>
        <div class="core-ring"></div>
        <div class="core-ring"></div>
        <div class="core-center"></div>
      </div>
      <div class="torso-indicators">
        <div class="ind" :style="{ background: partStatus.torso === 'ok' ? '#00ff88' : '#ffaa00' }"></div>
        <div class="ind blink" style="background:#ffaa00"></div>
        <div class="ind" style="background:#00b4ff"></div>
        <div class="ind blink" style="background:#ff4466"></div>
      </div>
    </div>

    <!-- Left Arm -->
    <div
      class="arm arm-left clickable"
      :style="stylePart('arm_left')"
      @click="emit('part-click', 'arm_left')"
    >
      <div class="arm-joint"></div>
      <div class="arm-grip">
        <div class="claw"></div><div class="claw"></div>
      </div>
    </div>

    <!-- Right Arm -->
    <div
      class="arm arm-right clickable"
      :style="stylePart('arm_right')"
      @click="emit('part-click', 'arm_right')"
    >
      <div class="arm-joint"></div>
      <div class="arm-grip">
        <div class="claw"></div><div class="claw"></div>
      </div>
    </div>

    <!-- Left Leg -->
    <div
      class="leg leg-left clickable"
      :style="stylePart('leg_left')"
      @click="emit('part-click', 'leg_left')"
    >
      <div class="leg-knee"></div>
      <div class="leg-foot"></div>
    </div>

    <!-- Right Leg -->
    <div
      class="leg leg-right clickable"
      :style="stylePart('leg_right')"
      @click="emit('part-click', 'leg_right')"
    >
      <div class="leg-knee"></div>
      <div class="leg-foot"></div>
    </div>
  </div>
</template>

<style scoped>
.robot-body {
  position: relative;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s;
}

/* ── Head ── */
.robot-head {
  position: relative;
  width: 42%;
  aspect-ratio: 1.1/1;
  background: linear-gradient(145deg, #1a2a4a, #0f1a30);
  border-radius: 26% 26% 30% 30%;
  border: 2px solid rgba(0, 180, 255, 0.25);
  box-shadow: 0 0 30px rgba(0, 150, 255, 0.06), inset 0 -10px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 3;
}
.robot-head:hover {
  border-color: rgba(0, 200, 255, 0.5);
  box-shadow: 0 0 50px rgba(0, 150, 255, 0.12);
}

.head-eyes {
  display: flex;
  gap: 22%;
  width: 70%;
  justify-content: center;
  margin-top: 6%;
}
.eye {
  width: 28%;
  aspect-ratio: 1/1;
  background: radial-gradient(circle at 40% 35%, #00ddff, #0055aa);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.4), inset 0 -4px 8px rgba(0, 0, 0, 0.4);
  position: relative;
  animation: eyeGlow 3s ease-in-out infinite alternate;
}
.eye.warn {
  background: radial-gradient(circle at 40% 35%, #ffaa00, #cc4400);
  box-shadow: 0 0 20px rgba(255, 170, 0, 0.4);
}
.eye::after {
  content: '';
  position: absolute;
  top: 18%;
  left: 22%;
  width: 30%;
  height: 30%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 50%;
}
@keyframes eyeGlow {
  0% { box-shadow: 0 0 15px rgba(0, 200, 255, 0.3); }
  100% { box-shadow: 0 0 35px rgba(0, 200, 255, 0.7); }
}

.head-antenna {
  position: absolute;
  top: -18%;
  left: 50%;
  transform: translateX(-50%);
  width: 8%;
  height: 22%;
  background: linear-gradient(180deg, #2a4a7a, #1a2a4a);
  border-radius: 4px 4px 0 0;
  border: 1px solid rgba(0, 180, 255, 0.2);
}
.head-antenna::after {
  content: '';
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  aspect-ratio: 1/1;
  background: radial-gradient(circle, #00ddff, transparent 70%);
  border-radius: 50%;
  opacity: 0.6;
  animation: antennaPulse 2s ease-in-out infinite;
}
@keyframes antennaPulse {
  0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.9; transform: translateX(-50%) scale(1.2); }
}

.head-mouth {
  width: 30%;
  height: 5%;
  background: linear-gradient(90deg, transparent, rgba(0, 180, 255, 0.27), rgba(0, 180, 255, 0.53), rgba(0, 180, 255, 0.27), transparent);
  border-radius: 4px;
  margin-top: 6%;
  position: relative;
  overflow: hidden;
}
.head-mouth::after {
  content: '';
  position: absolute;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, #00ddff, transparent);
  animation: mouthScan 2.5s linear infinite;
}
@keyframes mouthScan {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* ── Torso ── */
.robot-torso {
  position: relative;
  width: 58%;
  aspect-ratio: 1/1.25;
  background: linear-gradient(160deg, #1e3050, #0f1a30);
  border-radius: 18% 18% 20% 20%;
  border: 2px solid rgba(0, 180, 255, 0.2);
  box-shadow: 0 0 30px rgba(0, 150, 255, 0.05), inset 0 -20px 40px rgba(0, 0, 0, 0.3);
  margin-top: -4%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6%;
}
.robot-torso:hover {
  border-color: rgba(0, 200, 255, 0.4);
  box-shadow: 0 0 50px rgba(0, 150, 255, 0.1);
}

.torso-core {
  width: 70%;
  aspect-ratio: 1/0.6;
  background: radial-gradient(ellipse at 50% 40%, rgba(0, 200, 255, 0.15), transparent 70%);
  border-radius: 16px;
  border: 1px solid rgba(0, 180, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.core-ring {
  position: absolute;
  width: 80%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: 2px solid rgba(0, 200, 255, 0.08);
  animation: ringRotate 8s linear infinite;
}
.core-ring:nth-child(2) {
  width: 55%;
  border-color: rgba(0, 200, 255, 0.15);
  animation-duration: 6s;
  animation-direction: reverse;
}
.core-ring:nth-child(3) {
  width: 30%;
  border-color: rgba(0, 220, 255, 0.2);
  animation-duration: 4s;
}
@keyframes ringRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.core-center {
  width: 18%;
  aspect-ratio: 1/1;
  background: radial-gradient(circle, #00ddff, #0055aa);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.3);
  animation: corePulse 2s ease-in-out infinite alternate;
  z-index: 2;
}
@keyframes corePulse {
  0% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 200, 255, 0.3); }
  100% { transform: scale(1.15); box-shadow: 0 0 50px rgba(0, 200, 255, 0.6); }
}

.torso-indicators {
  display: flex;
  gap: 8%;
  width: 80%;
  margin-top: 6%;
  justify-content: center;
}
.ind {
  width: 10%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
  transition: all 0.3s;
}
.ind.blink {
  animation: blinkInd 1.2s ease-in-out infinite;
}
@keyframes blinkInd {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ── Arms ── */
.arm {
  position: absolute;
  width: 16%;
  aspect-ratio: 1/3.2;
  background: linear-gradient(180deg, #1a2a4a, #0f1a30);
  border-radius: 20% 20% 30% 30%;
  border: 2px solid rgba(0, 180, 255, 0.15);
  box-shadow: inset 0 -10px 30px rgba(0, 0, 0, 0.3);
  top: 18%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 6% 0;
}
.arm:hover { border-color: rgba(0, 200, 255, 0.4); }
.arm-left {
  left: -12%;
  transform: rotate(8deg);
  transform-origin: top center;
  animation: armSwingLeft 4s ease-in-out infinite alternate;
}
.arm-right {
  right: -12%;
  transform: rotate(-8deg);
  transform-origin: top center;
  animation: armSwingRight 4s ease-in-out infinite alternate;
}
@keyframes armSwingLeft {
  0% { transform: rotate(5deg); }
  100% { transform: rotate(12deg); }
}
@keyframes armSwingRight {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(-12deg); }
}

.arm-joint {
  width: 50%;
  aspect-ratio: 1/1;
  background: radial-gradient(circle, #2a4a7a, #0f1a30);
  border-radius: 50%;
  border: 1px solid rgba(0, 180, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.1);
}
.arm-grip {
  width: 55%;
  aspect-ratio: 1/0.6;
  background: linear-gradient(180deg, #1a2a4a, #2a4a7a);
  border-radius: 6px;
  border: 1px solid rgba(0, 180, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10%;
  padding: 4%;
}
.claw {
  width: 30%;
  height: 70%;
  background: linear-gradient(180deg, #3a5a8a, #1a2a4a);
  border-radius: 4px;
  border: 1px solid rgba(0, 180, 255, 0.1);
}
.claw:last-child { transform: scaleX(-1); }

/* ── Legs ── */
.leg {
  position: absolute;
  bottom: 2%;
  width: 20%;
  aspect-ratio: 1/2.2;
  background: linear-gradient(180deg, #0f1a30, #1a2a4a);
  border-radius: 16% 16% 30% 30%;
  border: 2px solid rgba(0, 180, 255, 0.12);
  box-shadow: inset 0 -10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6%;
}
.leg:hover { border-color: rgba(0, 200, 255, 0.35); }
.leg-left {
  left: 14%;
  transform: rotate(-2deg);
  animation: legMoveLeft 3s ease-in-out infinite alternate;
}
.leg-right {
  right: 14%;
  transform: rotate(2deg);
  animation: legMoveRight 3s ease-in-out infinite alternate;
}
@keyframes legMoveLeft {
  0% { transform: rotate(-4deg) translateY(0); }
  100% { transform: rotate(0deg) translateY(-4px); }
}
@keyframes legMoveRight {
  0% { transform: rotate(4deg) translateY(0); }
  100% { transform: rotate(0deg) translateY(-4px); }
}

.leg-foot {
  width: 70%;
  aspect-ratio: 1/0.4;
  background: linear-gradient(180deg, #1a2a4a, #2a4a7a);
  border-radius: 8px 8px 12px 12px;
  border: 1px solid rgba(0, 180, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.leg-knee {
  width: 40%;
  aspect-ratio: 1/1;
  background: radial-gradient(circle, #2a4a7a, #0f1a30);
  border-radius: 50%;
  border: 1px solid rgba(0, 180, 255, 0.12);
  margin-bottom: 8%;
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.05);
}
</style>
