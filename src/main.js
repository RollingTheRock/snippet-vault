import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

const app = createApp(App)
app.use(createPinia())

async function bootstrap() {
  if (!isElectron) {
    const { default: router } = await import('./router/index.js')
    app.use(router)
  }

  app.mount('#app')

  // Mark root element for conditional CSS
  const appEl = document.getElementById('app')
  if (appEl) appEl.setAttribute('data-electron', String(isElectron))

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator && !isElectron) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }
}

bootstrap()
