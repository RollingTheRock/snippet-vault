<template>
  <div class="main-manager" tabindex="-1" @keydown="handleManagerKeydown">
    <!-- Title Bar -->
    <div class="title-bar">
      <div class="brand">
        <div class="brand-icon">
          <AppIcon name="layout" :size="16" />
        </div>
        <span>SnippetVault</span>
      </div>

      <button class="cmd-palette-trigger" @click="openCommandPalette">
        <AppIcon name="search" :size="13" />
        <span>搜索命令...</span>
        <kbd class="cmd-kbd">⌘K</kbd>
      </button>

      <div class="title-bar-actions">
        <button ref="btnNew" class="btn btn-primary" @click="handleNew">
          <AppIcon name="plus" :size="13" />
          <span>新建</span>
        </button>
        <button class="btn btn-ghost theme-toggle" @click="toggleTheme" :title="isDark ? '切换浅色' : '切换深色'">
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="14" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <ActivityBar v-model="activeModule" />

      <!-- Sidebar -->
      <div class="sidebar">
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
          <div class="search-wrapper">
            <AppIcon name="search" :size="14" class="search-icon" />
            <input
              v-model="noteSearchQuery"
              @input="handleNoteSearch"
              class="search-input"
              placeholder="搜索笔记..."
            />
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
                :class="{ active: noteStore.filterTagId === tag.id }"
                :style="{
                  background: noteStore.filterTagId === tag.id ? tag.color + '16' : tag.color + '0a',
                  color: tag.color,
                  borderColor: noteStore.filterTagId === tag.id ? tag.color + '30' : 'transparent'
                }"
                @click="toggleNoteTagFilter(tag.id)"
              >
                <span class="tag-dot" :style="{ background: tag.color }" />
                {{ tag.name }}
              </span>
            </div>
          </div>
          <div class="list-header">
            <span class="list-count">{{ noteStore.notes.length }} 个笔记</span>
          </div>
          <div class="note-list">
            <div
              v-for="note in noteStore.notes"
              :key="note.id"
              class="note-item"
              :class="{ active: noteStore.selectedId === note.id }"
              @click="noteStore.selectedId = note.id"
            >
              <div class="note-title-row">
                <span class="note-title">{{ note.title || '未命名笔记' }}</span>
                <span v-if="note.updated_at" class="note-time">{{ formatTime(note.updated_at) }}</span>
              </div>
              <div class="note-preview">{{ note.content.substring(0, 60).replace(/\n/g, ' ') }}...</div>
              <div class="note-meta">
                <span
                  v-for="tag in (note.tags || []).slice(0, 3)"
                  :key="tag.id"
                  class="note-tag-pill"
                  :style="{ background: tag.color + '14', color: tag.color, borderColor: tag.color + '25' }"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="activeModule === 'http'" class="module-panel http-env-panel">
          <div class="panel-header">
            <AppIcon name="settings" :size="12" />
            <span>环境变量</span>
          </div>
          <div class="env-list">
            <div v-for="(env, i) in httpStore.envVars" :key="i" class="env-row">
              <input v-model="env.name" class="env-input env-name" placeholder="变量名" />
              <input v-model="env.value" class="env-input env-value" placeholder="值" />
              <button class="env-remove" @click="httpStore.removeEnvVar(i)">
                <AppIcon name="x" :size="12" />
              </button>
            </div>
          </div>
          <button class="btn btn-ghost add-env-btn" @click="httpStore.addEnvVar()">
            <AppIcon name="plus" :size="12" />
            <span>添加变量</span>
          </button>
          <div class="env-hint">
            使用 <code v-pre>{{name}}</code> 在 URL / Header / Body 中引用
          </div>
        </div>
      </div>

      <!-- Editor -->
      <Transition name="fade-slide" mode="out-in">
        <div class="editor-area" v-if="activeModule === 'snippets' && selectedSnippet" key="snippet-editor" ref="editorAreaRef">
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

        <EmptyState v-else-if="activeModule === 'snippets'" module="snippets" key="snippet-empty" @create="handleNew" />

        <!-- Notes Editor -->
        <div class="editor-area" v-else-if="activeModule === 'notes' && noteStore.selectedNote" key="note-editor">
          <input
            v-model="noteEditForm.title"
            class="title-input"
            placeholder="笔记标题"
          />
          <div class="editor-toolbar">
            <TagInput v-model="noteCurrentTags" />
            <div class="md-mode-switcher">
              <button class="mode-btn" :class="{ active: noteMdMode === 'code' }" @click="noteMdMode = 'code'">
                <AppIcon name="code" :size="12" /> 源码
              </button>
              <button class="mode-btn" :class="{ active: noteMdMode === 'split' }" @click="noteMdMode = 'split'">
                <AppIcon name="layout" :size="12" /> 分屏
              </button>
              <button class="mode-btn" :class="{ active: noteMdMode === 'preview' }" @click="noteMdMode = 'preview'">
                <AppIcon name="eye" :size="12" /> 预览
              </button>
            </div>
          </div>
          <div class="editor-body" :class="{ split: noteMdMode === 'split' }">
            <CodeEditor
              v-show="noteMdMode !== 'preview'"
              v-model="noteEditForm.content"
              language="markdown"
              :isDark="isDark"
              placeholder="输入 Markdown 内容..."
              :class="{ 'md-full': noteMdMode === 'code', 'md-half': noteMdMode === 'split' }"
            />
            <MarkdownPreview
              v-if="noteMdMode !== 'code'"
              :content="noteEditForm.content"
              :isDark="isDark"
              :class="{ 'md-full': noteMdMode === 'preview', 'md-half': noteMdMode === 'split' }"
            />
          </div>
          <div class="editor-actions">
            <button class="btn btn-primary" @click="handleNoteSave">
              <AppIcon name="save" :size="13" /><span>保存</span>
            </button>
            <button class="btn btn-secondary btn-danger" @click="handleNoteDelete">
              <AppIcon name="trash" :size="13" /><span>删除</span>
            </button>
          </div>
        </div>

        <EmptyState v-else-if="activeModule === 'notes'" module="notes" key="note-empty" @create="handleNew" />

        <!-- HTTP Client -->
        <div class="http-client" v-else-if="activeModule === 'http'" key="http-client">
          <div class="http-request-bar">
            <select v-model="httpStore.method" class="http-method">
              <option v-for="m in httpStore.METHODS" :key="m">{{ m }}</option>
            </select>
            <input
              v-model="httpStore.url"
              class="http-url"
              placeholder="输入请求 URL，如 {{baseUrl}}/posts"
            />
            <button
              class="btn btn-primary http-send"
              @click="httpStore.sendRequest(); httpTab = 'response'"
              :disabled="httpStore.loading"
            >
              <AppIcon :name="httpStore.loading ? 'loader' : 'zap'" :size="13" />
              <span>{{ httpStore.loading ? '发送中...' : '发送' }}</span>
            </button>
          </div>

          <div class="http-tabs">
            <button
              class="http-tab"
              :class="{ active: httpTab === 'headers' }"
              @click="httpTab = 'headers'"
            >请求头</button>
            <button
              class="http-tab"
              :class="{ active: httpTab === 'body' }"
              @click="httpTab = 'body'"
            >请求体</button>
            <button
              class="http-tab"
              :class="{ active: httpTab === 'response' }"
              @click="httpTab = 'response'"
            >响应</button>
          </div>

          <div class="http-panel" v-show="httpTab === 'headers'">
            <div class="http-header-row" v-for="(h, i) in httpStore.headers" :key="i">
              <input type="checkbox" v-model="h.enabled" class="http-h-check" />
              <input v-model="h.key" class="http-h-key" placeholder="Header 名称" />
              <input v-model="h.value" class="http-h-value" placeholder="Header 值" />
              <button class="env-remove" @click="httpStore.removeHeader(i)">
                <AppIcon name="x" :size="12" />
              </button>
            </div>
            <button class="btn btn-ghost add-row-btn" @click="httpStore.addHeader()">
              <AppIcon name="plus" :size="12" />
              <span>添加 Header</span>
            </button>
          </div>

          <div class="http-panel http-body-panel" v-show="httpTab === 'body'">
            <CodeEditor
              v-model="httpStore.body"
              language="json"
              :isDark="isDark"
              placeholder="请求体内容 (JSON / Form / Text)..."
            />
          </div>

          <div class="http-panel" v-show="httpTab === 'response'">
            <div v-if="httpStore.error" class="http-error">
              <AppIcon name="alert-circle" :size="16" />
              <span>{{ httpStore.error }}</span>
            </div>
            <div v-else-if="httpStore.response" class="http-response">
              <div class="http-res-meta">
                <span class="http-status" :class="{ ok: httpStore.response.ok, err: !httpStore.response.ok }">
                  {{ httpStore.response.status }} {{ httpStore.response.statusText }}
                </span>
                <span class="http-time">{{ httpStore.response.time }}ms</span>
              </div>
              <div class="http-res-headers">
                <div v-for="(v, k) in httpStore.response.headers" :key="k" class="http-res-h">
                  <span class="http-res-hk">{{ k }}:</span>
                  <span class="http-res-hv">{{ v }}</span>
                </div>
              </div>
              <CodeEditor
                v-model="httpStore.response.bodyFormatted"
                language="json"
                :isDark="isDark"
                :readOnly="true"
                placeholder="响应内容..."
              />
            </div>
            <div v-else class="http-empty-res">
              <AppIcon name="zap" :size="32" />
              <p>点击「发送」查看响应</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <!-- Command Palette -->
    <CommandPalette
      ref="commandPaletteRef"
      :snippets="snippetStore.snippets"
      :notes="noteStore.notes"
      :activeModule="activeModule"
      @selectSnippet="id => { activeModule = 'snippets'; snippetStore.selectedId = id }"
      @selectNote="id => { activeModule = 'notes'; noteStore.selectedId = id }"
      @switchModule="mod => activeModule = mod"
      @newSnippet="handleNew"
      @newNote="handleNew"
      @resetHttp="handleNew"
      @toggleTheme="toggleTheme"
      @exportData="handleExport"
      @importData="handleImport"
      @preview="handlePreview"
      @copy="handleCopy"
    />

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

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-left">
        <span v-if="autoSaveStatus" class="status-save-indicator">
          <AppIcon :name="autoSaveStatus === 'saved' ? 'check' : 'loader'" :size="10" />
          {{ autoSaveStatus === 'saved' ? '已保存' : '保存中...' }}
        </span>
      </div>
      <div class="status-center">
        <span v-if="activeModule === 'snippets' && selectedSnippet" class="status-item">
          {{ selectedSnippet.language === 'markdown' ? 'Markdown' : selectedSnippet.language }}
        </span>
        <span v-else-if="activeModule === 'notes' && noteStore.selectedNote" class="status-item">Markdown</span>
        <span v-else-if="activeModule === 'http'" class="status-item">HTTP Client</span>
      </div>
      <div class="status-right">
        <span v-if="editorStats" class="status-item">{{ editorStats }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useSnippetStore } from '../stores/snippets.js'
