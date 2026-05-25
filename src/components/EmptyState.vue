<template>
  <div class="empty-state" :class="`empty-${module}`">
    <div class="empty-art">
      <!-- Snippets: Code window illustration -->
      <svg v-if="module === 'snippets'" class="art-svg" viewBox="0 0 200 160" fill="none">
        <rect x="20" y="10" width="160" height="140" rx="12" fill="var(--bg-secondary)" stroke="var(--border-color)" stroke-width="0.5" />
        <rect x="20" y="10" width="160" height="28" rx="12" fill="var(--bg-tertiary)" />
        <circle cx="38" cy="24" r="4" fill="#FF5F57" />
        <circle cx="52" cy="24" r="4" fill="#FFBD2E" />
        <circle cx="66" cy="24" r="4" fill="#28C840" />
        <rect x="32" y="52" width="80" height="6" rx="3" fill="var(--accent-blue)" opacity="0.25" />
        <rect x="32" y="66" width="120" height="6" rx="3" fill="var(--border-strong)" opacity="0.4" />
        <rect x="32" y="80" width="100" height="6" rx="3" fill="var(--border-strong)" opacity="0.4" />
        <rect x="32" y="94" width="60" height="6" rx="3" fill="var(--accent-blue)" opacity="0.2" />
        <path d="M90 120l-10 10 10 10M110 120l10 10-10 10" stroke="var(--accent-blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" />
        <rect x="140" y="44" width="28" height="28" rx="6" fill="var(--accent-blue-bg)" />
        <path d="M150 54l4 4-4 4M158 54l-4 4 4 4" stroke="var(--accent-blue)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>

      <!-- Notes: Document illustration -->
      <svg v-else-if="module === 'notes'" class="art-svg" viewBox="0 0 200 160" fill="none">
        <rect x="45" y="10" width="110" height="140" rx="8" fill="var(--bg-secondary)" stroke="var(--border-color)" stroke-width="0.5" />
        <rect x="45" y="10" width="110" height="18" rx="8" fill="var(--bg-tertiary)" />
        <rect x="55" y="42" width="70" height="6" rx="3" fill="var(--text-primary)" opacity="0.6" />
        <rect x="55" y="56" width="90" height="4" rx="2" fill="var(--border-strong)" opacity="0.5" />
        <rect x="55" y="66" width="80" height="4" rx="2" fill="var(--border-strong)" opacity="0.5" />
        <rect x="55" y="76" width="85" height="4" rx="2" fill="var(--border-strong)" opacity="0.5" />
        <rect x="55" y="90" width="40" height="4" rx="2" fill="var(--accent-blue)" opacity="0.3" />
        <rect x="100" y="90" width="35" height="4" rx="2" fill="var(--border-strong)" opacity="0.3" />
        <circle cx="160" cy="130" r="18" fill="var(--accent-blue-bg)" />
        <path d="M154 130h12M160 124v12" stroke="var(--accent-blue)" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- HTTP: Lightning/connection illustration -->
      <svg v-else-if="module === 'http'" class="art-svg" viewBox="0 0 200 160" fill="none">
        <rect x="30" y="70" width="60" height="50" rx="8" fill="var(--bg-secondary)" stroke="var(--border-color)" stroke-width="0.5" />
        <rect x="40" y="80" width="30" height="4" rx="2" fill="var(--accent-green)" opacity="0.5" />
        <rect x="40" y="90" width="20" height="4" rx="2" fill="var(--border-strong)" opacity="0.4" />
        <rect x="40" y="100" width="25" height="4" rx="2" fill="var(--border-strong)" opacity="0.4" />
        <rect x="110" y="40" width="60" height="50" rx="8" fill="var(--bg-secondary)" stroke="var(--border-color)" stroke-width="0.5" />
        <rect x="120" y="50" width="25" height="4" rx="2" fill="var(--accent-green)" opacity="0.5" />
        <rect x="120" y="60" width="35" height="4" rx="2" fill="var(--border-strong)" opacity="0.4" />
        <rect x="120" y="70" width="30" height="4" rx="2" fill="var(--border-strong)" opacity="0.4" />
        <path d="M95 90h10" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.5" />
        <circle cx="95" cy="90" r="4" fill="var(--accent-green)" opacity="0.3" />
        <circle cx="105" cy="90" r="4" fill="var(--accent-green)" opacity="0.3" />
        <polygon points="95 30 85 50 92 50 88 70 105 48 97 48" fill="var(--accent-green)" opacity="0.2" />
        <polygon points="95 30 85 50 92 50 88 70 105 48 97 48" stroke="var(--accent-green)" stroke-width="1.5" stroke-linejoin="round" opacity="0.5" />
      </svg>

      <!-- Floating particles -->
      <div class="particle p1" />
      <div class="particle p2" />
      <div class="particle p3" />
    </div>

    <h3>{{ title }}</h3>
    <p class="empty-desc">{{ description }}</p>

    <button class="empty-cta" @click="$emit('create')">
      <AppIcon name="plus" :size="14" />
      <span>{{ ctaLabel }}</span>
    </button>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

const props = defineProps({
  module: { type: String, required: true } // 'snippets' | 'notes' | 'http'
})

defineEmits(['create'])

const titles = {
  snippets: '选择一个片段或创建新片段',
  notes: '选择一个笔记或创建新笔记',
  http: '发送你的第一个 API 请求'
}

const descriptions = {
  snippets: '使用左侧浏览已有片段，或点击下方按钮开始',
  notes: '使用左侧浏览已有笔记，或点击下方按钮开始',
  http: '配置请求参数后点击发送，响应结果将显示在这里'
}

const ctas = {
  snippets: '新建片段',
  notes: '新建笔记',
  http: '重置请求'
}

const title = titles[props.module]
const description = descriptions[props.module]
const ctaLabel = ctas[props.module]
</script>

<style scoped>
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  text-align: center;
  position: relative;
}

.empty-art {
  position: relative;
  width: 200px;
  height: 160px;
  margin-bottom: 8px;
}

.art-svg {
  width: 100%;
  height: 100%;
  animation: artFloat 6s ease-in-out infinite;
}

@keyframes artFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}

.p1 {
  width: 24px;
  height: 24px;
  background: var(--accent-blue);
  top: 10px;
  right: 20px;
  animation: particleFloat 4s ease-in-out infinite;
}

.p2 {
  width: 16px;
  height: 16px;
  background: var(--accent-green);
  bottom: 30px;
  left: 10px;
  animation: particleFloat 5s ease-in-out infinite 1s;
}

.p3 {
  width: 12px;
  height: 12px;
  background: var(--accent-orange, #ff9500);
  top: 50%;
  right: 5px;
  animation: particleFloat 3.5s ease-in-out infinite 0.5s;
}

@keyframes particleFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(6px, -10px) scale(1.1); }
  66% { transform: translate(-4px, 6px) scale(0.9); }
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  margin: 0;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.5;
  margin: 0;
  max-width: 320px;
}

.empty-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  margin-top: 4px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(180deg, #4b8ff8 0%, #0071e3 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,113,227,0.2);
}

.empty-cta:hover {
  background: linear-gradient(180deg, #5c9cf9 0%, #1a7ff0 100%);
  transform: translateY(-1px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,113,227,0.25);
}

.empty-cta:active {
  transform: translateY(0.5px);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.12);
}
</style>
