# TECH_DESIGN.md

## 技术栈（全栈）

### 前端
- **React + TypeScript + Vite**
- **Tailwind CSS**
- **Zustand**：单一数据源 + selectors
- **测试**：Vitest + React Testing Library
- **代码质量**：ESLint + Prettier

### 后端
- **Node.js + Express**
- 建议后端同样使用 TypeScript（便于共享类型与提升可维护性）

### 数据库
- **本地开发：SQLite**（文件库，零依赖，启动快）
- **未来生产：MySQL（可选迁移目标）**

### 认证
- **JWT（JSON Web Token）**
- 约定：`Authorization: Bearer <token>`

## 目标 UI（截图对齐）

页面采用两列固定布局：
- 左侧：固定宽度导航栏（用户信息/搜索/智能分类/待办集）
- 右侧：自适应内容区（标题区/任务列表/底部添加入口）

计数展示规则：
- 不再有独立 Stats 模块
- 左侧分类与待办集标题后直接显示数量（默认口径为“未完成数”，已完成分类显示完成数）

移动端：
- 左侧栏采用抽屉（drawer）显示，避免挤压右侧内容区

## 工程结构（建议）

当前仓库已存在前端应用（`src/`）。后端建议新增目录 `server/`（后续实现时落地）：

```
repo/
├── src/                    # 前端（Vite）
├── public/
├── server/                 # 后端（Express）
│   ├── src/
│   │   ├── app.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db/
│   │   └── utils/
│   └── .env.example
└── ...
```

开发环境建议：
- 前端通过环境变量配置 API Base URL
- 或在 Vite 中配置 dev proxy，将 `/api` 代理到后端

## 数据模型（面向截图功能）

> 约定：应用层与 API 层均使用 **JSON primitives**；不直接存 `Date` 对象。

### User
- `id: string`
- `email: string`
- `name: string`
- `avatarUrl: string | null`
- `createdAt: number`

### TodoList（待办集）
- `id: string`
- `userId: string`
- `name: string`
- `createdAt: number`

### Task（任务）
- `id: string`
- `userId: string`
- `listId: string`
- `name: string`
- `remark: string`（空字符串表示无备注，支持多行）
- `deadline: string | null`（datetime-local 原始值，如 `2026-04-01T18:30`，不转 ISO、不做时区换算）
- `priority: 'low' | 'medium' | 'high'`
- `completed: boolean`
- `starred: boolean`
- `createdAt: number`
- `updatedAt: number`

## API 设计（最小可实现）

### Auth
- `POST /auth/login` → `{ token }`
- `GET /me` → `User`

### Lists
- `GET /lists` → `TodoList[]`
- `POST /lists` → `TodoList`
- `PATCH /lists/:id` → `TodoList`
- `DELETE /lists/:id` → `204`（级联删除该列表下 tasks；必须鉴权）

### Tasks
- `GET /tasks?view=<today|all|completed|pending|starred>&listId=<id>&q=<keyword>` → `Task[]`
  - 说明：服务端可根据 view/listId/q 过滤；前端可再做轻量排序与展示
- `POST /tasks` → `Task`
- `PATCH /tasks/:id` → `Task`（可更新 name/remark/deadline/priority/completed/starred/listId）
- `DELETE /tasks/:id` → `204`

### 错误约定
- `401`：未登录或 token 无效
- `403`：无权限访问资源
- `404`：资源不存在
- `422`：参数不合法（例如 name 为空）

## 数据库映射（SQLite / MySQL 可迁移）

推荐使用 ORM + migration（例如 Prisma）来实现：
- SQLite 本地快速启动
- 未来切换到 MySQL 时，通过 provider 与迁移文件平滑升级

建议表：
- `users`
- `todo_lists`
- `tasks`（外键：`user_id`、`list_id`，删除列表时级联删除 tasks）

## 前端状态管理与联动（Zustand）

前端以 store 作为唯一数据源，UI 通过 selectors 获取派生值：
- 当前视图（智能分类或待办集）决定右侧标题与任务列表内容
- 左侧计数由 tasks 派生（不单独存统计）
- 搜索在当前视图结果内过滤（标题 + 备注）

本地存储角色（前端）：
- 保存 token/少量 UI 状态（例如最后选中的视图、搜索词）
- tasks/lists 以服务端为准（可选：做本地缓存提升体验，但不作为权威来源）
