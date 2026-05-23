<template>
  <div class="snippet-list">
    <div
      v-for="snippet in snippets"
      :key="snippet.id"
      class="snippet-item"
      :class="{ active: selectedId === snippet.id }"
      @click="$emit('select', snippet.id)"
    >
      <div class="snippet-title">{{ snippet.title }}</div>
      <div class="snippet-meta">{{ snippet.language }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({ snippets: Array, selectedId: Number })
defineEmits(['select'])
</script>

<style scoped>
.snippet-list { overflow-y: auto; }
.snippet-item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s ease;
}
.snippet-item:hover { background: var(--bg-tertiary); }
.snippet-item.active {
  background: var(--selection-bg);
  border-left: 2px solid var(--accent-blue);
}
.snippet-title { color: var(--text-primary); font-size: 13px; margin-bottom: 3px; }
.snippet-meta { color: var(--text-secondary); font-size: 11px; }
</style>