import { useNoteStore } from '../stores/notes.js'
import { useHttpStore } from '../stores/http.js'
import { useTagStore } from '../stores/tags.js'
import { useTheme } from '../composables/useTheme.js'
import SnippetList from '../components/SnippetList.vue'
import CodeEditor from '../components/CodeEditor.vue'
import TagInput from '../components/TagInput.vue'
import MarkdownPreview from '../components/MarkdownPreview.vue'
import EmptyState from '../components/EmptyState.vue'
import CommandPalette from '../components/CommandPalette.vue'
import AppIcon from '../components/AppIcon.vue'
import { useToast } from '../composables/useToast.js'
import { useRipple } from '../composables/useRipple.js'
import { useGlowCursor } from '../composables/useGlowCursor.js'
import { useMagnetic } from '../composables/useMagnetic.js'
import { api } from '../api/index.js'
import ActivityBar from '../components/ActivityBar.vue'

const snippetStore = useSnippetStore()
const noteStore = useNoteStore()
const httpStore = useHttpStore()
const tagStore = useTagStore()
const activeModule = ref('snippets') // 'snippets' | 'notes' | 'http'
const { success, error: showError } = useToast()
const { isDark, toggle: toggleTheme } = useTheme()

const searchQuery = ref('')
const noteSearchQuery = ref('')
const httpTab = ref('headers')
const editForm = reactive({ title: '', content: '', language: 'javascript' })
const currentTags = ref([])
const mdMode = ref('split')

