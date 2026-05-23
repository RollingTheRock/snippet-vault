import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron',
      emptyOutDir: false,
      rollupOptions: {
        input: resolve('electron/main.js'),
        output: {
          format: 'cjs',
          entryFileNames: 'main.js'
        }
      }
    },
    plugins: [
      externalizeDepsPlugin(),
      nodeResolve({ preferBuiltins: true }),
      commonjs()
    ]
  },
  preload: {
    build: {
      outDir: 'dist-electron',
      emptyOutDir: false,
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
