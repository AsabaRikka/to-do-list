import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTodoStore, selectCategories, selectFilteredTasks, selectStats } from './todoStore'

describe('todoStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('addTask uses defaults and creates serializable task', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1234567890)
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-123' })

    const store = createTodoStore({ storageKey: 'test.todoStore.addTask' })
    await store.persist.rehydrate()

    store.getState().addTask({ name: '  hello  ' })
    const [task] = store.getState().tasks

    expect(task).toEqual({
      id: 'uuid-123',
      name: 'hello',
      deadline: null,
      category: '默认',
      priority: 'medium',
      completed: false,
      createdAt: 1234567890,
    })
  })

  it('toggleTask/deleteTask/clearCompleted are no-ops when id not found', async () => {
    const store = createTodoStore({ storageKey: 'test.todoStore.noop' })
    await store.persist.rehydrate()

    const stateBefore = store.getState()
    store.getState().toggleTask('missing')
    store.getState().deleteTask('missing')
    store.getState().clearCompleted()

    expect(store.getState()).toBe(stateBefore)
  })

  it('setCategory trims and treats blank as null', async () => {
    const store = createTodoStore({ storageKey: 'test.todoStore.setCategory' })
    await store.persist.rehydrate()

    store.getState().setCategory('  工作  ')
    expect(store.getState().filter.category).toBe('工作')

    store.getState().setCategory('   ')
    expect(store.getState().filter.category).toBeNull()
  })

  it('selectors filter, stats, categories behave as expected', () => {
    const tasks = [
      {
        id: '1',
        name: 'a',
        deadline: null,
        category: '工作',
        priority: 'low' as const,
        completed: false,
        createdAt: 1,
      },
      {
        id: '2',
        name: 'b',
        deadline: null,
        category: '生活',
        priority: 'medium' as const,
        completed: true,
        createdAt: 2,
      },
      {
        id: '3',
        name: 'c',
        deadline: null,
        category: '工作',
        priority: 'high' as const,
        completed: true,
        createdAt: 3,
      },
    ]

    expect(selectFilteredTasks(tasks, { status: 'pending', category: null })).toHaveLength(1)
    expect(selectFilteredTasks(tasks, { status: 'all', category: '工作' })).toHaveLength(2)
    expect(selectFilteredTasks(tasks, { status: 'completed', category: '工作' })).toHaveLength(1)

    expect(selectStats(tasks)).toEqual({
      total: 3,
      completed: 2,
      pending: 1,
      completionRate: 2 / 3,
    })

    expect(selectCategories(tasks)).toEqual(['工作', '生活'].sort((a, b) => a.localeCompare(b)))
  })

  it('persists tasks and filter to localStorage and can rehydrate', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(111)
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-111' })

    const storageKey = 'test.todoStore.persist'
    const store1 = createTodoStore({ storageKey })
    await store1.persist.rehydrate()

    store1.getState().setStatus('completed')
    store1.getState().addTask({ name: 'x' })

    const raw = localStorage.getItem(storageKey)
    expect(raw).toBeTruthy()

    const store2 = createTodoStore({ storageKey })
    await store2.persist.rehydrate()

    expect(store2.getState().tasks).toHaveLength(1)
    expect(store2.getState().filter.status).toBe('completed')
  })
})
