# SnippetVault 设计文档

## 项目概述

SnippetVault 是一个基于 Electron + Vue 3 的代码片段管理工具，定位为"Raycast 式快启代码库"。用户通过全局快捷键呼出浮动搜索框，快速查找、复制和预览代码片段。同时提供完整的主管理窗口用于片段的增删改查和标签管理。

核心亮点：
- 全局快捷键快启（类似 Spotlight）
- HTML/CSS/JS 实时预览（可多开对比）
- 纯标签系统组织（无文件夹层级）
- 深色编辑器风格 UI

## 功能范围

### 核心功能（Must Have）

1. **快启搜索框**
   - 全局快捷键 Alt+Space 呼出/隐藏
   - 屏幕中央浮动，无标题栏，失焦自动隐藏
   - 实时模糊搜索（匹配标题、内容、标签）
   - `#tag` 语法筛选标签
   - Enter 复制到剪贴板，Cmd/Ctrl+Enter 打开预览
   - 底部快捷键提示栏

2. **主管理窗口**
   - 三栏布局：片段列表 | 编辑器 | 信息栏
   - 片段 CRUD：新建、编辑、保存、删除
   - 标签管理：增删改查、颜色设置
   - 语言选择：15 种常用编程语言
   - 导入/导出功能（JSON 格式）
   - 关闭窗口仅隐藏，不退出应用

3. **预览窗口**
   - 独立浮动 BrowserWindow，可多开
   - 渲染 HTML/CSS/JS 代码片段
   - 自定义标题栏（适配 Linux/Fedora）
   - 刷新、复制、新窗口操作按钮
   - 安全限制：禁用外部请求、alert/confirm

4. **系统托盘**
   - 应用启动后常驻托盘
   - 右键菜单：快启搜索 / 管理窗口 / 退出
   - 点击图标打开管理窗口

### 扩展功能（Nice to Have）

- 复制次数统计
- 最近使用排序
- 代码片段模板（新建时选择模板）
- 深色/浅色主题切换

## 架构设计

### 窗口架构

应用包含 3 种窗口类型：

| 窗口 | 类型 | 数量 | 作用 |
|------|------|------|------|
| 快启搜索框 | frameless BrowserWindow | 1 | 全局快捷键呼出，快速搜索和操作 |
| 主管理窗口 | frameless BrowserWindow | 1 | 片段的完整 CRUD 管理 |
| 预览窗口 | frameless BrowserWindow | N | 渲染 HTML/CSS/JS 片段，可多开 |

### 交互流转

```
Alt+Space → 快启搜索框（中央浮动）
  ↓ 输入搜索
  ↓ Enter → 主进程 → 剪贴板 → 隐藏窗口
  ↓ Cmd+Enter → 主进程 → 创建预览窗口 → 注入代码
  ↓ Cmd+M / 托盘点击 → 显示主管理窗口
```

### 数据流转

```
渲染进程(Vue) ←→ IPC ←→ 主进程(Node.js) ←→ better-sqlite3 ←→ SQLite DB
```

## 数据模型

### SQLite Schema

