<template>
  <nav class="activity-bar" aria-label="模块导航">
    <div class="activity-top">
      <button
        v-for="item in items"
        :key="item.key"
        class="activity-item"
        :class="{ active: modelValue === item.key }"
        :title="item.label"
        @click="$emit('update:modelValue', item.key)"
      >
        <AppIcon :name="item.icon" :size="20" />
        <span class="activity-indicator" />
      </button>
    </div>

    <div class="activity-bottom">
      <button
        class="activity-item"
        title="命令面板"
        @click="openCommandPalette"
      >
        <AppIcon name="command" :size="18" />
      </button>
    </div>
  </nav>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  modelValue: { type: String, default: 'snippets' }
})

defineEmits(['update:modelValue'])

const items = [
  { key: 'snippets', label: '代码片段', icon: 'code' },
  { key: 'notes', label: '笔记', icon: 'file-text' },
  { key: 'http', label: 'API 测试', icon: 'zap' }
]

function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('app:command-palette'))
}
</script>

<style scoped>
.activity-bar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 48px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #f0f0f2 0%, #e8e8ec 100%);
  box-shadow: inset -0.5px 0 0 var(--border-subtle);
  padding: 8px 0 12px;
  z-index: 30;
}

[data-theme="dark"] .activity-bar {
  background: linear-gradient(180deg, #1c1c1e 0%, #161618 100%);
  box-shadow: inset -0.5px 0 0 rgba(255,255,255,0.06);
}

.activity-top,
.activity-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.activity-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.25, 1, 0.5, 1);
}

.activity-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-secondary);
}

[data-theme="dark"] .activity-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.activity-item.active {
  color: var(--accent-blue);
}

.activity-indicator {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--accent-blue);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.activity-item.active .activity-indicator {
  transform: translateY(-50%) scaleY(1);
}
</style>
