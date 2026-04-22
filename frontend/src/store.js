import { create } from 'zustand'
import { taskApi, authApi } from './api'

const useTodoStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isAdmin: false,
  allUsers: [],
  tasks: [],
  lists: [],
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await authApi.login(email, password)
      localStorage.setItem('token', response.data.access_token)
      
      // 获取用户信息以确认是否为管理员
      const userResponse = await authApi.getMe()
      set({ 
        isAuthenticated: true, 
        user: userResponse.data,
        isAdmin: userResponse.data.is_admin,
        loading: false 
      })
      
      await get().fetchTasks()
      await get().fetchLists()
    } catch (err) {
      set({ error: '登录失败，请检查邮箱和密码', loading: false })
      throw err
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null })
    try {
      await authApi.register(email, password)
      set({ loading: false })
    } catch (err) {
      set({ error: '注册失败，该邮箱可能已被注册', loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false, isAdmin: false, tasks: [], lists: [], allUsers: [] })
  },

  fetchAdminData: async () => {
    if (!get().isAdmin) return
    try {
      const response = await authApi.getAllUsers()
      set({ allUsers: response.data })
    } catch (err) {
      console.error('获取用户列表失败')
    }
  },

  deleteUser: async (userId) => {
    try {
      await authApi.deleteUser(userId)
      set((state) => ({
        allUsers: state.allUsers.filter(u => u.id !== userId)
      }))
    } catch (err) {
      set({ error: '删除用户失败' })
    }
  },

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const response = await taskApi.getTasks()
      set({ tasks: response.data, loading: false })
    } catch (err) {
      set({ error: '获取任务失败', loading: false })
    }
  },

  fetchLists: async () => {
    try {
      const response = await taskApi.getLists()
      set({ lists: response.data })
    } catch (err) {
      set({ error: '获取列表失败' })
    }
  },

  addTask: async (title, listId = null) => {
    try {
      const response = await taskApi.createTask({ title, todo_list_id: listId })
      set((state) => ({
        tasks: [...state.tasks, response.data]
      }))
    } catch (err) {
      set({ error: '添加任务失败' })
    }
  },

  addList: async (name) => {
    try {
      const response = await taskApi.createList({ name })
      set((state) => ({
        lists: [...state.lists, response.data]
      }))
      return response.data
    } catch (err) {
      set({ error: '创建列表失败' })
    }
  },

  deleteList: async (id) => {
    try {
      await taskApi.deleteList(id)
      set((state) => ({
        lists: state.lists.filter(l => l.id !== id),
        tasks: state.tasks.filter(t => t.todo_list_id !== id)
      }))
    } catch (err) {
      set({ error: '删除列表失败' })
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

  updateTask: async (id, data) => {
    try {
      const response = await taskApi.updateTask(id, data)
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? response.data : t)
      }))
    } catch (err) {
      set({ error: '更新任务失败' })
    }
  },

  // SubTasks
  addSubTask: async (taskId, title) => {
    try {
      const response = await taskApi.createSubTask(taskId, { title, task_id: taskId })
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, subtasks: [...(t.subtasks || []), response.data] } 
            : t
        )
      }))
    } catch (err) {
      set({ error: '添加子任务失败' })
    }
  },

  toggleSubTask: async (taskId, subtaskId) => {
    const task = get().tasks.find(t => t.id === taskId)
    const subtask = task?.subtasks?.find(s => s.id === subtaskId)
    if (!subtask) return

    try {
      const response = await taskApi.updateSubTask(subtaskId, { is_completed: !subtask.is_completed })
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? response.data : s) } 
            : t
        )
      }))
    } catch (err) {
      set({ error: '更新子任务失败' })
    }
  },

  deleteSubTask: async (taskId, subtaskId) => {
    try {
      await taskApi.deleteSubTask(subtaskId)
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) } 
            : t
        )
      }))
    } catch (err) {
      set({ error: '删除子任务失败' })
    }
  },
}))

export default useTodoStore
