<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.type}`"
        >
          <div class="toast-icon">
            <AppIcon :name="toast.icon || 'sparkles'" :size="16" />
          </div>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  toasts: { type: Array, default: () => [] }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(0,0,0,0.02);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  pointer-events: auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: bounce-in 0.35s var(--ease-spring);
}
.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.toast-success .toast-icon {
  color: var(--accent-green);
}
.toast-error .toast-icon {
  color: var(--accent-red);
}
.toast-info .toast-icon {
  color: var(--accent-blue);
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.85) translateY(-6px); }
  70% { transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  position: absolute;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.92);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
</style>
