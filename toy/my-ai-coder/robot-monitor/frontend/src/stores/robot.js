import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchRobots as apiFetchRobots,
  fetchRobot as apiFetchRobot,
  fetchStatusHistory as apiFetchHistory,
  createStatusSocket,
} from '../api'

export const useRobotStore = defineStore('robot', () => {
  // ── State ──
  const robots = ref([])
  const currentRobot = ref(null)
  const realtimeStatus = ref({})
  const isConnected = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // WebSocket references per robot
  const sockets = ref({})

  // ── Getters ──
  const onlineRobots = computed(() =>
    robots.value.filter((r) => r.is_online)
  )

  const offlineRobots = computed(() =>
    robots.value.filter((r) => !r.is_online)
  )

  // ── Actions ──

  async function fetchAllRobots() {
    loading.value = true
    error.value = null
    try {
      robots.value = await apiFetchRobots()
    } catch (e) {
      error.value = 'Failed to load robots'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchRobotDetail(id) {
    loading.value = true
    error.value = null
    try {
      currentRobot.value = await apiFetchRobot(id)
    } catch (e) {
      error.value = 'Failed to load robot detail'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchStatusHistory(id, params) {
    try {
      return await apiFetchHistory(id, params)
    } catch (e) {
      console.error('Failed to load history', e)
      return { history: [], total: 0 }
    }
  }

  function connectWebSocket(robotId) {
    // Don't duplicate connections
    if (sockets.value[robotId]) return

    const socket = createStatusSocket(
      robotId,
      (msg) => {
        if (msg.type === 'status_update') {
          realtimeStatus.value[robotId] = msg.data
          // Also update robot list status
          const robot = robots.value.find((r) => r.id === robotId)
          if (robot) {
            robot.status = { ...robot.status, ...msg.data }
          }
        }
      },
      () => {
        isConnected.value = false
      }
    )

    socket.onopen = () => {
      isConnected.value = true
    }

    socket.onclose = () => {
      isConnected.value = false
      delete sockets.value[robotId]
      // Auto-reconnect after 3 seconds
      setTimeout(() => connectWebSocket(robotId), 3000)
    }

    sockets.value[robotId] = socket
  }

  function disconnectWebSocket(robotId) {
    const socket = sockets.value[robotId]
    if (socket) {
      socket.close()
      delete sockets.value[robotId]
    }
  }

  function disconnectAll() {
    Object.keys(sockets.value).forEach(disconnectWebSocket)
  }

  return {
    robots,
    currentRobot,
    realtimeStatus,
    isConnected,
    loading,
    error,
    onlineRobots,
    offlineRobots,
    fetchAllRobots,
    fetchRobotDetail,
    fetchStatusHistory,
    connectWebSocket,
    disconnectWebSocket,
    disconnectAll,
  }
})
