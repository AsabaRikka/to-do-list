import { memo } from 'react'

import type { Task } from '../types'

type TaskItemProps = {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function priorityMeta(priority: Task['priority']): { label: string; className: string } {
  switch (priority) {
    case 'low':
      return { label: '低', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
    case 'high':
      return { label: '高', className: 'bg-rose-50 text-rose-700 ring-rose-200' }
    default:
      return { label: '中', className: 'bg-amber-50 text-amber-700 ring-amber-200' }
  }
}

function TaskItemImpl({ task, onToggle, onDelete }: TaskItemProps) {
  const pri = priorityMeta(task.priority)

  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-300"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
        />

        <div className="min-w-0">
          <div
            className={[
              'truncate text-sm font-medium',
              task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900',
            ].join(' ')}
            title={task.name}
          >
            {task.name}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
            <span
              className={[
                'inline-flex items-center rounded-full px-2 py-0.5 font-medium ring-1 ring-inset',
                pri.className,
              ].join(' ')}
            >
              优先级：{pri.label}
            </span>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
              分类：{task.category}
            </span>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
              截止：{task.deadline ?? '无截止时间'}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        onClick={() => {
          if (confirm('确定删除该任务吗？')) onDelete(task.id)
        }}
      >
        删除
      </button>
    </li>
  )
}

export const TaskItem = memo(TaskItemImpl)

