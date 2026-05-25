<template>
  <div class="main-manager" tabindex="-1" @keydown="handleManagerKeydown">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="brand">
        <div class="brand-icon">
          <AppIcon name="layout" :size="17" />
        </div>
        <span>SnippetVault</span>
      </div>
      <div class="toolbar-actions">
        <button ref="btnNew" class="btn btn-primary" @click="handleNew" :style="{ transform: `translate(${magNew.offsetX.value}px, ${magNew.offsetY.value}px)` }">
          <AppIcon name="plus" :size="13" />
          <span>新建</span>
        </button>
        <button ref="btnSave" class="btn btn-secondary" @click="handleSave" :disabled="!hasChanges" :style="{ transform: `translate(${magSave.offsetX.value}px, ${magSave.offsetY.value}px)` }">
          <AppIcon name="save" :size="13" />
          <span>保存</span>
        </button>
        <button ref="btnDelete" class="btn btn-secondary btn-danger" @click="handleDelete" :disabled="!selectedId" :style="{ transform: `translate(${magDelete.offsetX.value}px, ${magDelete.offsetY.value}px)` }">
          <AppIcon name="trash" :size="13" />
          <span>删除</span>
        </button>
        <div class="toolbar-divider" />
        <button ref="btnExport" class="btn btn-ghost" @click="handleExport">
          <AppIcon name="download" :size="13" />
        </button>
        <button ref="btnImport" class="btn btn-ghost" @click="handleImport">
          <AppIcon name="upload" :size="13" />
        </button>
        <div class="toolbar-divider" />
        <button class="btn btn-ghost theme-toggle" @click="toggleTheme" :title="isDark ? '切换浅色' : '切换深色'">
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="14" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Sidebar -->
      <div class="sidebar">
        <ActivityBar v-model="activeModule" />
        <div v-if="activeModule === 'snippets'" class="module-panel">
        <div class="search-wrapper">
          <AppIcon name="search" :size="14" class="search-icon" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            class="search-input"
            placeholder="搜索片段、#标签..."
          />
        </div>

        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="filter-tab"
            :class="{ active: snippetStore.filterMode === tab.key }"
            @click="setFilter(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tag-cloud" v-if="tagStore.tags.length > 0">
          <div class="tag-cloud-label">
            <AppIcon name="tag" :size="11" />
            <span>标签筛选</span>
          </div>
          <div class="tag-cloud-items">
            <span
              v-for="tag in tagStore.tags"
              :key="tag.id"
              class="tag-cloud-item"
              :class="{ active: snippetStore.filterTagId === tag.id }"
              :style="{
                background: snippetStore.filterTagId === tag.id ? tag.color + '16' : tag.color + '0a',
                color: tag.color,
                borderColor: snippetStore.filterTagId === tag.id ? tag.color + '30' : 'transparent'
              }"
              @click="toggleTagFilter(tag.id)"
            >
              <span class="tag-dot" :style="{ background: tag.color }" />
              {{ tag.name }}
            </span>
          </div>
        </div>

        <div class="list-header">
          <span class="list-count">{{ snippetStore.snippets.length }} 个片段</span>
        </div>
        <SnippetList
          :snippets="snippetStore.snippets"
          :selectedId="snippetStore.selectedId"
          @select="snippetStore.selectedId = $event"
        />
        </div>
        <div v-else-if="activeModule === 'notes'" class="module-panel">
          <div class="module-placeholder">
            <div class="placeholder-icon"><AppIcon name="file-text" :size="32" /></div>
            <h4>笔记模块</h4>
            <p>Markdown 笔记管理开发中</p>
          </div>
        </div>
        <div v-else-if="activeModule === 'http'" class="module-panel">
          <div class="module-placeholder">
            <div class="placeholder-icon"><AppIcon name="zap" :size="32" /></div>
            <h4>API 测试模块</h4>
            <p>HTTP Client 开发中</p>
          </div>
        </div>
      </div>

      <!-- Editor -->
      <Transition name="fade-slide" mode="out-in">
        <div class="editor-area" v-if="selectedSnippet" key="editor" ref="editorAreaRef">
          <!-- Glow cursor -->
          <div class="glow-cursor" :style="{
            left: `${editorGlow.x.value}px`,
            top: `${editorGlow.y.value}px`,
            opacity: editorGlow.visible.value ? 1 : 0
          }" />
          <input
            v-model="editForm.title"
            class="title-input"
            placeholder="片段标题"
          />
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <div class="lang-select-wrapper">
                <AppIcon name="code" :size="12" />
                <select v-model="editForm.language" class="lang-select">
                  <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                    {{ lang.label }}
                  </option>
                </select>
              </div>
              <TagInput v-model="currentTags" />
            </div>

            <!-- Markdown Mode Switcher -->
            <div class="md-mode-switcher" v-if="editForm.language === 'markdown'">
              <button
                class="mode-btn"
                :class="{ active: mdMode === 'code' }"
                @click="mdMode = 'code'"
              >
                <AppIcon name="code" :size="12" />
                源码
              </button>
              <button
                class="mode-btn"
                :class="{ active: mdMode === 'split' }"
                @click="mdMode = 'split'"
              >
                <AppIcon name="layout" :size="12" />
                分屏
              </button>
              <button
                class="mode-btn"
                :class="{ active: mdMode === 'preview' }"
                @click="mdMode = 'preview'"
              >
                <AppIcon name="eye" :size="12" />
                预览
              </button>
            </div>
          </div>

          <!-- Editor Body: adapts based on markdown mode -->
          <div class="editor-body" :class="{ split: editForm.language === 'markdown' && mdMode === 'split' }">
            <CodeEditor
              v-show="editForm.language !== 'markdown' || mdMode !== 'preview'"
              v-model="editForm.content"
              :language="editForm.language"
              :isDark="isDark"
              placeholder="输入代码..."
              :class="{ 'md-full': editForm.language === 'markdown' && mdMode === 'code', 'md-half': editForm.language === 'markdown' && mdMode === 'split' }"
            />
            <MarkdownPreview
              v-if="editForm.language === 'markdown' && mdMode !== 'code'"
              :content="editForm.content"
              :isDark="isDark"
              :class="{ 'md-full': mdMode === 'preview', 'md-half': mdMode === 'split' }"
            />
          </div>

          <div class="editor-actions">
            <button ref="btnPreview" class="btn btn-primary" @click="handlePreview">
              <AppIcon name="eye" :size="13" />
              <span>预览</span>
            </button>
            <button ref="btnCopy" class="btn btn-secondary" @click="handleCopy">
              <AppIcon name="copy" :size="13" />
              <span>复制</span>
            </button>
          </div>
        </div>

        <div class="empty-state" v-else key="empty" ref="emptyStateRef">
          <!-- Glow cursor -->
          <div class="glow-cursor" :style="{
            left: `${emptyGlow.x.value}px`,
            top: `${emptyGlow.y.value}px`,
            opacity: emptyGlow.visible.value ? 1 : 0
          }" />
          <div class="empty-art">
            <div class="art-window">
              <div class="art-window-header">
                <span class="art-dot red" />
                <span class="art-dot yellow" />
                <span class="art-dot green" />
              </div>
              <div class="art-window-body">
                <div class="art-line" /><div class="art-line short" />
                <div class="art-line" /><div class="art-line short" />
                <div class="art-line" /><div class="art-line short" />
                <div class="art-bracket" />
              </div>
            </div>
            <div class="art-floating art-float-1">
              <AppIcon name="code" :size="16" />
            </div>
            <div class="art-floating art-float-2">
              <AppIcon name="tag" :size="14" />
            </div>
            <div class="art-floating art-float-3">
              <AppIcon name="zap" :size="12" />
            </div>
          </div>
          <h3>选择一个片段或创建新片段</h3>
          <p>使用左侧浏览已有片段，或点击上方「新建」开始</p>
          <div class="empty-shortcut">
            <kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>Space</kbd>
            <span>快速启动</span>
          </div>
        </div>
      </Transition>
    </div>
    <!-- Web Preview Overlay -->
    <Transition name="fade-slide">
      <div class="preview-overlay" v-if="previewVisible" @click="closePreview">
        <div class="preview-panel" @click.stop>
          <div class="preview-header">
            <div class="preview-title">
              <AppIcon name="eye" :size="14" />
              <span>预览</span>
            </div>
            <button class="preview-close" @click="closePreview">
              <AppIcon name="x" :size="14" />
            </button>
          </div>
          <div class="preview-body">
            <MarkdownPreview :content="previewContent" :isDark="isDark" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useSnippetStore } from '../stores/snippets.js'
