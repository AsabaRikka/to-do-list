import { create } from 'zustand'

const useTodoStore = create((set) => ({
  tasks: [
    { id: 1, title: '欢迎使用 To-Do List', is_completed: false, is_important: false },
    { id: 2, title: '点击左侧“我的一天”开始规划', is_completed: false, is_important: true },
  ],
  addTask: (title) => set((state) => ({
    tasks: [...state.tasks, { id: Date.now(), title, is_completed: false, is_important: false }]
  })),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t)
  })),
  toggleImportant: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, is_important: !t.is_important } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
}))

export default useTodoStore
