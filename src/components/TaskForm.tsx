import { useId, useState } from 'react'

import type { NewTaskInput, TaskPriority } from '../types'

type TaskFormProps = {
  categories: string[]
  onAddTask: (input: NewTaskInput) => void
}

const PRIORITY_OPTIONS: Array<{ label: string; value: TaskPriority }> = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
]

export function TaskForm({ categories, onAddTask }: TaskFormProps) {
  const datalistId = useId()

  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (trimmedName.length === 0) {
      setError('请输入任务名称')
      return
    }

    try {
      onAddTask({
        name: trimmedName,
        deadline: deadline.trim().length > 0 ? deadline : null,
        category: category.trim().length > 0 ? category : undefined,
        priority,
      })

      setName('')
      setDeadline('')
      setCategory('')
      setPriority('medium')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '添加失败，请重试')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-zinc-900" htmlFor="task-name">
            任务名称 <span className="text-rose-600">*</span>
          </label>
          <input
            id="task-name"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：写周报"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="task-deadline">
            截止时间
          </label>
          <input
            id="task-deadline"
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900" htmlFor="task-priority">
            优先级
          </label>
          <select
            id="task-priority"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-zinc-900" htmlFor="task-category">
            分类
          </label>
          <input
            id="task-category"
            list={datalistId}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如：工作 / 生活"
            autoComplete="off"
          />
          <datalist id={datalistId}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-h-5 text-sm text-rose-600" role="alert">
          {error ?? ''}
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          添加
        </button>
      </div>
    </form>
  )
}

