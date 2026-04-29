import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import RobotDetail from './views/RobotDetail.vue'
import './style.css'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/robot/:id', name: 'RobotDetail', component: RobotDetail },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
