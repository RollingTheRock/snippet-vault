# SnippetVault

> 一款面向开发者的代码片段、笔记与 API 测试工具 —— 支持桌面端（Electron）与 Web/PWA 双端运行。

[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-30-47848F?logo=electron)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## ✨ 功能概览

SnippetVault 是一个受 [Raycast](https://www.raycast.com/) 启发的开发者效率工具，集成了**代码片段管理**、**Markdown 笔记**与**HTTP 客户端**三大模块，并提供了全局快捷键呼出的「快启搜索」面板。

### 三大核心模块

| 模块 | 功能 |
|------|------|
| **🧩 代码片段** | 创建、编辑、搜索、标签分类、复制追踪、代码运行沙箱、截图导出 |
| **📝 Markdown 笔记** | 三栏编辑模式（源码 / 分屏 / 预览）、自动保存、标签管理 |
| **⚡ HTTP 客户端** | 多方法请求、环境变量替换、响应格式化、耗时统计 |

### 桌面端专属

- **全局快启搜索** — `Ctrl+Shift+Space` 呼出 Spotlight 风格搜索面板，一键复制代码片段
- **系统托盘** — 常驻后台，左键呼出快启，右键菜单操作
- **本地 SQLite 数据库** — 零配置，开箱即用

### Web / PWA 专属

- **渐进式 Web 应用** — 支持离线访问、桌面安装、主题色与图标
- **IndexedDB 本地存储** — 浏览器端数据持久化
- **Service Worker** — 静态资源缓存策略

---

## 🖼️ 界面预览

### 空状态插图

应用为每个模块设计了统一的 Notion 风格 3D 手绘插图：

- **代码片段** — 显示器前的代码工作台
- **笔记** — 软木板前的笔记本与咖啡
- **HTTP** — 双端设备间的请求连接

### 深色主题

完整的深色模式支持，从编辑器到空状态插图均适配。

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Vue 3（Composition API）+ Pinia |
| **构建工具** | Vite（Web）/ electron-vite（桌面端） |
| **桌面壳** | Electron 30 + electron-builder |
| **代码编辑器** | CodeMirror 6（支持 15+ 语言动态加载） |
| **Markdown** | markdown-it + github-markdown-css |
| **数据库（桌面）** | better-sqlite3 |
| **数据库（Web）** | IndexedDB（原生封装） |
| **截图导出** | html-to-image |
| **测试** | Playwright |

### CodeMirror 6 支持语言

JavaScript · TypeScript · HTML · CSS · Vue · Python · Java · Go · Rust · C++ · C# · SQL · Shell · PHP · JSON · Markdown

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 桌面端开发

```bash
# 启动开发模式
npm run dev

# 构建生产版本
npm run build

# 打包为可执行文件
npm run dist
```

### Web 端开发

```bash
# 启动 Web 开发服务器
npm run dev:web

# 构建 Web 静态包（输出到 dist-web/）
npm run build:web
```

---

## 📁 项目结构

```
snippet-vault/
├── electron/                  # Electron 主进程
│   ├── main.js               # 应用入口：托盘、窗口调度
│   ├── preload.js            # 安全上下文桥接
│   ├── windows/              # 窗口工厂（管理器 / 快启 / 预览）
│   ├── db/                   # SQLite 数据层（snippets / notes / tags）
│   └── ipc/                  # IPC 通信处理
├── src/
│   ├── api/index.js          # 双端统一 API 抽象层
│   ├── db/webDb.js           # IndexedDB 浏览器数据层
│   ├── views/                # 页面级组件
│   │   ├── MainManager.vue   # 主管理器（ActivityBar + Sidebar + Editor）
│   │   └── QuickLaunch.vue   # 快启搜索面板
│   ├── components/           # 可复用组件
│   │   ├── CodeMirrorEditor.vue   # 代码编辑器封装
│   │   ├── MarkdownPreview.vue    # Markdown 预览
│   │   ├── CommandPalette.vue     # 命令面板（Ctrl+K）
│   │   ├── EmptyState.vue         # 空状态插图
│   │   ├── CodeScreenshot.vue     # 代码截图生成
│   │   ├── ActivityBar.vue        # 垂直活动栏
│   │   └── SnippetList.vue        # 片段列表（拖拽排序）
│   ├── stores/               # Pinia 状态管理
│   ├── composables/          # 组合式逻辑（主题、Toast、光标、高亮等）
│   └── styles/               # CSS 变量、深色主题、动画
├── public/
│   ├── illustrations/        # 空状态 3D 插图（去底透明 PNG）
│   ├── icon-*.png            # PWA 图标
│   ├── favicon.svg           # 网站图标
│   ├── manifest.json         # PWA 清单
│   └── sw.js                 # Service Worker
├── assets/
│   └── tray-icon.png         # 系统托盘图标
└── docs/superpowers/         # 设计规范与开发文档
```

---

## 🏗 架构亮点

### 1. 双端统一代码库

通过 `src/api/index.js` 透明路由：

- **桌面端** → `window.electronAPI`（IPC 通信）
- **Web 端** → `src/db/webDb.js`（IndexedDB）

组件层完全无感知，同一套 Vue 代码同时跑在 Electron 和浏览器中。

### 2. 多窗口 Electron 架构

| 窗口 | 尺寸 | 特性 |
|------|------|------|
| 主管理器 | 1200×760 | 无边框、隐藏替代关闭 |
| 快启搜索 | 640×400 | 居中、失焦自动隐藏、置顶 |
| 预览窗口 | 自适应 | 沙箱隔离、可多开 |

### 3. 安全 IPC 设计

- `contextIsolation: true` + `nodeIntegration: false`
- Preload 脚本通过 `contextBridge` 暴露最小化 API
- 所有数据库操作集中在主进程 Repository 层

### 4. 微交互系统

- `useGlowCursor` — 编辑器区域跟随鼠标的柔光晕
- `useRipple` — Material 风格按钮涟漪
- `useMagnetic` — 磁性吸附按钮
- `useToast` — 全局 Toast 通知队列

---

## 📦 构建产物

| 命令 | 输出 | 说明 |
|------|------|------|
| `npm run build` | `dist/` + `dist-electron/` | Electron 生产构建 |
| `npm run build:web` | `dist-web/` | Web 静态站点 |
| `npm run dist` | `dist-electron-build/` | 可执行安装包（AppImage / dir） |

---

## 📝 开源协议

[MIT License](./LICENSE)

---

> 本项目为《Web 前端开发》课程作业，使用 Vue 3 + Electron 全栈开发。
