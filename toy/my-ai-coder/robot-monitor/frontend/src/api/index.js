import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// ── Robots ──

export async function fetchRobots() {
  const { data } = await http.get('/robots')
  return data.robots
}

export async function fetchRobot(id) {
  const { data } = await http.get(`/robots/${id}`)
  return data
}

export async function createRobot(name, model) {
  const { data } = await http.post('/robots', { name, model })
  return data
}

export async function deleteRobot(id) {
  await http.delete(`/robots/${id}`)
}

// ── Status ──

export async function fetchRobotStatus(id) {
  const { data } = await http.get(`/robots/${id}/status`)
  return data
}

export async function fetchStatusHistory(id, params = {}) {
  const { data } = await http.get(`/robots/${id}/history`, { params })
  return data
}

// ── WebSocket ──

export function createStatusSocket(robotId, onMessage, onError) {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const host = location.host
  const socket = new WebSocket(`${protocol}://${host}/ws/${robotId}`)

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'subscribe', robot_id: robotId }))
  }

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      onMessage(msg)
    } catch {
      // ignore parse errors
    }
  }

  socket.onerror = (err) => {
    onError?.(err)
  }

  return socket
}
