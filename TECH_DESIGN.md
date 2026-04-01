# TECH_DESIGN.md

## 技术栈

### 前端技术栈
- **React**: 用于构建用户界面，提供组件化开发。
- **TypeScript**: 提供类型安全，提高代码质量和开发效率。
- **Vite**: 快速的构建工具，支持热重载和现代开发体验。
- **Tailwind CSS**: 实用优先的CSS框架，用于快速样式设计。
- **localStorage**: 用于本地数据存储，实现无后端的数据持久化。

### 开发工具
- **ESLint**: 代码质量检查。
- **Prettier**: 代码格式化。

## 项目结构

```
todo-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── TaskForm.tsx          # 任务添加表单组件
│   │   ├── TaskList.tsx          # 任务列表组件
│   │   ├── TaskItem.tsx          # 单个任务项组件
│   │   ├── FilterBar.tsx         # 分类筛选栏组件
│   │   └── Stats.tsx             # 统计数据组件
│   ├── hooks/
│   │   └── useTasks.ts           # 自定义Hook管理任务状态
│   ├── types/
│   │   └── index.ts              # TypeScript类型定义
│   ├── utils/
│   │   └── storage.ts            # localStorage工具函数
│   ├── App.tsx                   # 主应用组件
│   ├── main.tsx                  # 应用入口
│   └── index.css                 # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 数据模型

### 任务数据结构
```typescript
interface Task {
  id: string;              // 唯一标识符
  name: string;            // 任务名称
  deadline: Date | null;   // 截止时间
  category: string;        // 分类
  priority: 'low' | 'medium' | 'high';  // 优先级
  completed: boolean;      // 完成状态
  createdAt: Date;         // 创建时间
}
```

### 应用状态
- 任务列表：`Task[]`
- 当前筛选条件：`{ status: 'all' | 'completed' | 'pending', category: string | null }`

## 关键技术点

### 1. 状态管理
使用React的useState和useEffect Hook管理任务状态，通过localStorage实现数据持久化。自定义Hook `useTasks` 封装状态逻辑。

### 2. 数据存储
利用localStorage进行客户端数据存储，数据以JSON格式序列化存储。提供工具函数处理数据的读取、写入和初始化。

### 3. 组件设计
采用组件化架构，TaskForm负责任务添加，TaskList展示任务列表，FilterBar处理筛选，Stats显示统计信息。组件间通过props传递数据和回调函数。

### 4. 类型安全
使用TypeScript定义接口和类型，确保数据结构的一致性和代码的可维护性。

### 5. 样式设计
使用Tailwind CSS进行响应式设计，确保在不同设备上的一致体验。

### 6. 性能优化
- 使用React.memo优化组件渲染
- 合理使用useCallback和useMemo避免不必要的重新计算

### 7. 用户体验
- 支持键盘快捷键快速添加任务
- 提供任务完成动画反馈
- 响应式设计适配移动端