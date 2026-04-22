# 技术架构设计文档 (Architecture)

## 1. 总体架构图
本系统采用 **前后端分离 (Decoupled)** 的架构，后端提供统一的 RESTful API 供多端调用。

```text
[ 客户端层 ]
  ├── Web 端 (React + Tailwind)
  ├── 微信小程序 (Taro/React)
  └── macOS/iOS (React Native 或 SwiftUI)
       ↓
[ 接入层 ]
  └── Nginx / API Gateway (负责负载均衡与 SSL)
       ↓
[ 业务逻辑层 ]
  └── FastAPI (Python) 
       ├── Auth Service (JWT)
       ├── Task Service (CRUD)
       └── Sync Service (多端同步逻辑)
       ↓
[ 数据层 ]
  ├── PostgreSQL (主数据库)
  └── Redis (缓存与提醒队列)
```

## 2. 详细技术栈选型

### 2.1 后端 (Backend)
- **框架**: **FastAPI** (Python)
  - **理由**: 你的主语言是 Python；FastAPI 支持异步 (asyncio)，性能极高；自动生成 OpenAPI 文档，方便多端对接。
- **数据库**: **PostgreSQL**
  - **理由**: 关系型数据库，适合存储结构化的任务、子步骤和用户信息。
- **ORM**: **SQLModel** (或 SQLAlchemy + Pydantic)
  - **理由**: 与 FastAPI 深度集成，类型安全，代码简洁。
- **认证**: **JWT (JSON Web Token)**
  - **理由**: 无状态，一套 Token 可以在 Web、小程序和移动端通用。

### 2.2 前端 (Web MVP)
- **框架**: **React 18**
- **构建工具**: **Vite** (启动和热更新极快)
- **样式**: **Tailwind CSS**
  - **理由**: 能够精准控制 UI 细节，复刻 Microsoft To-Do 的阴影、圆角和布局。
- **状态管理**: **Zustand**
  - **理由**: 比 Redux 轻量，适合待办事项这种逻辑相对集中的应用。

### 2.3 多端适配策略 (Future)
- **微信小程序**: 使用 **Taro (React 语法)**
  - **策略**: 抽离 Web 端的业务逻辑 (Hooks)，在 Taro 项目中复用。
- **macOS/iOS**: 
  - **短期方案**: **Electron** (macOS) 或 **Capacitor** (iOS) 快速将 Web 打包。
  - **长期方案**: **React Native** (共享 80% 代码) 或 **SwiftUI** (追求极致的原生性能和灵动岛/小组件集成)。

## 3. 核心数据模型设计 (Draft)

### User (用户)
- `id`: UUID
- `email`: String (Unique)
- `hashed_password`: String
- `created_at`: DateTime

### Task (任务)
- `id`: UUID
- `user_id`: ForeignKey(User.id)
- `title`: String
- `is_completed`: Boolean
- `is_important`: Boolean
- `due_date`: DateTime (Nullable)
- `reminder_at`: DateTime (Nullable)
- `repeat_rule`: String (JSON: {type: 'daily', interval: 1})
- `notes`: Text
- `list_id`: ForeignKey(List.id)

### SubTask (子步骤)
- `id`: UUID
- `task_id`: ForeignKey(Task.id)
- `title`: String
- `is_completed`: Boolean

### List (清单/列表)
- `id`: UUID
- `user_id`: ForeignKey(User.id)
- `name`: String
- `icon`: String
- `group_id`: ForeignKey(Group.id, Nullable)

## 4. 关键流程设计

### 4.1 多端同步机制
1. 客户端操作后，先更新本地缓存（实现秒开、离线可用）。
2. 发起 API 请求，后端处理后返回最新的 `updated_at`。
3. 其他端在唤醒时，拉取增量更新。

### 4.2 提醒系统
- 使用 **Redis + Celery/TaskIQ** 监听 `reminder_at` 时间点。
- 通过 **WebSocket** (Web 端) 或 **微信模板消息/Push Notification** (小程序/iOS) 推送通知。
