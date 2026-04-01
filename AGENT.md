# AGENT.md

## 项目概述

本项目是一个待办清单应用的MVP版本，聚焦用户在线整理待办清单的核心需求，提供简单、高效的任务管理功能，并对齐参考截图的两列固定布局风格。项目采用前后端分离：前端负责 UI 与交互，后端负责认证与数据存储，数据库本地优先使用 SQLite，未来可迁移至 MySQL。

项目目标：快速开发MVP版本，满足基础任务记录与管理需求，降低开发成本，确保核心功能可用。

## 开发规范

### 技术栈要求
- 前端：React + TypeScript + Vite、Tailwind CSS、Zustand
- 后端：Node.js + Express（建议 TypeScript）
- 数据库：SQLite（本地）+ MySQL（未来可选迁移目标）
- 认证：JWT（Authorization: Bearer <token>）
- 开发工具：ESLint、Prettier
- 测试（前端）：Vitest + React Testing Library

### 项目结构规范
遵循TECH_DESIGN.md中定义的项目结构：
- `src/components/`：存放React组件
- `src/types/`：TypeScript类型定义
- `src/utils/`：工具函数
- `src/store/`：Zustand store 与 selectors
- `server/`：后端代码（后续实现时新增）
- 组件命名：PascalCase，如TaskForm.tsx
- 文件命名：kebab-case，如task-form.tsx（若适用）

### 版本控制
- 使用Git进行版本管理
- 分支策略：main分支为主分支，feature分支开发新功能
- 提交信息：使用英文，格式如"feat: add task completion feature"

## 代码风格

### TypeScript规范
- 使用严格模式（strict: true）
- 定义接口和类型，避免any类型
- 函数参数和返回值类型明确标注
- 使用枚举或联合类型定义常量

### React规范
- 使用函数组件和Hooks
- 组件props使用interface定义
- 事件处理函数命名：handle + Event，如handleSubmit
- 使用useCallback和useMemo优化性能

### 样式规范
- 使用Tailwind CSS类名
- 响应式设计：使用sm/md/lg断点
- 颜色和间距使用Tailwind预设值
- 避免内联样式，优先使用className

### 代码质量
- 使用ESLint和Prettier自动格式化
- 代码注释：复杂逻辑添加注释
- 变量命名：驼峰式（camelCase），常量大写下划线（UPPER_SNAKE_CASE）

## 测试要求

### 单元测试
- 使用 Vitest + React Testing Library
- 组件测试：测试渲染、交互、状态变化
- Store/工具函数测试：测试 selectors、序列化与输入归一化等工具函数

### 集成测试
- 测试核心功能流程：添加任务 -> 筛选 -> 完成任务 -> 统计
- 数据持久化测试：验证本地 token / UI 状态持久化（如实现），以及后端 API 读写一致性

### 测试覆盖率
- 目标覆盖率：组件80%，Store/工具函数90%
- 覆盖率报告为可选（如后续引入 coverage provider 再启用）

### 测试运行
- 开发阶段：npm run test:watch
- CI/CD：npm run test -- --run

## 注意事项

### MVP聚焦
- 仅实现PRD中定义的核心功能，避免功能膨胀
- 优先保证功能可用性，性能优化其次

### 数据存储限制
- SQLite 本地数据库默认仅用于开发环境；生产环境可迁移至 MySQL
- 前端 localStorage 仅用于保存 token/少量 UI 状态，避免存储大量业务数据
- 注意数据序列化/反序列化时的类型安全（仅存可 JSON 序列化 primitives）

### 性能考虑
- 任务数量不宜过多，建议限制在1000以内
- 使用React.memo和useMemo优化渲染
- 避免不必要的re-render

### 用户体验
- 提供加载状态和错误处理
- 支持键盘导航和无障碍访问
- 移动端适配，确保触摸友好

### 安全注意
- 账号体系涉及安全：
  - 密码必须哈希存储（建议 bcrypt）
  - JWT_SECRET 通过环境变量配置
  - 防止 SQL 注入（优先使用 ORM/参数化查询）
  - 配置 CORS 与输入校验（422）
- 避免在 localStorage 存储敏感信息（仅存 access token 时需评估 XSS 风险；后续可升级为 httpOnly cookie）

### 扩展性
- 设计组件时考虑可复用性
- 为未来添加后端预留接口（如API调用）

### 部署
- 使用Vite构建生产版本
- 静态部署到CDN或静态主机
- 考虑PWA功能增强用户体验
