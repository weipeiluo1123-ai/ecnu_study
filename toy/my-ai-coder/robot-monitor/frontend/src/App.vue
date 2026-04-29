<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import ConnectionStatus from './components/ConnectionStatus.vue'

const clock = ref('--:--:--')
let timer

onMounted(() => {
  timer = setInterval(() => {
    clock.value = new Date().toTimeString().slice(0, 8)
  }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="particles">
    <div
      v-for="i in 30"
      :key="i"
      class="particle"
      :style="{
        left: Math.random() * 100 + '%',
        width: (Math.random() * 3 + 1) + 'px',
        height: (Math.random() * 3 + 1) + 'px',
        animationDuration: (Math.random() * 20 + 15) + 's',
        animationDelay: (Math.random() * 20) + 's',
        opacity: Math.random() * 0.4 + 0.1,
      }"
    ></div>
  </div>

  <div class="app-container">
    <header class="header">
      <div class="header-left">
        <a href="/" class="logo-icon">
          <span class="logo-emoji">🤖</span>
        </a>
        <div class="logo-text">
          <span class="logo-title">ROBOT MONITOR</span>
          <span class="logo-sub">SYSTEM v1.0 · 实时遥测</span>
        </div>
      </div>
      <div class="header-right">
        <ConnectionStatus />
        <div class="header-clock">{{ clock }}</div>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-glow);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #00b4ff, #0066ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 0 30px rgba(0, 120, 255, 0.25);
  text-decoration: none;
}

.logo-text {
  display: flex;
  flex-direction: column;
}
.logo-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #00d4ff, #0088ff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
}
.logo-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 3px;
  margin-top: -2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-clock {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.main {
  position: relative;
  z-index: 1;
}
</style>
