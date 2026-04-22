import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_URL,
})

export const taskApi = {
  getTasks: () => api.get('/tasks/'),
  createTask: (task) => api.post('/tasks/', task),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  // SubTasks
  createSubTask: (taskId, subtask) => api.post(`/tasks/${taskId}/subtasks/`, subtask),
  updateSubTask: (id, data) => api.patch(`/subtasks/${id}`, data),
  deleteSubTask: (id) => api.delete(`/subtasks/${id}`),
  // Lists
  getLists: () => api.get('/lists/'),
  createList: (list) => api.post('/lists/', list),
  updateList: (id, data) => api.patch(`/lists/${id}`, data),
  deleteList: (id) => api.delete(`/lists/${id}`),
}

export default api