import { useTagStore } from '../stores/tags.js'
import { useTheme } from '../composables/useTheme.js'
import SnippetList from '../components/SnippetList.vue'
import CodeEditor from '../components/CodeEditor.vue'
import TagInput from '../components/TagInput.vue'
import MarkdownPreview from '../components/MarkdownPreview.vue'
import AppIcon from '../components/AppIcon.vue'
import { useToast } from '../composables/useToast.js'
import { useRipple } from '../composables/useRipple.js'
import { useGlowCursor } from '../composables/useGlowCursor.js'
import { useMagnetic } from '../composables/useMagnetic.js'
import { api } from '../api/index.js'
import ActivityBar from '../components/ActivityBar.vue'

const snippetStore = useSnippetStore()
const tagStore = useTagStore()
const activeModule = ref('snippets') // 'snippets' | 'notes' | 'http'
const { success, error: showError } = useToast()
const { isDark, toggle: toggleTheme } = useTheme()

const searchQuery = ref('')
const editForm = reactive({ title: '', content: '', language: 'javascript' })
const currentTags = ref([])
const mdMode = ref('split') // 'code' | 'split' | 'preview'

// Web preview overlay
const previewVisible = ref(false)
const previewContent = ref('')
const previewLanguage = ref('text')

function openPreviewOverlay(content, language) {
  previewContent.value = content
  previewLanguage.value = language
  previewVisible.value = true
}

