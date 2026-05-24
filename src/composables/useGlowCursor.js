import { ref, onMounted, onUnmounted } from 'vue'

export function useGlowCursor(containerRef) {
  const x = ref(-500)
  const y = ref(-500)
  const visible = ref(false)

  let rafId = null
  let tx = -500
  let ty = -500

  function onMove(e) {
    const rect = containerRef.value?.getBoundingClientRect()
    if (!rect) return
    tx = e.clientX - rect.left
    ty = e.clientY - rect.top
    visible.value = true
  }

  function onLeave() {
    visible.value = false
  }

  function tick() {
    x.value += (tx - x.value) * 0.08
    y.value += (ty - y.value) * 0.08
    rafId = requestAnimationFrame(tick)
  }

  onMounted(() => {
    containerRef.value?.addEventListener('mousemove', onMove)
    containerRef.value?.addEventListener('mouseleave', onLeave)
    rafId = requestAnimationFrame(tick)
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('mousemove', onMove)
    containerRef.value?.removeEventListener('mouseleave', onLeave)
    cancelAnimationFrame(rafId)
  })

  return { x, y, visible }
}
