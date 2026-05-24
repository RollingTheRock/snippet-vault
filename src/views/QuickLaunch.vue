<template>
  <div class="quick-launch" @keydown="handleKeydown">
    <div class="search-box">
      <div class="search-icon-wrap">
        <AppIcon name="search" :size="17" />
      </div>
      <input
        ref="searchInput"
        v-model="query"
        @input="handleInput"
        class="search-input"
        placeholder="搜索片段... 支持 #标签筛选"
        spellcheck="false"
      />
      <div class="shortcut-hint">
        <kbd>Alt</kbd><kbd>Space</kbd>
      </div>
    </div>

    <TransitionGroup name="list" tag="div" class="results" v-if="results.length > 0">
      <div
        v-for="(snippet, index) in results"
        :key="snippet.id"
        class="result-item"
        :class="{ selected: selectedIndex === index }"
        :style="{ transitionDelay: `${index * 15}ms` }"
        @mouseenter="selectedIndex = index"
        @click="handleCopy"
      >
        <div class="result-glow" :style="{ background: getLangColor(snippet.language) }" />
        <div class="result-body">
          <div class="result-header">
            <span class="result-title">{{ snippet.title }}</span>
            <span class="result-meta">
              <span class="result-lang">{{ snippet.language }}</span>
              <span v-if="snippet.copy_count > 0" class="result-usage">
                <AppIcon name="zap" :size="10" />
                {{ snippet.copy_count }}
              </span>
            </span>
          </div>
          <div class="result-preview">{{ snippet.content.substring(0, 80) }}...</div>
        </div>
        <div class="result-action" v-if="selectedIndex === index">
          <AppIcon name="enter" :size="13" />
        </div>
      </div>
    </TransitionGroup>

    <Transition name="fade-slide">
      <div class="no-results" v-if="query.trim() && results.length === 0">
        <div class="no-results-icon">
          <AppIcon name="search" :size="26" />
        </div>
        <p>未找到匹配的片段</p>
        <span class="no-results-hint">尝试其他关键词或标签</span>
      </div>
    </Transition>

    <div class="footer">
      <div class="footer-shortcuts">
        <span class="shortcut-group">
          <kbd>Enter</kbd>
          <span>复制</span>
        </span>
        <span class="shortcut-divider" />
        <span class="shortcut-group">
          <kbd>Ctrl</kbd><kbd>Enter</kbd>
          <span>预览</span>
        </span>
        <span class="shortcut-divider" />
        <span class="shortcut-group">
          <kbd>Esc</kbd>
          <span>关闭</span>
        </span>
      </div>
      <span class="open-manager" @click="openManager">
        <AppIcon name="layout" :size="12" />
        管理
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { api } from '../api/index.js'

const query = ref('')
const results = ref([])
const selectedIndex = ref(0)
const searchInput = ref(null)

let debounceTimer = null

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

async function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (!query.value.trim()) {
      results.value = []
      return
    }
    results.value = await api.searchSnippets(query.value)
    selectedIndex.value = 0
  }, 120)
}

async function handleCopy() {
  const snippet = results.value[selectedIndex.value]
  if (!snippet) return
  await api.copySnippet(snippet.content, snippet.id)
}

function handlePreview() {
  const snippet = results.value[selectedIndex.value]
  if (!snippet) return
  api.openPreview(snippet.content, snippet.language)
}

function openManager() {
  api.showMainManager()
}

function handleKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      handlePreview()
    } else {
      handleCopy()
    }
  } else if (e.key === 'Escape') {
    window.close()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
    e.preventDefault()
    openManager()
  }
}

onMounted(() => {
  searchInput.value?.focus()
})
</script>

<style scoped>
.quick-launch {
  width: 560px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border-radius: var(--radius-xl);
  border: 0.5px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.1),
    0 0 0 0.5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;
  animation: float-up 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes float-up {
  0% { opacity: 0; transform: translateY(10px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.search-box {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  box-shadow: var(--inset-divider-bottom);
  gap: 12px;
}
.search-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  box-shadow: var(--inset-sunken);
  color: var(--text-tertiary);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
  font-weight: 500;
  letter-spacing: -0.2px;
}
.search-input::placeholder {
  color: var(--text-tertiary);
  font-weight: 400;
}
.shortcut-hint {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}
.shortcut-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  border: 0.5px solid var(--border-subtle);
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-tertiary);
  box-shadow: 0 1px 0 var(--border-color), var(--highlight-top);
}

.results {
  max-height: 320px;
  overflow-y: auto;
}
.result-item {
  display: flex;
  align-items: stretch;
  cursor: pointer;
  box-shadow: var(--inset-divider-bottom);
  transition: background 0.12s ease;
  position: relative;
}
.result-item:last-child { box-shadow: none; }
.result-item:hover,
.result-item.selected { background: var(--selection-bg); }
.result-glow {
  width: 3px;
  flex-shrink: 0;
  border-radius: 3px;
  margin: 6px 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.result-item:hover .result-glow,
.result-item.selected .result-glow { opacity: 1; }
.result-body {
  flex: 1;
  padding: 10px 12px 10px 10px;
  min-width: 0;
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 10px;
}
.result-title {
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.result-lang {
  font-size: 10px;
  color: var(--accent-blue);
  background: var(--accent-blue-bg);
  padding: 1px 6px;
  border-radius: 20px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.result-usage {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 500;
}
.result-preview {
  color: var(--text-secondary);
  font-size: 11.5px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-action {
  display: flex;
  align-items: center;
  padding-right: 14px;
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity 0.15s ease;
}
.result-item.selected .result-action { opacity: 1; }

.no-results {
  padding: 32px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.no-results-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  box-shadow: var(--inset-sunken);
  color: var(--text-tertiary);
}
.no-results p {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-secondary);
}
.no-results-hint {
  font-size: 11.5px;
  color: var(--text-tertiary);
}

.footer {
  padding: 9px 18px;
  background: linear-gradient(180deg, rgba(245, 245, 247, 0.8) 0%, rgba(236, 236, 238, 0.7) 100%);
  box-shadow: var(--inset-divider-top);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(8px);
}
.footer-shortcuts {
  display: flex;
  align-items: center;
  gap: 8px;
}
.shortcut-group {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary);
  font-size: 10.5px;
}
.shortcut-group kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: linear-gradient(180deg, #fff 0%, #f5f5f7 100%);
  border: 0.5px solid var(--border-color);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--text-secondary);
  box-shadow: 0 1px 0 var(--border-strong), var(--highlight-top);
}
.shortcut-divider {
  width: 1px;
  height: 12px;
  background: var(--border-color);
}
.open-manager {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--accent-blue);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.12s ease;
}
.open-manager:hover { opacity: 0.7; }

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
  transform: translateX(-5px);
}
.list-move {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