function closePreview() {
  previewVisible.value = false
}

// Listen for web preview events
onMounted(() => {
  window.addEventListener('snippet:preview', (e) => {
    openPreviewOverlay(e.detail.content, e.detail.language)
  })
})

const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'recent', label: '最近' },
  { key: 'frequent', label: '常用' }
]

const btnNew = ref(null)
const btnSave = ref(null)
const btnDelete = ref(null)
const btnExport = ref(null)
const btnImport = ref(null)
const btnPreview = ref(null)
const btnCopy = ref(null)
const editorAreaRef = ref(null)
const emptyStateRef = ref(null)

useRipple(btnNew)
useRipple(btnSave)
useRipple(btnDelete)
useRipple(btnExport)
useRipple(btnImport)
useRipple(btnPreview)
useRipple(btnCopy)

// Glow cursor for editor and empty state
const editorGlow = useGlowCursor(editorAreaRef)
const emptyGlow = useGlowCursor(emptyStateRef)

// Magnetic buttons
const magNew = useMagnetic(btnNew, { strength: 0.25, radius: 80 })
const magSave = useMagnetic(btnSave, { strength: 0.25, radius: 80 })
const magDelete = useMagnetic(btnDelete, { strength: 0.25, radius: 80 })

const languages = [
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'vue', label: 'Vue' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' }
]

const selectedId = computed(() => snippetStore.selectedId)
const selectedSnippet = computed(() => snippetStore.selectedSnippet)
const hasChanges = computed(() => {
  if (!selectedSnippet.value) return false
  const tagsChanged = JSON.stringify((selectedSnippet.value.tags || []).map(t => t.id).sort()) !==
    JSON.stringify(currentTags.value.map(t => t.id).sort())
  return editForm.title !== selectedSnippet.value.title ||
    editForm.content !== selectedSnippet.value.content ||
    editForm.language !== selectedSnippet.value.language ||
    tagsChanged
})

watch(selectedSnippet, async (snippet) => {
  if (snippet) {
    editForm.title = snippet.title
    editForm.content = snippet.content
    editForm.language = snippet.language
    currentTags.value = snippet.tags || []
    // Reset markdown mode when switching snippets
    if (snippet.language !== 'markdown') {
      mdMode.value = 'split'
    }
  }
}, { immediate: true })

async function handleSearch() {
  await snippetStore.searchSnippets(searchQuery.value)
}

async function setFilter(mode) {
  if (mode === 'all') await snippetStore.loadSnippets()
  else if (mode === 'recent') await snippetStore.loadRecent()
  else if (mode === 'frequent') await snippetStore.loadFrequent()
}

async function toggleTagFilter(tagId) {
  if (snippetStore.filterTagId === tagId) {
    await snippetStore.loadSnippets()
  } else {
    await snippetStore.loadByTag(tagId)
  }
}

async function handleNew() {
  await snippetStore.createSnippet({
    title: '未命名片段',
    content: '',
    language: 'javascript'
  })
  success('新片段已创建')
}

