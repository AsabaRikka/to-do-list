import { useMemo } from 'react'

import { FilterBar } from './components/FilterBar'
import { Stats } from './components/Stats'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { selectCategories, selectFilteredTasks, selectStats, useTodoStore } from './store/todoStore'
import { DEFAULT_FILTER } from './types'

function App() {
  const tasks = useTodoStore((state) => state.tasks)
  const filter = useTodoStore((state) => state.filter)
  const addTask = useTodoStore((state) => state.addTask)
  const toggleTask = useTodoStore((state) => state.toggleTask)
  const deleteTask = useTodoStore((state) => state.deleteTask)
  const setStatus = useTodoStore((state) => state.setStatus)
  const setCategory = useTodoStore((state) => state.setCategory)

  const categories = useMemo(() => selectCategories(tasks), [tasks])
  const filteredTasks = useMemo(
    () => selectFilteredTasks(tasks, filter),
    [tasks, filter],
  )
  const stats = useMemo(() => selectStats(tasks), [tasks])

  const emptyState: 'noTasks' | 'noResults' =
    tasks.length === 0 ? 'noTasks' : filteredTasks.length === 0 ? 'noResults' : 'noTasks'

  const handleResetFilter = () => {
    setStatus(DEFAULT_FILTER.status)
    setCategory(DEFAULT_FILTER.category)
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">待办清单</h1>
          <p className="text-sm text-zinc-600">
            任务会自动保存到本地（localStorage）。
          </p>
        </header>

        <main className="mt-4 grid gap-4 md:grid-cols-2 md:grid-rows-[auto_1fr] md:items-start">
          <section className="md:col-start-1 md:row-start-1">
            <Stats stats={stats} />
          </section>

          <section className="md:col-start-2 md:row-start-1">
            <TaskForm categories={categories} onAddTask={addTask} />
          </section>

          <section className="md:col-start-1 md:row-start-2">
            <FilterBar
              filter={filter}
              categories={categories}
              onSetStatus={setStatus}
              onSetCategory={setCategory}
            />
          </section>

          <section className="md:col-start-2 md:row-start-2">
            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              emptyState={emptyState}
              onResetFilter={
                emptyState === 'noResults' ? handleResetFilter : undefined
              }
            />
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
