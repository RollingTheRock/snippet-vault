import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: resolve('electron/main.js'),
        formats: ['cjs']
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: resolve('electron/preload.js'),
        formats: ['cjs']
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: resolve('index.html')
      }
    },
    plugins: [vue()]
  }
})
