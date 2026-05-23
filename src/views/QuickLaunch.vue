<template>
  <div class="quick-launch" @keydown="handleKeydown">
    <!-- Search Input -->
    <div class="search-box">
      <span class="search-icon">S</span>
      <input
        ref="searchInput"
        v-model="query"
        @input="handleInput"
        class="search-input"
        placeholder="搜索片段... 支持 #标签筛选"
        spellcheck="false"
      />
      <span class="shortcut-hint">Alt+Space</span>
    </div>

    <!-- Results -->
    <div class="results" v-if="results.length > 0">
      <div
        v-for="(snippet, index) in results"
        :key="snippet.id"
        class="result-item"
        :class="{ selected: selectedIndex === index }"
        @mouseenter="selectedIndex = index"
        @click="handleCopy"
      >
        <div class="result-header">
          <span class="result-title">{{ snippet.title }}</span>
          <span class="result-lang">{{ snippet.language }}</span>
        </div>
        <div class="result-preview">{{ snippet.content.substring(0, 80) }}...</div>
      </div>
    </div>

    <div class="no-results" v-else-if="query.trim()">
      未找到匹配的片段
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>Enter 复制 · Ctrl+Enter 预览 · Esc 关闭</span>
      <span class="open-manager" @click="openManager">Ctrl+M 管理窗口</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const query = ref('')
const results = ref([])
const selectedIndex = ref(0)
const searchInput = ref(null)

let debounceTimer = null

async function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (!query.value.trim()) {
      results.value = []
      return
    }
    results.value = await window.electronAPI.searchSnippets(query.value)
    selectedIndex.value = 0
  }, 150)
}

async function handleCopy() {
  const snippet = results.value[selectedIndex.value]
  if (!snippet) return
  await window.electronAPI.copySnippet(snippet.content)
}

function handlePreview() {
  const snippet = results.value[selectedIndex.value]
  if (!snippet) return
  window.electronAPI.openPreview(snippet.content, snippet.language)
}

function openManager() {
  window.electronAPI.showMainManager()
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
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  overflow: hidden;
}
.search-box {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  gap: 12px;
}
.search-icon { color: var(--text-secondary); font-size: 14px; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 16px;
  font-family: inherit;
}
.shortcut-hint {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 4px;
}
.results { max-height: 300px; overflow-y: auto; }
.result-item {
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px solid #2d2d2d;
}
.result-item:hover, .result-item.selected { background: var(--selection-bg); }
.result-item.selected { border-left: 3px solid var(--accent-blue); }
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.result-title { color: #fff; font-size: 14px; font-weight: 500; }
.result-lang {
  font-size: 11px;
  color: var(--accent-blue);
  background: rgba(74,158,255,0.1);
  padding: 1px 8px;
  border-radius: 4px;
}
.result-preview {
  color: var(--text-secondary);
  font-size: 12px;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.no-results {
  padding: 30px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}
.footer {
  padding: 8px 18px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
}
.open-manager { color: var(--accent-blue); cursor: pointer; }
.open-manager:hover { text-decoration: underline; }
</style>
