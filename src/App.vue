<template>
  <component :is="currentView" />
</template>

<script setup>
import { computed } from 'vue'
import QuickLaunch from './views/QuickLaunch.vue'
import MainManager from './views/MainManager.vue'

const viewMap = { quickLaunch: QuickLaunch, mainManager: MainManager }
const currentView = computed(() => viewMap[window.electronAPI?.windowType] || MainManager)
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
