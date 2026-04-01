type StatsProps = {
  stats: {
    total: number
    completed: number
    pending: number
    completionRate: number
  }
}

export function Stats({ stats }: StatsProps) {
  const percent = Math.round(stats.completionRate * 100)

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="rounded-lg bg-zinc-50 p-3">
        <div className="text-xs text-zinc-600">总数</div>
        <div
          className="mt-1 text-lg font-semibold text-zinc-900"
          data-testid="stats-total"
        >
          {stats.total}
        </div>
      </div>
      <div className="rounded-lg bg-zinc-50 p-3">
        <div className="text-xs text-zinc-600">已完成</div>
        <div
          className="mt-1 text-lg font-semibold text-zinc-900"
          data-testid="stats-completed"
        >
          {stats.completed}
        </div>
      </div>
      <div className="rounded-lg bg-zinc-50 p-3">
        <div className="text-xs text-zinc-600">未完成</div>
        <div
          className="mt-1 text-lg font-semibold text-zinc-900"
          data-testid="stats-pending"
        >
          {stats.pending}
        </div>
      </div>
      <div className="rounded-lg bg-zinc-50 p-3">
        <div className="text-xs text-zinc-600">完成率</div>
        <div
          className="mt-1 text-lg font-semibold text-zinc-900"
          data-testid="stats-rate"
        >
          {percent}%
        </div>
      </div>
    </div>
  )
}
