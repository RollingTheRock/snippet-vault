import { ref, onMounted, onUnmounted } from 'vue'

export function useRipple(elRef) {
  function createRipple(event) {
    const el = elRef.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.12;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      animation: ripple-expand 0.55s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    `

    el.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  onMounted(() => {
    elRef.value?.addEventListener('click', createRipple)
  })

  onUnmounted(() => {
    elRef.value?.removeEventListener('click', createRipple)
  })
}
