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
      remark: '',
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

  it('updateTaskRemark updates and can clear remark', async () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-remark' })

    const store = createTodoStore({ storageKey: 'test.todoStore.updateRemark' })
    await store.persist.rehydrate()

    store.getState().addTask({ name: 'x' })
    const taskId = store.getState().tasks[0]!.id

    store.getState().updateTaskRemark(taskId, '  hello \n world  ')
    expect(store.getState().tasks[0]!.remark).toBe('hello \n world')

    store.getState().updateTaskRemark(taskId, '   ')
    expect(store.getState().tasks[0]!.remark).toBe('')
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
        remark: '',
      },
      {
        id: '2',
        name: 'b',
        deadline: null,
        category: '生活',
        priority: 'medium' as const,
        completed: true,
        createdAt: 2,
        remark: '',
      },
      {
        id: '3',
        name: 'c',
        deadline: null,
        category: '工作',
        priority: 'high' as const,
        completed: true,
        createdAt: 3,
        remark: '',
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

  it('selectFilteredTasks sorts by completion, deadline, createdAt', () => {
    const tasks = [
      {
        id: 'a',
        name: 'no-deadline-old',
        deadline: null,
        category: '默认',
        priority: 'low' as const,
        completed: false,
        createdAt: 1,
        remark: '',
      },
      {
        id: 'b',
        name: 'deadline-later',
        deadline: '2026-04-02T10:00',
        category: '默认',
        priority: 'low' as const,
        completed: false,
        createdAt: 2,
        remark: '',
      },
      {
        id: 'c',
        name: 'deadline-sooner',
        deadline: '2026-04-01T10:00',
        category: '默认',
        priority: 'low' as const,
        completed: false,
        createdAt: 3,
        remark: '',
      },
      {
        id: 'd',
        name: 'completed-new',
        deadline: '2026-04-01T09:00',
        category: '默认',
        priority: 'low' as const,
        completed: true,
        createdAt: 99,
        remark: '',
      },
      {
        id: 'e',
        name: 'bad-deadline-newer',
        deadline: 'not-a-date',
        category: '默认',
        priority: 'low' as const,
        completed: false,
        createdAt: 10,
        remark: '',
      },
      {
        id: 'f',
        name: 'no-deadline-new',
        deadline: null,
        category: '默认',
        priority: 'low' as const,
        completed: false,
        createdAt: 11,
        remark: '',
      },
    ]

    const sorted = selectFilteredTasks(tasks, { status: 'all', category: null })

    expect(sorted.map((t) => t.id)).toEqual([
      'c', // sooner deadline
      'b', // later deadline
      'f', // no deadline, newer createdAt
      'e', // bad deadline treated as null, older than f
      'a', // no deadline, oldest
      'd', // completed always last
    ])
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

  it('rehydrates from version 1 state by defaulting remark', async () => {
    const storageKey = 'test.todoStore.v1'

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        state: {
          tasks: [
            {
              id: 't1',
              name: 'old',
              deadline: null,
              category: '默认',
              priority: 'medium',
              completed: false,
              createdAt: 1,
            },
          ],
          filter: { status: 'all', category: null },
        },
        version: 1,
      }),
    )

    const store = createTodoStore({ storageKey })
    await store.persist.rehydrate()

    expect(store.getState().tasks).toHaveLength(1)
    expect(store.getState().tasks[0]!.remark).toBe('')
  })

  it('falls back to defaults for invalid persisted shape', async () => {
    const storageKey = 'test.todoStore.bad'

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        state: { tasks: 'oops', filter: { status: 'all', category: null } },
        version: 2,
      }),
    )

    const store = createTodoStore({ storageKey })
    await store.persist.rehydrate()

    expect(store.getState().tasks).toEqual([])
    expect(store.getState().filter).toEqual({ status: 'all', category: null })
  })
})
