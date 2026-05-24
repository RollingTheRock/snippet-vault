<template>
  <component :is="currentView" />
  <ToastContainer :toasts="toasts" />
</template>

<script setup>
import { computed } from 'vue'
import QuickLaunch from './views/QuickLaunch.vue'
import MainManager from './views/MainManager.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useToast } from './composables/useToast.js'

const { toasts } = useToast()

function getWindowType() {
  const params = new URLSearchParams(window.location.search)
  return params.get('window') || 'mainManager'
}

const viewMap = { quickLaunch: QuickLaunch, mainManager: MainManager }
const currentView = computed(() => viewMap[getWindowType()] || MainManager)
</script>

<style>
@import './styles/variables.css';
@import './styles/dark-theme.css';
@import './styles/animations.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

body {
  font-family: inherit;
  background: transparent;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

#app {
  width: 100vw;
  height: 100vh;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f0f2 0%, #e8e8ec 100%);
  box-shadow:
    0 0 0 0.5px rgba(0,0,0,0.06),
    0 25px 50px -12px rgba(0,0,0,0.16),
    inset 0 1px 0 rgba(255,255,255,0.6);
}

/* ── Scrollbar ── */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}

/* ── Selection ── */
::selection {
  background: rgba(37, 99, 235, 0.15);
  color: var(--text-primary);
}

/* ── Focus Visible ── */
:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 1px;
}

/* ── kbd base ── */
kbd {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
}

/* ── Ripple keyframes (global) ── */
@keyframes ripple-expand {
  0% {
    transform: scale(0);
    opacity: 0.3;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
</style>
