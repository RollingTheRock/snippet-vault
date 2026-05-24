import { createRouter, createWebHashHistory } from 'vue-router'
import MainManager from '../views/MainManager.vue'
import QuickLaunch from '../views/QuickLaunch.vue'

const routes = [
  { path: '/', component: MainManager },
  { path: '/quicklaunch', component: QuickLaunch }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
