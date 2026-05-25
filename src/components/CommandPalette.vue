<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="visible" class="palette-overlay" @click="close">
        <div class="palette-panel" @click.stop>
          <div class="palette-input-wrap">
            <AppIcon name="search" :size="15" class="palette-search-icon" />
            <input
              ref="inputRef"
              v-model="query"
              class="palette-input"
              placeholder="搜索命令、片段、笔记..."
              @keydown.up.prevent="moveHighlight(-1)"
              @keydown.down.prevent="moveHighlight(1)"
              @keydown.enter.prevent="executeHighlighted"
              @keydown.esc.prevent="close"
            />
            <kbd class="palette-esc">ESC</kbd>
          </div>

          <div class="palette-results" ref="resultsRef">
            <div v-if="!filteredItems.length" class="palette-empty">
              未找到匹配结果
            </div>

            <template v-for="(group, gi) in filteredGroups" :key="group.label">
              <div v-if="group.items.length" class="palette-group">
                <div class="palette-group-label">{{ group.label }}</div>
                <div
                  v-for="(item, ii) in group.items"
                  :key="item.id"
                  class="palette-item"
                  :class="{ active: globalIndex(gi, ii) === highlightedIndex }"
                  @mouseenter="highlightedIndex = globalIndex(gi, ii)"
                  @click="executeItem(item)"
                >
                  <AppIcon :name="item.icon" :size="14" class="palette-item-icon" />
                  <span class="palette-item-title">{{ item.title }}</span>
                  <span v-if="item.subtitle" class="palette-item-sub">{{ item.subtitle }}</span>
                  <kbd v-if="item.shortcut" class="palette-item-shortcut">{{ item.shortcut }}</kbd>
                </div>
              </div>
            </template>
          </div>

          <div class="palette-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> 导航</span>
            <span><kbd>↵</kbd> 执行</span>
            <span><kbd>esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  snippets: { type: Array, default: () => [] },
  notes: { type: Array, default: () => [] },
  activeModule: { type: String, default: 'snippets' }
})

const emit = defineEmits([
  'selectSnippet', 'selectNote', 'switchModule',
  'newSnippet', 'newNote', 'resetHttp',
  'toggleTheme', 'exportData', 'importData',
  'preview', 'copy', 'close'
])

const visible = ref(false)
const query = ref('')
const highlightedIndex = ref(0)
const inputRef = ref(null)
const resultsRef = ref(null)

// Static commands
const staticCommands = computed(() => [
  { id: 'cmd-new-snippet', group: 'command', icon: 'plus', title: '新建片段', subtitle: '创建一个新的代码片段', action: () => emit('newSnippet') },
  { id: 'cmd-new-note', group: 'command', icon: 'plus', title: '新建笔记', subtitle: '创建一个新的 Markdown 笔记', action: () => emit('newNote') },
  { id: 'cmd-reset-http', group: 'command', icon: 'zap', title: '重置 HTTP 请求', subtitle: '清空当前请求配置', action: () => emit('resetHttp') },
  { id: 'cmd-theme', group: 'command', icon: 'sun', title: '切换主题', subtitle: '在浅色/深色模式间切换', action: () => emit('toggleTheme') },
  { id: 'cmd-export', group: 'command', icon: 'download', title: '导出数据', subtitle: '导出所有片段为 JSON', action: () => emit('exportData') },
  { id: 'cmd-import', group: 'command', icon: 'upload', title: '导入数据', subtitle: '从 JSON 文件导入片段', action: () => emit('importData') },
  { id: 'cmd-preview', group: 'command', icon: 'eye', title: '预览当前片段', subtitle: '在新窗口中预览片段内容', action: () => emit('preview') },
  { id: 'cmd-copy', group: 'command', icon: 'copy', title: '复制片段内容', subtitle: '将当前片段复制到剪贴板', action: () => emit('copy') },
  { id: 'mod-snippets', group: 'module', icon: 'code', title: '切换到代码片段', subtitle: '查看和管理代码片段', action: () => emit('switchModule', 'snippets') },
  { id: 'mod-notes', group: 'module', icon: 'file-text', title: '切换到笔记', subtitle: '查看和管理笔记', action: () => emit('switchModule', 'notes') },
  { id: 'mod-http', group: 'module', icon: 'zap', title: '切换到 API 测试', subtitle: '发送 HTTP 请求', action: () => emit('switchModule', 'http') }
])

