import { memo, useLayoutEffect, useRef, useState } from 'react'

import type { Task } from '../types'

type TaskItemProps = {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdateRemark: (id: string, remark: string) => void
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

function TaskItemImpl({ task, onToggle, onDelete, onUpdateRemark }: TaskItemProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [remarkEditing, setRemarkEditing] = useState(false)
  const [draftRemark, setDraftRemark] = useState(task.remark)

  useLayoutEffect(() => {
    if (!remarkEditing) return
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [remarkEditing, draftRemark])

  const pri = priorityMeta(task.priority)

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
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

            <div className="mt-1">
              {remarkEditing ? (
                <div className="space-y-2">
                  <textarea
                    ref={textareaRef}
                    autoFocus
                    rows={1}
                    aria-label="备注内容"
                    className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs leading-5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    value={draftRemark}
                    onChange={(e) => setDraftRemark(e.target.value)}
                    placeholder="写点补充说明…"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        setDraftRemark(task.remark)
                        setRemarkEditing(false)
                        return
                      }

                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        const next = draftRemark.trim()
                        onUpdateRemark(task.id, next)
                        setDraftRemark(next)
                        setRemarkEditing(false)
                      }
                    }}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-100"
                      onClick={() => {
                        onUpdateRemark(task.id, '')
                        setDraftRemark('')
                      }}
                    >
                      清空
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                      onClick={() => {
                        const next = draftRemark.trim()
                        onUpdateRemark(task.id, next)
                        setDraftRemark(next)
                        setRemarkEditing(false)
                      }}
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={[
                    'w-full rounded-md text-left text-xs leading-5 outline-none focus:ring-2 focus:ring-violet-200',
                    task.remark.length > 0
                      ? 'text-zinc-600 whitespace-pre-wrap break-words hover:text-zinc-800'
                      : 'text-zinc-400 italic hover:text-zinc-500',
                  ].join(' ')}
                  onClick={() => {
                    setDraftRemark(task.remark)
                    setRemarkEditing(true)
                  }}
                >
                  {task.remark.length > 0 ? task.remark : '点击添加备注…'}
                </button>
              )}
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

        <div className="shrink-0 space-x-2">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            onClick={() => {
              if (confirm('确定删除该任务吗？')) onDelete(task.id)
            }}
          >
            删除
          </button>
        </div>
      </div>
    </li>
  )
}

export const TaskItem = memo(TaskItemImpl)
