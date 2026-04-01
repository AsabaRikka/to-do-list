import { create } from 'zustand'
import type { PersistStorage } from 'zustand/middleware'
import { createJSONStorage, persist } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

import type { Filter, FilterStatus, NewTaskInput, Task, TaskPriority } from '../types'
import { DEFAULT_FILTER, FILTER_STATUSES, TASK_PRIORITIES } from '../types'
import { buildTask, normalizeRemark } from '../utils/taskModel'

export type TodoState = {
  tasks: Task[]
  filter: Filter
}

export type TodoActions = {
  addTask: (input: NewTaskInput) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  updateTaskRemark: (id: string, remark: string) => void
  clearCompleted: () => void
  setStatus: (status: FilterStatus) => void
  setCategory: (category: string | null) => void
}

export type TodoStore = TodoState & TodoActions

export function selectFilteredTasks(tasks: Task[], filter: Filter): Task[] {
  const hasStatusFilter = filter.status !== 'all'
  const hasCategoryFilter = filter.category !== null

  const base =
    !hasStatusFilter && !hasCategoryFilter
      ? tasks
      : tasks.filter((task) => {
          if (hasCategoryFilter && task.category !== filter.category) return false
          if (!hasStatusFilter) return true
          return filter.status === 'completed' ? task.completed : !task.completed
        })

  const deadlineTime = (value: string | null): number | null => {
    if (value === null) return null
    const t = new Date(value).getTime()
    return Number.isNaN(t) ? null : t
  }

  return base.slice().sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1

    const aDeadline = deadlineTime(a.deadline)
    const bDeadline = deadlineTime(b.deadline)

    if (aDeadline === null && bDeadline !== null) return 1
    if (aDeadline !== null && bDeadline === null) return -1
    if (aDeadline !== null && bDeadline !== null && aDeadline !== bDeadline) {
      return aDeadline - bDeadline
    }

    if (a.createdAt !== b.createdAt) return b.createdAt - a.createdAt

    return a.id.localeCompare(b.id)
  })
}

export function selectStats(tasks: Task[]): {
  total: number
  completed: number
  pending: number
  completionRate: number
} {
  const total = tasks.length
  const completed = tasks.reduce((acc, task) => acc + (task.completed ? 1 : 0), 0)
  const pending = total - completed
  const completionRate = total === 0 ? 0 : completed / total

  return { total, completed, pending, completionRate }
}

export function selectCategories(tasks: Task[]): string[] {
  const unique = new Set<string>()
  for (const task of tasks) {
    const category = task.category.trim()
    if (category.length > 0) unique.add(category)
  }

  return Array.from(unique).sort((a, b) => a.localeCompare(b))
}

type CreateTodoStoreOptions = {
  storageKey?: string
  storage?: PersistStorage<Pick<TodoStore, 'tasks' | 'filter'>>
}

export function createTodoStore(options: CreateTodoStoreOptions = {}) {
  const storageKey = options.storageKey ?? 'todo.m1.v1'
  const storage =
    options.storage ?? createJSONStorage(() => localStorage as Storage)

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const toTaskPriority = (value: unknown): TaskPriority => {
    return TASK_PRIORITIES.includes(value as TaskPriority)
      ? (value as TaskPriority)
      : 'medium'
  }

  const toTask = (value: unknown): Task | null => {
    if (!isRecord(value)) return null

    const id = typeof value.id === 'string' ? value.id : null
    const name = typeof value.name === 'string' ? value.name : null
    const category = typeof value.category === 'string' ? value.category : null
    const completed = typeof value.completed === 'boolean' ? value.completed : null
    const createdAt = typeof value.createdAt === 'number' ? value.createdAt : null

    if (!id || !name || !category || completed === null || createdAt === null) {
      return null
    }

    const deadline =
      value.deadline === null || typeof value.deadline === 'string'
        ? (value.deadline as string | null)
        : null

    const remark =
      typeof value.remark === 'string' ? normalizeRemark(value.remark) : ''

    return {
      id,
      name,
      deadline,
      category,
      priority: toTaskPriority(value.priority),
      completed,
      createdAt,
      remark,
    }
  }

  const toFilter = (value: unknown): Filter => {
    if (!isRecord(value)) return DEFAULT_FILTER
    const status = FILTER_STATUSES.includes(value.status as FilterStatus)
      ? (value.status as FilterStatus)
      : DEFAULT_FILTER.status
    const category =
      value.category === null || typeof value.category === 'string'
        ? (value.category as string | null)
        : DEFAULT_FILTER.category
    return { status, category }
  }

  const toPersisted = (
    value: unknown,
  ): Pick<TodoStore, 'tasks' | 'filter'> | null => {
    if (!isRecord(value)) return null
    if (!Array.isArray(value.tasks)) return null
    const tasks = value.tasks.map(toTask).filter((t): t is Task => t !== null)
    const filter = toFilter(value.filter)
    return { tasks, filter }
  }

  return create<TodoStore>()(
    persist(
      (set) => ({
        tasks: [],
        filter: DEFAULT_FILTER,

        addTask: (input) => {
          const newTask = buildTask(input)
          set((state) => ({ tasks: [newTask, ...state.tasks] }))
        },

        toggleTask: (id) => {
          set((state) => {
            let updated = false
            const tasks = state.tasks.map((task) => {
              if (task.id !== id) return task
              updated = true
              return { ...task, completed: !task.completed }
            })
            return updated ? { tasks } : state
          })
        },

        deleteTask: (id) => {
          set((state) => {
            const tasks = state.tasks.filter((task) => task.id !== id)
            return tasks.length === state.tasks.length ? state : { tasks }
          })
        },

        updateTaskRemark: (id, remark) => {
          const normalized = normalizeRemark(remark)
          set((state) => {
            let updated = false
            const tasks = state.tasks.map((task) => {
              if (task.id !== id) return task
              if (task.remark === normalized) return task
              updated = true
              return { ...task, remark: normalized }
            })
            return updated ? { tasks } : state
          })
        },

        clearCompleted: () => {
          set((state) => {
            const tasks = state.tasks.filter((task) => !task.completed)
            return tasks.length === state.tasks.length ? state : { tasks }
          })
        },

        setStatus: (status) => {
          set((state) =>
            state.filter.status === status
              ? state
              : { filter: { ...state.filter, status } },
          )
        },

        setCategory: (category) => {
          const next =
            category === null
              ? null
              : category.trim().length > 0
                ? category.trim()
                : null

          set((state) =>
            state.filter.category === next
              ? state
              : { filter: { ...state.filter, category: next } },
          )
        },
      }),
      {
        name: storageKey,
        version: 2,
        storage,
        partialize: (state) => ({ tasks: state.tasks, filter: state.filter }),
        migrate: (persistedState, persistedVersion) => {
          if (persistedVersion === 1) {
            const v1 = toPersisted(persistedState)
            return v1 ?? { tasks: [], filter: DEFAULT_FILTER }
          }

          const v2 = toPersisted(persistedState)
          return v2 ?? { tasks: [], filter: DEFAULT_FILTER }
        },
        merge: (persistedState, currentState) => {
          const safe = toPersisted(persistedState)
          return safe ? { ...currentState, ...safe } : currentState
        },
      },
    ),
  )
}

export const useTodoStore = createTodoStore()

export { shallow }
