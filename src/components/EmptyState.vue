<template>
  <div class="empty-state" :class="`empty-${module}`">
    <div class="empty-art">
      <img
        :src="`/illustrations/empty-${module}.png`"
        :alt="title"
        class="art-img"
        draggable="false"
      />
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
  module: { type: String, required: true }
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
  gap: 14px;
  padding: 40px;
  text-align: center;
  position: relative;
}

.empty-art {
  position: relative;
  width: 220px;
  height: 220px;
  margin-bottom: 4px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.8),
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 12px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

[data-theme="dark"] .empty-art {
  background: linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 1px 2px rgba(0,0,0,0.2),
    0 4px 12px rgba(0,0,0,0.15);
}

.art-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: gentleFloat 5s ease-in-out infinite;
  user-select: none;
  -webkit-user-drag: none;
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
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
