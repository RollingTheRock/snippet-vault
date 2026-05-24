import { ref, onMounted, onUnmounted } from 'vue'

export function useMagnetic(elRef, options = {}) {
  const strength = options.strength || 0.3
  const radius = options.radius || 100

  const offsetX = ref(0)
  const offsetY = ref(0)

  let rafId = null
  let targetX = 0
  let targetY = 0

  function onMouseMove(e) {
    const el = elRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const distance = Math.sqrt(distX * distX + distY * distY)

    if (distance < radius) {
      const factor = 1 - distance / radius
      targetX = distX * strength * factor
      targetY = distY * strength * factor
    } else {
      targetX = 0
      targetY = 0
    }
  }

  function onMouseLeave() {
    targetX = 0
    targetY = 0
  }

  function animate() {
    offsetX.value += (targetX - offsetX.value) * 0.15
    offsetY.value += (targetY - offsetY.value) * 0.15
    rafId = requestAnimationFrame(animate)
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    rafId = requestAnimationFrame(animate)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseleave', onMouseLeave)
    cancelAnimationFrame(rafId)
  })

  return { offsetX, offsetY }
}