// Notes
const noteEditForm = reactive({ title: '', content: '' })
const noteCurrentTags = ref([])
const noteMdMode = ref('split')

watch(() => noteStore.selectedNote, (note) => {
  if (note) {
    noteEditForm.title = note.title
    noteEditForm.content = note.content
    noteCurrentTags.value = note.tags || []
  }
}, { immediate: true })

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
const editorAreaRef = ref(null)
const autoSaveStatus = ref('')

useRipple(btnNew)

// Glow cursor for editor
const editorGlow = useGlowCursor(editorAreaRef)

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

const selectedSnippet = computed(() => snippetStore.selectedSnippet)
const selectedId = computed(() => {
  if (activeModule.value === 'notes') return noteStore.selectedId
  if (activeModule.value === 'http') return !!httpStore.url
  return snippetStore.selectedId
})

// Auto-save
let saveTimer = null
function triggerAutoSave() {
  autoSaveStatus.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      if (activeModule.value === 'notes' && noteStore.selectedId) {
        await noteStore.updateNote(noteStore.selectedId, {
          title: noteEditForm.title,
          content: noteEditForm.content
        })
        await api.setNoteTags(noteStore.selectedId, noteCurrentTags.value.map(t => t.id))
        await noteStore.loadNotes()
      } else if (activeModule.value === 'snippets' && snippetStore.selectedId) {
        await snippetStore.updateSnippet(snippetStore.selectedId, {
          title: editForm.title,
          content: editForm.content,
          language: editForm.language
        })
        await api.setSnippetTags(snippetStore.selectedId, currentTags.value.map(t => t.id))
        await snippetStore.loadSnippets()
      }
      autoSaveStatus.value = 'saved'
      setTimeout(() => { autoSaveStatus.value = '' }, 2000)
    } catch (e) {
      autoSaveStatus.value = ''
    }
  }, 800)
}

