<template>
  <div class="activity-bar">
    <button
      v-for="item in items"
      :key="item.key"
      class="activity-item"
      :class="{ active: modelValue === item.key }"
      :title="item.label"
      @click="$emit('update:modelValue', item.key)"
    >
      <AppIcon :name="item.icon" :size="18" />
    </button>
  </div>
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
</script>

<style scoped>
.activity-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 0.5px solid var(--border-subtle);
}

.activity-item {
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
  transition: all 0.15s ease;
}

.activity-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.activity-item.active {
  background: var(--accent-blue-bg);
  color: var(--accent-blue);
}
</style>
