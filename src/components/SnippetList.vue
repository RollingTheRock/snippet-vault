<template>
  <div class="snippet-list">
    <TransitionGroup name="list" tag="div" class="list-container">
      <div
        v-for="(snippet, index) in snippets"
        :key="snippet.id"
        class="snippet-item"
        :class="{ active: selectedId === snippet.id }"
        :style="{ transitionDelay: `${Math.min(index * 20, 250)}ms` }"
        @click="$emit('select', snippet.id)"
      >
        <div class="snippet-indicator" :style="{ background: getLangColor(snippet.language) }" />
        <div class="snippet-body">
          <div class="snippet-title-row">
            <span class="snippet-title">{{ snippet.title }}</span>
            <span v-if="snippet.copy_count > 0" class="snippet-usage">
              <AppIcon name="zap" :size="9" />
            </span>
          </div>
          <div class="snippet-meta">
            <span class="snippet-lang">{{ snippet.language }}</span>
            <span v-if="snippet.updated_at" class="snippet-time">{{ formatTime(snippet.updated_at) }}</span>
            <span v-if="snippet.tags?.length" class="snippet-tags">
              <span
                v-for="tag in snippet.tags.slice(0, 2)"
                :key="tag.id"
                class="snippet-tag-dot"
                :style="{ background: tag.color }"
              />
              <span v-if="snippet.tags.length > 2" class="snippet-tag-more">+{{ snippet.tags.length - 2 }}</span>
            </span>
          </div>
        </div>
      </div>
    </TransitionGroup>
    <Transition name="fade-slide">
      <div v-if="snippets.length === 0" class="list-empty">
        <div class="list-empty-icon">
          <AppIcon name="search" :size="18" />
        </div>
        <span>暂无片段</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({ snippets: Array, selectedId: Number })
defineEmits(['select'])

function formatTime(ts) {
  const diff = Date.now() - ts
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  if (diff < min) return '刚刚'
  if (diff < hour) return Math.floor(diff / min) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function getLangColor(lang) {
  const colors = {
    javascript: 'var(--lang-js)',
    typescript: 'var(--lang-ts)',
    html: 'var(--lang-html)',
    css: 'var(--lang-css)',
    vue: 'var(--lang-vue)',
    python: 'var(--lang-python)',
    java: 'var(--lang-java)',
    go: 'var(--lang-go)',
    rust: 'var(--lang-rust)',
    cpp: 'var(--lang-cpp)',
    csharp: 'var(--lang-csharp)',
    sql: 'var(--lang-sql)',
    shell: 'var(--lang-shell)',
    ruby: 'var(--lang-ruby)',
    json: 'var(--lang-json)'
  }
  return colors[lang] || 'var(--text-tertiary)'
}
</script>

<style scoped>
.snippet-list {
  overflow-y: auto;
  flex: 1;
  padding: 2px 0;
}
.list-container {
  position: relative;
}
.snippet-item {
  display: flex;
  align-items: stretch;
  cursor: pointer;
  margin: 0 6px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease, transform 0.12s ease;
}
.snippet-item:hover {
  background: rgba(0, 0, 0, 0.025);
  transform: translateX(1px);
}
.snippet-item.active {
  background: var(--selection-bg);
}
.snippet-indicator {
  width: 2.5px;
  flex-shrink: 0;
  border-radius: 3px;
  margin: 6px 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.snippet-item:hover .snippet-indicator,
.snippet-item.active .snippet-indicator {
  opacity: 1;
}
.snippet-body {
  flex: 1;
  padding: 8px 10px;
  min-width: 0;
}
.snippet-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
}
.snippet-title {
  color: var(--text-primary);
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.12px;
}
.snippet-usage {
  color: var(--text-tertiary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.snippet-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
.snippet-time {
  color: var(--text-tertiary);
  font-size: 9.5px;
  font-weight: 500;
}
.snippet-lang {
  color: var(--text-tertiary);
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.snippet-tags {
  display: flex;
  align-items: center;
  gap: 2.5px;
}
.snippet-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.snippet-tag-more {
  font-size: 9px;
  color: var(--text-tertiary);
  margin-left: 1px;
  font-weight: 500;
}

.list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 32px 16px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
}
.list-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  box-shadow: var(--inset-sunken);
  color: var(--text-tertiary);
}

.list-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-leave-active {
  transition: all 0.18s cubic-bezier(0.25, 1, 0.5, 1);
  position: absolute;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
.list-move {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-leave-active {
  transition: all 0.18s cubic-bezier(0.25, 1, 0.5, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
