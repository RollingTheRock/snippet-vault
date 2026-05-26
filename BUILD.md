# SnippetVault — 构建与运行说明

> 《Web 前端开发》课程作业

---

## 目录说明

本次提交包含三个部分：

| 目录/文件 | 说明 |
|-----------|------|
| `01-源码/` | 完整项目源码（不含 `node_modules`），可二次开发 |
| `02-Web效果包/` | 预构建的静态站点，通过本地服务器预览 |
| `03-Linux桌面包/` | Linux 可执行文件（AppImage），双击运行 |
| `README.md` | 项目完整介绍与功能说明 |

---

## 快速验证（推荐）

### 方式一：浏览器预览（任何系统）

进入 `02-Web效果包/` 目录：

**Windows：** 双击 `start-web-server.bat`

**Linux / macOS：**
```bash
cd 02-Web效果包/
./start-web-server.sh
```

脚本会自动：
1. 启动本地 HTTP 服务器（`http://localhost:8080`）
2. 打开系统默认浏览器访问该地址

> 注意：现代浏览器出于安全考虑，不允许直接通过 `file://` 协议打开 ES 模块页面，因此必须通过本地服务器访问。

支持的功能：
- 代码片段管理（创建、编辑、搜索、标签）
- Markdown 笔记（源码 / 分屏 / 预览）
- HTTP 客户端（发送请求、查看响应）
- 命令面板（`Ctrl+K`）
- 浅色 / 深色主题切换

---

### 方式二：Linux 桌面端直接运行

进入 `03-Linux桌面包/` 目录，执行：

```bash
chmod +x SnippetVault-1.0.0.AppImage
./SnippetVault-1.0.0.AppImage
```

桌面端专属功能：
- 全局快捷键 `Ctrl+Shift+Space` 呼出快启搜索
- 系统托盘常驻
- 本地 SQLite 数据库
- 多窗口架构（主管理器 / 快启 / 预览）

---

## 从源码构建

如需从源码运行或打包其他平台，请确保已安装：

- Node.js `>= 18`
- npm `>= 9`

### 1. 安装依赖

```bash
cd 01-源码/
npm install
```

### 2. 运行 Web 开发模式

```bash
npm run dev:web
```

浏览器自动打开 `http://localhost:5173`

### 3. 运行 Electron 桌面开发模式

```bash
npm run dev
```

### 4. 构建生产版本

```bash
# Web 静态包
npm run build:web

# Electron 生产构建
npm run build

# 打包为可执行文件（当前系统平台）
npm run dist
```

### 5. 跨平台打包说明

当前 Linux 环境可直接生成 Linux AppImage。如需生成 Windows / macOS 安装包：

- **Windows**：在 Windows 系统上执行 `npm install && npm run dist`，输出 `.exe`
- **macOS**：在 macOS 系统上执行 `npm install && npm run dist`，输出 `.dmg` 或 `.app`

> Electron 支持交叉编译，但需额外配置 Wine（Windows）等工具链，建议在目标系统上直接打包。

---

## 项目亮点

- **双端统一**：同一套 Vue 3 代码同时支持 Electron 桌面端与 Web/PWA
- **双数据库**：桌面端 SQLite（better-sqlite3）/ Web 端 IndexedDB
- **自定义插图**：Notion 风格 3D 手绘空状态插图（背景去除 + 透明 PNG）
- **CodeMirror 6**：15+ 语言动态加载，自定义 GitHub 风格语法高亮与主题
- **微交互系统**：柔光光标、Material 涟漪、浮动动画、拖拽排序
- **截图导出**：Carbon 风格代码截图生成器（渐变背景 + 窗口控件 + 2× PNG）
- **代码沙箱**：HTML/CSS/JS iframe 实时运行与控制台输出捕获

---

## 技术栈

Vue 3 · Pinia · Vite · Electron 30 · CodeMirror 6 · markdown-it · better-sqlite3 · IndexedDB · html-to-image · Playwright

---

## GitHub 仓库

https://github.com/RollingTheRock/snippet-vault
