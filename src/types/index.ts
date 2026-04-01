export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const FILTER_STATUSES = ['all', 'completed', 'pending'] as const
export type FilterStatus = (typeof FILTER_STATUSES)[number]

export interface Task {
  id: string
  name: string
  deadline: string | null
  category: string
  priority: TaskPriority
  completed: boolean
  createdAt: number
}

export interface Filter {
  status: FilterStatus
  category: string | null
}

export const DEFAULT_CATEGORY = '默认'
export const DEFAULT_PRIORITY: TaskPriority = 'medium'
export const DEFAULT_FILTER: Filter = { status: 'all', category: null }

export interface NewTaskInput {
  name: string
  deadline?: string | null
  category?: string
  priority?: TaskPriority
}