watch(() => [noteEditForm.title, noteEditForm.content, noteCurrentTags.value], () => {
  if (activeModule.value === 'notes' && noteStore.selectedId) triggerAutoSave()
}, { deep: true })

watch(() => [editForm.title, editForm.content, editForm.language, currentTags.value], () => {
  if (activeModule.value === 'snippets' && snippetStore.selectedId) triggerAutoSave()
}, { deep: true })

// Status bar stats
const editorStats = computed(() => {
  if (activeModule.value === 'snippets' && selectedSnippet.value) {
    const lines = (editForm.content.match(/\n/g) || []).length + 1
    const chars = editForm.content.length
    return `${lines} 行 · ${chars} 字符`
  }
  if (activeModule.value === 'notes' && noteStore.selectedNote) {
    const lines = (noteEditForm.content.match(/\n/g) || []).length + 1
    const chars = noteEditForm.content.length
    return `${lines} 行 · ${chars} 字符`
  }
  if (activeModule.value === 'http' && httpStore.response) {
    const size = new Blob([httpStore.response.body]).size
    return `${httpStore.response.status} · ${httpStore.response.time}ms · ${formatBytes(size)}`
  }
  return ''
})

function formatBytes(b) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}

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

function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('app:command-palette'))
}

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

async function handleNoteSearch() {
  await noteStore.searchNotes(noteSearchQuery.value)
}

async function toggleNoteTagFilter(tagId) {
  if (noteStore.filterTagId === tagId) {
    await noteStore.loadNotes()
  } else {
    await noteStore.loadByTag(tagId)
  }
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
  if (activeModule.value === 'snippets') {
    await snippetStore.createSnippet({
      title: '未命名片段',
      content: '',
      language: 'javascript'
    })
    success('新片段已创建')
  } else if (activeModule.value === 'notes') {
    await noteStore.createNote({
      title: '未命名笔记',
      content: ''
    })
    success('新笔记已创建')
  } else if (activeModule.value === 'http') {
    httpStore.reset()
    success('请求已重置')
  }
}

async function handleSave() {
  if (activeModule.value === 'http') {
    await httpStore.sendRequest()
    httpTab.value = 'response'
    if (httpStore.error) {
      showError(httpStore.error)
    } else if (httpStore.response) {
      success(`请求完成 (${httpStore.response.status})`)
    }
    return
  }
  if (!selectedId.value) return
  try {
    if (activeModule.value === 'notes') {
      await noteStore.updateNote(noteStore.selectedId, {
        title: noteEditForm.title,
        content: noteEditForm.content
      })
      await api.setNoteTags(noteStore.selectedId, noteCurrentTags.value.map(t => t.id))
      await noteStore.loadNotes()
      success('笔记保存成功')
    } else {
      await snippetStore.updateSnippet(selectedId.value, {
        title: editForm.title,
        content: editForm.content,
        language: editForm.language
      })
      await api.setSnippetTags(selectedId.value, currentTags.value.map(t => t.id))
      await snippetStore.loadSnippets()
      success('保存成功')
    }
  } catch (e) {
    showError('保存失败')
  }
}

