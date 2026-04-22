# To-Do List MVP (Inspired by Microsoft To-Do)

这是一个跨平台的待办事项管理工具 MVP。

## 技术栈
- **后端**: Python + FastAPI + SQLModel (SQLite/PostgreSQL)
- **前端**: React + Tailwind CSS + Lucide React + Zustand
- **目标平台**: Web, macOS, iOS, Android

## 目录结构
- `/backend`: FastAPI 后端接口
- `/frontend`: Flet 前端应用
- `PRD.md`: 产品需求文档
- `Architecture.md`: 技术架构文档

## 如何运行

### 1. 运行后端 (API)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
后端 API 将运行在 `http://127.0.0.1:8000`

### 2. 运行前端 (Web)
```bash
cd frontend
npm install
npm run dev
```
前端开发服务器将运行在 `http://localhost:5173`

## 开发路线
1. [x] 项目初始化
2. [ ] 后端任务 CRUD 接口开发
3. [ ] 前端 UI 深度复刻 (Microsoft To-Do 样式)
4. [ ] 前后端联调 (云端同步)
5. [ ] 打包为 macOS/iOS 应用
