import { create } from 'zustand'
import { taskApi } from './api'

const useTodoStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const response = await taskApi.getTasks()
      set({ tasks: response.data, loading: false })
    } catch (err) {
      set({ error: '获取任务失败', loading: false })
    }
  },

  addTask: async (title) => {
    try {
      const response = await taskApi.createTask({ title })
      set((state) => ({
        tasks: [...state.tasks, response.data]
      }))
    } catch (err) {
      set({ error: '添加任务失败' })
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    try {
      const response = await taskApi.updateTask(id, { is_completed: !task.is_completed })
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? response.data : t)
      }))
    } catch (err) {
      set({ error: '更新任务失败' })
    }
  },

  toggleImportant: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    try {
      const response = await taskApi.updateTask(id, { is_important: !task.is_important })
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? response.data : t)
      }))
    } catch (err) {
      set({ error: '更新重要性失败' })
    }
  },

  deleteTask: async (id) => {
    try {
      await taskApi.deleteTask(id)
      set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }))
    } catch (err) {
      set({ error: '删除任务失败' })
    }
  },
}))

export default useTodoStore