async function handleSave() {
  if (!selectedId.value) return
  try {
    await snippetStore.updateSnippet(selectedId.value, {
      title: editForm.title,
      content: editForm.content,
      language: editForm.language
    })
    await api.setSnippetTags(selectedId.value, currentTags.value.map(t => t.id))
    await snippetStore.loadSnippets()
    success('保存成功')
  } catch (e) {
    showError('保存失败')
  }
}

async function handleDelete() {
  if (!selectedId.value) return
  try {
    await snippetStore.deleteSnippet(selectedId.value)
    success('已删除')
  } catch (e) {
    showError('删除失败')
  }
}

async function handleExport() {
  try {
    await api.exportSnippets()
    success('导出成功')
  } catch (e) {
    showError('导出失败')
  }
}

async function handleImport() {
  try {
    await api.importSnippets()
    await snippetStore.loadSnippets()
    success('导入成功')
  } catch (e) {
    showError('导入失败')
  }
}

async function handleCopy() {
  if (selectedSnippet.value) {
    await api.copySnippet(selectedSnippet.value.content, selectedSnippet.value.id)
    success('已复制到剪贴板')
  }
}

function handlePreview() {
  if (selectedSnippet.value) {
    if (!window.electronAPI) {
      openPreviewOverlay(selectedSnippet.value.content, selectedSnippet.value.language)
    } else {
      api.openPreview(selectedSnippet.value.content, selectedSnippet.value.language)
    }
  }
}

function handleManagerKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ' ') {
    e.preventDefault()
    api.toggleQuickLaunch()
  }
}

onMounted(() => {
  snippetStore.loadSnippets()
  tagStore.loadTags()
})
</script>

<style scoped>
.main-manager {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f0f0f2 0%, #e8e8ec 100%);
  overflow: hidden;
}

