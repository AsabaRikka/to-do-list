import type { Task } from '../types'

import { TaskItem } from './TaskItem'

type TaskListProps = {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  emptyState: 'noTasks' | 'noResults'
  onResetFilter?: () => void
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  emptyState,
  onResetFilter,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600">
        {emptyState === 'noTasks' ? (
          <div>还没有任务，先添加一个吧。</div>
        ) : (
          <div className="space-y-3">
            <div>没有匹配的任务。</div>
            {onResetFilter && (
              <button
                type="button"
                onClick={onResetFilter}
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                重置筛选
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

