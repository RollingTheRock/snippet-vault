<template>
  <component :is="currentView" />
</template>

<script setup>
import { computed } from 'vue'
import QuickLaunch from './views/QuickLaunch.vue'
import MainManager from './views/MainManager.vue'

function getWindowType() {
  const params = new URLSearchParams(window.location.search)
  return params.get('window') || 'mainManager'
}

const viewMap = { quickLaunch: QuickLaunch, mainManager: MainManager }
const currentView = computed(() => viewMap[getWindowType()] || MainManager)
</script>

<style>
@import './styles/variables.css';
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}
</style>