[data-theme="dark"] .main-manager {
  background: linear-gradient(180deg, #1c1c1e 0%, #161618 100%);
}

/* ── Toolbar ── */
.toolbar {
  height: 48px;
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,252,0.92) 100%);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  box-shadow: var(--inset-divider-bottom), 0 0.5px 2px rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 14px;
  -webkit-app-region: drag;
  position: relative;
  z-index: 20;
  flex-shrink: 0;
}
[data-theme="dark"] .toolbar {
  background: linear-gradient(180deg, rgba(44,44,46,0.9) 0%, rgba(58,58,60,0.92) 100%);
}
.toolbar > * {
  -webkit-app-region: no-drag;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: -0.35px;
}
.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(180deg, #e8f4fd 0%, #d0e8fa 100%);
  color: var(--accent-blue);
  border-radius: var(--radius-sm);
  box-shadow: var(--highlight-top), 0 0.5px 1px rgba(0,0,0,0.04);
}
[data-theme="dark"] .brand-icon {
  background: linear-gradient(180deg, #1c3a5c 0%, #0d2137 100%);
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.toolbar-divider {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 2px;
}
.theme-toggle {
  border-radius: 50%;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.25, 1, 0.5, 1);
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
  font-family: inherit;
  letter-spacing: -0.01em;
}
.btn-primary {
  background: linear-gradient(180deg, #4b8ff8 0%, #0071e3 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 0.5px 2px rgba(0,113,227,0.25);
}
[data-theme="dark"] .btn-primary {
  background: linear-gradient(180deg, #5ac8fa 0%, #0071e3 100%);
}
.btn-primary:hover {
  background: linear-gradient(180deg, #5c9cf9 0%, #1a7ff0 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 4px rgba(0,113,227,0.3);
  transform: translateY(-0.5px);
}
.btn-primary:active {
  background: linear-gradient(180deg, #0062c4 0%, #0071e3 100%);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.12);
  transform: translateY(0.5px);
}
.btn-secondary {
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  color: var(--text-primary);
  border: 0.5px solid var(--border-color);
  box-shadow: var(--highlight-top), 0 0.5px 1px rgba(0,0,0,0.04);
}
[data-theme="dark"] .btn-secondary {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
  border-color: rgba(255,255,255,0.08);
}
.btn-secondary:hover {
  background: linear-gradient(180deg, #ffffff 0%, #f0f0f2 100%);
  border-color: var(--border-strong);
  transform: translateY(-0.5px);
}
.btn-secondary:active {
  background: linear-gradient(180deg, #e8e8ed 0%, #f0f0f2 100%);
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
  transform: translateY(0.5px);
}
.btn-secondary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-danger:hover {
  color: var(--accent-red);
  border-color: rgba(255, 59, 48, 0.25);
  background: linear-gradient(180deg, #fff 0%, #fff5f5 100%);
}
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 0.5px solid transparent;
  padding: 5px 8px;
}
.btn-ghost:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-primary);
}
[data-theme="dark"] .btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* ═══════════════════════════════════════
   Content
   ═══════════════════════════════════════ */
.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Sidebar ── */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  box-shadow: var(--inset-divider-right);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
[data-theme="dark"] .sidebar {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
}

.search-wrapper {
  position: relative;
  padding: 12px 14px 10px;
  box-shadow: var(--inset-divider-bottom);
}
.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
  transition: color 0.2s ease;
}
.search-wrapper:focus-within .search-icon {
  color: var(--accent-blue);
}
.search-input {
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  border: 0.5px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 7px 10px 7px 32px;
  border-radius: var(--radius-md);
  font-size: 12.5px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  box-shadow: var(--inset-sunken);
}
[data-theme="dark"] .search-input {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}
.search-input::placeholder {
  color: var(--text-tertiary);
}
.search-input:focus {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 2.5px var(--accent-blue-bg), var(--inset-sunken);
}

.filter-tabs {
  display: flex;
  padding: 8px 14px;
  gap: 4px;
  box-shadow: var(--inset-divider-bottom);
}
.filter-tab {
  flex: 1;
  padding: 4px 0;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.filter-tab:hover {
  background: rgba(0, 0, 0, 0.03);
  color: var(--text-primary);
}
.filter-tab.active {
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  color: var(--text-primary);
  box-shadow: var(--inset-sunken), 0 0.5px 1px rgba(0,0,0,0.03);
}
[data-theme="dark"] .filter-tab.active {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}

.tag-cloud {
  padding: 10px 14px;
  box-shadow: var(--inset-divider-bottom);
}
.tag-cloud-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}
.tag-cloud-items {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.tag-cloud-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px 2px 6px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  border: 0.5px solid;
  cursor: pointer;
  transition: all 0.15s ease;
}
.tag-cloud-item:hover {
  transform: translateY(-0.5px);
}
.tag-cloud-item .tag-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.list-header {
  padding: 8px 14px 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.list-count {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* ═══════════════════════════════════════
   Editor Area
   ═══════════════════════════════════════ */
.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
  padding: 22px 28px 18px;
  overflow: hidden;
  position: relative;
}
.glow-cursor {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,113,227,0.07) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.5s ease;
  transform: translate(-50%, -50%);
  will-change: left, top;
}
[data-theme="dark"] .glow-cursor {
  background: radial-gradient(circle, rgba(90,200,250,0.06) 0%, transparent 70%);
}
[data-theme="dark"] .editor-area {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
}

.title-input {
  background: transparent;
  border: none;
  border-bottom: 0.5px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 700;
  padding: 4px 0 12px;
  margin-bottom: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  letter-spacing: -0.5px;
  font-family: inherit;
}
.title-input::placeholder {
  color: var(--text-tertiary);
}
.title-input:focus {
  border-bottom-color: var(--accent-blue);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.toolbar-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

/* ── Markdown Mode Switcher ── */
.md-mode-switcher {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  border-radius: var(--radius-md);
  border: 0.5px solid var(--border-subtle);
  box-shadow: var(--inset-sunken);
}
[data-theme="dark"] .md-mode-switcher {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}
.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: calc(var(--radius-md) - 2px);
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.mode-btn:hover {
  color: var(--text-primary);
}
.mode-btn.active {
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  color: var(--text-primary);
  box-shadow: var(--highlight-top), 0 0.5px 1px rgba(0,0,0,0.04);
}
[data-theme="dark"] .mode-btn.active {
  background: linear-gradient(180deg, #48484a 0%, #3a3a3c 100%);
  color: #f5f5f7;
}

.lang-select-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  border: 0.5px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  box-shadow: var(--highlight-top), 0 0.5px 1px rgba(0,0,0,0.02);
  transition: border-color 0.15s ease;
}
[data-theme="dark"] .lang-select-wrapper {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}
.lang-select-wrapper:hover {
  border-color: var(--border-color);
}
.lang-select {
  background: transparent;
  color: var(--text-primary);
  border: none;
  font-size: 12.5px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

/* ── Editor Body ── */
.editor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 0;
}
.editor-body.split {
  flex-direction: row;
  gap: 12px;
}
.editor-body :deep(.code-editor-wrapper) {
  flex: 1;
  min-height: 0;
}
.editor-body.split :deep(.code-editor-wrapper) {
  flex: 1;
}
.editor-body.split :deep(.markdown-preview) {
  flex: 1;
}
.editor-body :deep(.markdown-preview) {
  flex: 1;
  min-height: 0;
}

.editor-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 0.5px solid var(--border-subtle);
}

/* ═══════════════════════════════════════
   Empty State
   ═══════════════════════════════════════ */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
  gap: 14px;
  text-align: center;
  padding: 48px;
}
[data-theme="dark"] .empty-state {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
}
.empty-state {
  position: relative;
}
.empty-art {
  position: relative;
  width: 120px;
  height: 100px;
  margin-bottom: 8px;
}
.art-window {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  border: 0.5px solid var(--border-subtle);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  animation: float-gentle 4s ease-in-out infinite;
}
[data-theme="dark"] .art-window {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}
.art-window-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 10px;
  background: linear-gradient(180deg, #e8e8ed 0%, #dcdcde 100%);
  border-bottom: 0.5px solid var(--border-subtle);
}
[data-theme="dark"] .art-window-header {
  background: linear-gradient(180deg, #48484a 0%, #3a3a3c 100%);
}
.art-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.art-dot.red { background: #ff5f57; }
.art-dot.yellow { background: #febc2e; }
.art-dot.green { background: #28c840; }
.art-window-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.art-line {
  height: 5px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--border-color) 0%, var(--border-subtle) 100%);
  animation: shimmer-line 2.5s ease-in-out infinite;
}
.art-line.short {
  width: 60%;
}
.art-line:nth-child(2) { animation-delay: 0.2s; }
.art-line:nth-child(3) { animation-delay: 0.4s; }
.art-line:nth-child(4) { animation-delay: 0.6s; }
.art-line:nth-child(5) { animation-delay: 0.8s; }
.art-line:nth-child(6) { animation-delay: 1.0s; }
.art-bracket {
  width: 20px;
  height: 14px;
  border: 2px solid var(--accent-blue);
  border-radius: 3px;
  margin-top: 4px;
  opacity: 0.4;
  animation: pulse-bracket 2s ease-in-out infinite;
}
.art-floating {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  border: 0.5px solid var(--border-subtle);
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  color: var(--accent-blue);
}
[data-theme="dark"] .art-floating {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}
.art-float-1 {
  top: -8px;
  right: -12px;
  animation: float-gentle 3.5s ease-in-out infinite 0.5s;
}
.art-float-2 {
  bottom: 8px;
  left: -16px;
  animation: float-gentle 4s ease-in-out infinite 1s;
}
.art-float-3 {
  bottom: -6px;
  right: -6px;
  animation: float-gentle 3s ease-in-out infinite 1.5s;
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes shimmer-line {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
@keyframes pulse-bracket {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
.empty-state h3 {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.empty-state p {
  color: var(--text-secondary);
  font-size: 13px;
  max-width: 300px;
  line-height: 1.5;
}
.empty-shortcut {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 500;
}
.empty-shortcut kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  border: 0.5px solid var(--border-color);
  border-radius: 5px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  box-shadow: 0 1px 0 var(--border-strong), var(--highlight-top);
  font-family: 'JetBrains Mono', monospace;
}
[data-theme="dark"] .empty-shortcut kbd {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}

.module-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.module-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-tertiary);
  padding: 40px 20px;
  text-align: center;
}

.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  box-shadow: var(--inset-sunken);
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

[data-theme="dark"] .placeholder-icon {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}

.module-placeholder h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.module-placeholder p {
  font-size: 12.5px;
  color: var(--text-tertiary);
}

/* ── Preview Overlay ── */
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.preview-panel {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 0.5px solid var(--border-subtle);
  box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  box-shadow: var(--inset-divider-bottom);
}
.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.preview-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.preview-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.preview-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

/* ── Transitions ── */
.fade-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-leave-active {
  transition: all 0.18s cubic-bezier(0.25, 1, 0.5, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