async function handleNoteSave() {
  if (!noteStore.selectedId) return
  try {
    await noteStore.updateNote(noteStore.selectedId, {
      title: noteEditForm.title,
      content: noteEditForm.content
    })
    await api.setNoteTags(noteStore.selectedId, noteCurrentTags.value.map(t => t.id))
    await noteStore.loadNotes()
    success('笔记保存成功')
  } catch (e) {
    showError('保存失败')
  }
}

async function handleNoteDelete() {
  if (!noteStore.selectedId) return
  try {
    await noteStore.deleteNote(noteStore.selectedId)
    success('笔记已删除')
  } catch (e) {
    showError('删除失败')
  }
}

async function handleDelete() {
  if (!selectedId.value) return
  try {
    if (activeModule.value === 'notes') {
      await noteStore.deleteNote(noteStore.selectedId)
      success('笔记已删除')
    } else if (activeModule.value === 'http') {
      httpStore.reset()
      success('请求已重置')
    } else {
      await snippetStore.deleteSnippet(selectedId.value)
      success('已删除')
    }
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
  noteStore.loadNotes()
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
.title-bar {
  height: 40px;
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,252,0.92) 100%);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  box-shadow: var(--inset-divider-bottom), 0 0.5px 2px rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 12px;
  -webkit-app-region: drag;
  position: relative;
  z-index: 20;
  flex-shrink: 0;
}
[data-theme="dark"] .title-bar {
  background: linear-gradient(180deg, rgba(44,44,46,0.9) 0%, rgba(58,58,60,0.92) 100%);
}
.title-bar > * {
  -webkit-app-region: no-drag;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 13.5px;
  letter-spacing: -0.3px;
}
.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: linear-gradient(180deg, #e8f4fd 0%, #d0e8fa 100%);
  color: var(--accent-blue);
  border-radius: var(--radius-sm);
  box-shadow: var(--highlight-top), 0 0.5px 1px rgba(0,0,0,0.04);
}
[data-theme="dark"] .brand-icon {
  background: linear-gradient(180deg, #1c3a5c 0%, #0d2137 100%);
}
.title-bar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cmd-palette-trigger {
  flex: 1;
  max-width: 320px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  border: 0.5px solid var(--border-subtle);
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  color: var(--text-tertiary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--inset-sunken);
}
[data-theme="dark"] .cmd-palette-trigger {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
  border-color: rgba(255,255,255,0.08);
}
.cmd-palette-trigger:hover {
  border-color: var(--border-strong);
  color: var(--text-secondary);
}
.cmd-palette-trigger span {
  flex: 1;
  text-align: left;
}
.cmd-kbd {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 1px 5px;
  border-radius: 4px;
  border: 0.5px solid var(--border-subtle);
  font-family: 'SF Mono', monospace;
}
.theme-toggle {
  border-radius: 50%;
  width: 26px;
  height: 26px;
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

/* ── Status Bar ── */
.status-bar {
  height: 24px;
  background: linear-gradient(180deg, rgba(250,250,252,0.95) 0%, rgba(240,240,242,0.95) 100%);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow: var(--inset-divider-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font-size: 10.5px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  z-index: 20;
}
[data-theme="dark"] .status-bar {
  background: linear-gradient(180deg, rgba(28,28,30,0.95) 0%, rgba(22,22,24,0.95) 100%);
}
.status-left,
.status-center,
.status-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 80px;
}
.status-center {
  justify-content: center;
}
.status-right {
  justify-content: flex-end;
}
.status-item {
  font-variant-numeric: tabular-nums;
}
.status-save-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--accent-green);
  font-weight: 500;
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

.note-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.note-item {
  padding: 10px 14px;
  margin: 0 8px 4px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.12s ease;
  border: 0.5px solid transparent;
}

.note-item:hover {
  background: var(--bg-secondary);
}

.note-item.active {
  background: var(--accent-blue-bg);
  border-color: rgba(0, 113, 227, 0.12);
}

.note-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
}
.note-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.note-time {
  font-size: 9.5px;
  color: var(--text-tertiary);
  font-weight: 500;
  flex-shrink: 0;
}

