import type { NewTaskInput, Task, TaskPriority } from '../types'
import { DEFAULT_CATEGORY, DEFAULT_PRIORITY, TASK_PRIORITIES } from '../types'

export function createTaskId(): string {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeCategory(value?: string | null): string {
  const category = (value ?? '').trim()
  return category.length > 0 ? category : DEFAULT_CATEGORY
}

export function normalizeDeadline(value?: string | null): string | null {
  const deadline = (value ?? '').trim()
  return deadline.length > 0 ? deadline : null
}

export function normalizePriority(value?: TaskPriority | null): TaskPriority {
  return TASK_PRIORITIES.includes(value ?? DEFAULT_PRIORITY)
    ? (value ?? DEFAULT_PRIORITY)
    : DEFAULT_PRIORITY
}

export function normalizeRemark(value?: string | null): string {
  const remark = (value ?? '').trim()
  return remark.length > 0 ? remark : ''
}

export function buildTask(input: NewTaskInput): Task {
  const name = input.name.trim()
  if (name.length === 0) {
    throw new Error('Task name is required')
  }

  return {
    id: createTaskId(),
    name,
    deadline: normalizeDeadline(input.deadline),
    category: normalizeCategory(input.category),
    priority: normalizePriority(input.priority),
    completed: false,
    createdAt: Date.now(),
    remark: normalizeRemark(input.remark),
  }
}