```sql
-- snippets 表（代码片段）
CREATE TABLE snippets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  copy_count INTEGER DEFAULT 0
);

CREATE INDEX idx_snippets_title ON snippets(title);
CREATE INDEX idx_snippets_language ON snippets(language);

-- tags 表（标签）
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at INTEGER
);

-- snippet_tags 表（多对多关联）
CREATE TABLE snippet_tags (
  snippet_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (snippet_id, tag_id),
  FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 支持的语言

| 语言 | 标识 | 预览支持 |
|------|------|----------|
| HTML | html | 是 |
| CSS | css | 是 |
| JavaScript | javascript | 是 |
| TypeScript | typescript | 是 |
| Vue | vue | 是 |
| Python | python | 否 |
| Java | java | 否 |
| Go | go | 否 |
| Rust | rust | 否 |
| C++ | cpp | 否 |
| C# | csharp | 否 |
| SQL | sql | 否 |
| Shell | shell | 否 |
| Ruby | ruby | 否 |
| JSON | json | 否 |

## UI 设计

### 视觉风格

- **主题**：深色编辑器风格（VS Code 感）
- **主色调**：#1e1e1e（背景）、#252526（面板）、#3c3c3c（边框）
- **强调色**：#4a9eff（蓝色交互）、#c586c0（紫色标识）
- **字体**：系统默认无衬线 + Fira Code（代码）
- **图标**：SVG 图标（不用 emoji）
- **圆角**：窗口 8-12px，按钮 4px，标签 12px

### 快启搜索框

- 尺寸：560px 宽，自适应高度（最大 400px）
- 位置：屏幕正中央
- 结构：搜索输入区 → 标签筛选栏 → 结果列表 → 底部提示栏
- 结果项：图标 + 标题 + 语言标识 + 代码预览 + 标签 + 操作提示
- 键盘导航：↑↓ 选择，Enter 复制，Cmd+Enter 预览，Esc 关闭

### 主管理窗口

- 尺寸：900×650，可调整
- 顶部工具栏：品牌名 + 新建/保存/删除 + 导入/导出
- 左侧边栏（220px）：搜索筛选 + 标签云 + 片段列表
- 中间编辑区：标题输入 + 语言选择 + 标签编辑 + 代码高亮区 + 底部操作栏
- 代码编辑器使用 Shiki 语法高亮

### 预览窗口

- 尺寸：400×300，可调整，可多开
- 自定义标题栏（无系统原生标题栏）
- 右上角：刷新 / 复制 / 新窗口 / 关闭 按钮
- 中间：纯白渲染区域
- 底部：信息栏（渲染类型 + 窗口编号）

## 技术栈

### 运行时

| 技术 | 用途 |
|------|------|
| Electron | 桌面应用框架 |
| Vue 3 | 前端 UI 框架 |
| Vite | 构建工具 |
| Node.js | 运行时 |

### 依赖

| 包名 | 用途 |
|------|------|
| better-sqlite3 | SQLite 同步操作 |
| shiki | 语法高亮（VS Code 引擎） |
| pinia | 状态管理 |
| vue-router | 主窗口路由 |
| @vueuse/core | Vue 工具集合 |

### 开发工具

| 工具 | 用途 |
|------|------|
| electron-vite | Electron + Vite 整合 |
| electron-builder | 应用打包 |

## 项目结构

```
snippet-vault/
├── electron/                 # 主进程代码
│   ├── main.js               # 入口: 窗口管理、IPC、托盘
│   ├── preload.js            # 预加载脚本: 安全暴露 API
│   ├── windows/              # 窗口创建逻辑
│   │   ├── quickLaunch.js    # 快启搜索框
│   │   ├── mainManager.js    # 主管理窗口
│   │   └── preview.js        # 预览窗口
│   ├── db/                   # 数据库层
│   │   ├── index.js          # 连接初始化
│   │   ├── snippets.js       # 片段 CRUD
│   │   └── tags.js           # 标签 CRUD
│   └── ipc/                  # IPC 处理器
│       ├── snippets.js       # 片段相关 IPC
│       └── tags.js           # 标签相关 IPC
├── src/                      # Vue 前端渲染进程
│   ├── main.js               # Vue 应用入口
│   ├── App.vue               # 根组件
│   ├── views/                # 页面视图
│   │   ├── QuickLaunch.vue   # 快启搜索框
│   │   └── MainManager.vue   # 主管理窗口
│   ├── components/           # 可复用组件
│   │   ├── CodeEditor.vue    # 代码编辑器
│   │   ├── SnippetList.vue   # 片段列表
│   │   ├── TagInput.vue      # 标签输入
│   │   └── LanguageSelect.vue # 语言选择
│   ├── stores/               # Pinia 状态
│   │   ├── snippets.js
│   │   └── tags.js
│   └── composables/          # 组合式函数
│       └── useHighlighter.js # Shiki 高亮封装
├── dist/                     # 构建输出
└── package.json
```

## IPC 通信

### 渲染进程 → 主进程 (invoke)

```
snippets:getAll() → Snippet[]
snippets:search(query) → Snippet[]
snippets:create(data) → Snippet
snippets:update(id, data) → Snippet
snippets:delete(id) → boolean
snippets:copyToClipboard(content) → void
tags:getAll() → Tag[]
tags:create(data) → Tag
tags:update(id, data) → Tag
tags:delete(id) → boolean
preview:open(content, language) → void
window:showMainManager() → void
```

### 主进程 → 渲染进程 (on)

```
shortcuts:quickLaunchTriggered → void	snippets:updated → void
```

## 全局快捷键

| 快捷键 | 作用 | 范围 |
|--------|------|------|
| Alt+Space | 呼出/隐藏快启搜索框 | 全局 |
| Esc | 关闭快启搜索框 | 快启框内 |
| Cmd/Ctrl+N | 新建片段 | 主窗口 |
| Cmd/Ctrl+S | 保存当前片段 | 主窗口 |

## 系统托盘

- 应用启动后自动创建托盘图标
- 左键点击：打开主管理窗口
- 右键菜单：
  - 打开快启搜索
  - 打开管理窗口
  - 分隔线
  - 退出

## 安全考虑

1. **预览窗口隔离**
   - 禁用 `nodeIntegration`
   - 禁用 `contextIsolation: false`
   - 设置 CSP 限制外部资源加载
   - 禁用 `alert`/`confirm`/`prompt`

2. **IPC 安全**
   - 通过 preload 脚本暴露有限 API
   - 主进程验证所有输入参数
   - 不直接暴露 Node.js API 给渲染进程

3. **数据安全**
   - SQLite 数据库存放在应用用户数据目录
   - 导出/导入使用用户选择的文件路径

## 实现优先级

### Phase 1：核心骨架
1. Electron + Vue 3 + Vite 项目搭建
2. SQLite 数据库初始化
3. 主管理窗口基础布局
4. 片段的增删改查

### Phase 2：快启体验
1. 快启搜索框窗口
2. 全局快捷键注册
3. 搜索与复制功能
4. 系统托盘

### Phase 3：预览与 polish
1. 预览窗口
2. 语法高亮集成
3. 标签系统完善
4. 导入/导出
5. UI 细节打磨