.note-preview {
  font-size: 11.5px;
  color: var(--text-tertiary);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.note-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.note-tag {
  font-size: 10px;
  font-weight: 500;
  background: rgba(0,0,0,0.04);
  padding: 1px 6px;
  border-radius: 10px;
}

[data-theme="dark"] .note-tag {
  background: rgba(255,255,255,0.06);
}

.note-tag-pill {
  font-size: 10px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 10px;
  border: 0.5px solid transparent;
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

/* ── HTTP Client ── */
.http-client {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
  padding: 18px 24px;
  overflow: hidden;
}
[data-theme="dark"] .http-client {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
}

.http-request-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.http-method {
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--border-color);
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  cursor: pointer;
}
[data-theme="dark"] .http-method {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
  border-color: rgba(255,255,255,0.08);
}
.http-url {
  flex: 1;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--border-color);
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  font-size: 12.5px;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}
[data-theme="dark"] .http-url {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
  border-color: rgba(255,255,255,0.08);
}
.http-url:focus {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 2.5px var(--accent-blue-bg);
}
.http-send {
  white-space: nowrap;
}

.http-tabs {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  width: fit-content;
}
.http-tab {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.http-tab:hover {
  color: var(--text-primary);
}
.http-tab.active {
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  color: var(--text-primary);
  box-shadow: var(--inset-sunken), 0 0.5px 1px rgba(0,0,0,0.03);
}
[data-theme="dark"] .http-tab.active {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
}

.http-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.http-body-panel .code-editor-wrapper {
  flex: 1;
}

.http-header-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.http-h-check {
  width: 14px;
  height: 14px;
  accent-color: var(--accent-blue);
  cursor: pointer;
}
.http-h-key,
.http-h-value {
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--border-color);
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  font-size: 12px;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
}
[data-theme="dark"] .http-h-key,
[data-theme="dark"] .http-h-value {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
  border-color: rgba(255,255,255,0.08);
}
.http-h-key {
  width: 160px;
}
.http-h-value {
  flex: 1;
}
.add-row-btn {
  align-self: flex-start;
  margin-top: 4px;
}

.http-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 59, 48, 0.08);
  border: 0.5px solid rgba(255, 59, 48, 0.2);
  border-radius: var(--radius-md);
  color: var(--accent-red);
  font-size: 13px;
}

.http-response {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.http-res-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0 12px;
}
.http-status {
  font-size: 13px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
.http-status.ok {
  background: rgba(52, 199, 89, 0.12);
  color: var(--accent-green);
}
.http-status.err {
  background: rgba(255, 59, 48, 0.12);
  color: var(--accent-red);
}
.http-time {
  font-size: 12px;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}
.http-res-headers {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  max-height: 140px;
  overflow-y: auto;
}
.http-res-h {
  display: flex;
  gap: 6px;
  font-size: 11.5px;
  line-height: 1.8;
  font-family: 'SF Mono', monospace;
}
.http-res-hk {
  color: var(--text-tertiary);
  flex-shrink: 0;
}
.http-res-hv {
  color: var(--text-secondary);
}

.http-empty-res {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-tertiary);
}
.http-empty-res p {
  font-size: 13px;
}

/* ── HTTP Env Panel (Sidebar) ── */
.http-env-panel {
  padding: 12px;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 10px;
}
.env-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.env-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.env-input {
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--border-color);
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  font-size: 11.5px;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  width: 0;
}
[data-theme="dark"] .env-input {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
  border-color: rgba(255,255,255,0.08);
}
.env-name {
  flex: 1;
}
.env-value {
  flex: 1.5;
}
.env-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}
.env-remove:hover {
  background: rgba(255, 59, 48, 0.08);
  color: var(--accent-red);
}
.add-env-btn {
  width: 100%;
  justify-content: center;
  margin-bottom: 10px;
}
.env-hint {
  font-size: 10.5px;
  color: var(--text-tertiary);
  line-height: 1.5;
}
.env-hint code {
  background: var(--bg-tertiary);
  padding: 1px 4px;
  border-radius: 4px;
  font-family: 'SF Mono', monospace;
  font-size: 10px;
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
