import { create } from 'zustand'
import type { PersistStorage } from 'zustand/middleware'
import { createJSONStorage, persist } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

import type { Filter, FilterStatus, NewTaskInput, Task } from '../types'
import { DEFAULT_FILTER } from '../types'
import { buildTask } from '../utils/taskModel'

export type TodoState = {
  tasks: Task[]
  filter: Filter
}

export type TodoActions = {
  addTask: (input: NewTaskInput) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  clearCompleted: () => void
  setStatus: (status: FilterStatus) => void
  setCategory: (category: string | null) => void
}

export type TodoStore = TodoState & TodoActions

export function selectFilteredTasks(tasks: Task[], filter: Filter): Task[] {
  const hasStatusFilter = filter.status !== 'all'
  const hasCategoryFilter = filter.category !== null

  if (!hasStatusFilter && !hasCategoryFilter) return tasks

  return tasks.filter((task) => {
    if (hasCategoryFilter && task.category !== filter.category) return false
    if (!hasStatusFilter) return true
    return filter.status === 'completed' ? task.completed : !task.completed
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
        version: 1,
        storage,
        partialize: (state) => ({ tasks: state.tasks, filter: state.filter }),
      },
    ),
  )
}

export const useTodoStore = createTodoStore()

export { shallow }