const dynamicItems = computed(() => {
  const items = []
  props.snippets.forEach(s => {
    items.push({
      id: `snippet-${s.id}`,
      group: 'snippet',
      icon: 'code',
      title: s.title || '未命名片段',
      subtitle: `${s.language} · ${s.content.substring(0, 40).replace(/\n/g, ' ')}`,
      action: () => emit('selectSnippet', s.id)
    })
  })
  props.notes.forEach(n => {
    items.push({
      id: `note-${n.id}`,
      group: 'note',
      icon: 'file-text',
      title: n.title || '未命名笔记',
      subtitle: n.content.substring(0, 40).replace(/\n/g, ' '),
      action: () => emit('selectNote', n.id)
    })
  })
  return items
})

const allItems = computed(() => [...staticCommands.value, ...dynamicItems.value])

function normalize(str) {
  return (str || '').toLowerCase().replace(/\s+/g, '')
}

const filteredItems = computed(() => {
  const q = normalize(query.value)
  if (!q) return allItems.value
  return allItems.value.filter(item => {
    const t = normalize(item.title)
    const s = normalize(item.subtitle)
    return t.includes(q) || s.includes(q)
  })
})

const filteredGroups = computed(() => {
  const order = ['command', 'module', 'snippet', 'note']
  const groups = {}
  order.forEach(k => { groups[k] = [] })
  filteredItems.value.forEach(item => {
    if (groups[item.group]) groups[item.group].push(item)
  })
  const labels = { command: '命令', module: '模块', snippet: '片段', note: '笔记' }
  return order
    .map(key => ({ key, label: labels[key], items: groups[key] }))
    .filter(g => g.items.length)
})

function globalIndex(gi, ii) {
  let idx = 0
  for (let i = 0; i < gi; i++) {
    idx += filteredGroups.value[i].items.length
  }
  return idx + ii
}

function moveHighlight(delta) {
  const total = filteredItems.value.length
  if (!total) return
  highlightedIndex.value = (highlightedIndex.value + delta + total) % total
  scrollToHighlighted()
}

function scrollToHighlighted() {
  nextTick(() => {
    const el = resultsRef.value?.querySelector('.palette-item.active')
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function executeHighlighted() {
  const item = filteredItems.value[highlightedIndex.value]
  if (item) executeItem(item)
}

function executeItem(item) {
  item.action()
  close()
}

function open() {
  visible.value = true
  query.value = ''
  highlightedIndex.value = 0
  nextTick(() => inputRef.value?.focus())
}

function close() {
  visible.value = false
  emit('close')
}

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    visible.value ? close() : open()
  }
}

onMounted(() => {
  window.addEventListener('app:command-palette', open)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('app:command-palette', open)
  window.removeEventListener('keydown', handleKeydown)
})

watch(query, () => { highlightedIndex.value = 0 })

defineExpose({ open, close })
</script>

<style scoped>
.palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.palette-panel {
  width: 100%;
  max-width: 560px;
  background: linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
  border-radius: var(--radius-lg);
  border: 0.5px solid var(--border-subtle);
  box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 60vh;
}

[data-theme="dark"] .palette-panel {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
}

.palette-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  box-shadow: var(--inset-divider-bottom);
  flex-shrink: 0;
}

.palette-search-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.palette-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
}

.palette-input::placeholder {
  color: var(--text-tertiary);
}

.palette-esc {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  border: 0.5px solid var(--border-subtle);
  font-family: 'SF Mono', monospace;
  flex-shrink: 0;
}

.palette-results {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.palette-group-label {
  padding: 6px 10px 4px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.1s ease;
}

.palette-item:hover,
.palette-item.active {
  background: var(--accent-blue-bg);
}

.palette-item-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.palette-item.active .palette-item-icon {
  color: var(--accent-blue);
}

.palette-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.palette-item-sub {
  flex: 1;
  font-size: 11.5px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 4px;
}

.palette-item-shortcut {
  font-size: 10px;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 1px 5px;
  border-radius: 4px;
  border: 0.5px solid var(--border-subtle);
  font-family: 'SF Mono', monospace;
  flex-shrink: 0;
}

.palette-empty {
  padding: 30px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

.palette-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 14px;
  box-shadow: var(--inset-divider-top);
  font-size: 11px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.palette-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.palette-footer kbd {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 1px 5px;
  border-radius: 4px;
  border: 0.5px solid var(--border-subtle);
  font-family: 'SF Mono', monospace;
}

/* Transitions */
.palette-enter-active {
  transition: opacity 0.15s ease;
}
.palette-leave-active {
  transition: opacity 0.1s ease;
}
.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}
.palette-enter-active .palette-panel {
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease;
}
.palette-leave-active .palette-panel {
  transition: transform 0.1s ease, opacity 0.1s ease;
}
.palette-enter-from .palette-panel {
  transform: scale(0.96) translateY(-8px);
  opacity: 0;
}
.palette-leave-to .palette-panel {
  transform: scale(0.98);
  opacity: 0;
}
</style>
