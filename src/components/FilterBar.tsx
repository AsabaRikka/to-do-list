import type { Filter, FilterStatus } from '../types'

type FilterBarProps = {
  filter: Filter
  categories: string[]
  onSetStatus: (status: FilterStatus) => void
  onSetCategory: (category: string | null) => void
}

const STATUS_OPTIONS: Array<{ label: string; value: FilterStatus }> = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '未完成', value: 'pending' },
]

export function FilterBar({
  filter,
  categories,
  onSetStatus,
  onSetCategory,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-sm font-medium text-zinc-900">状态</div>
        <div className="mt-2 inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
          {STATUS_OPTIONS.map((opt) => {
            const active = filter.status === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSetStatus(opt.value)}
                className={[
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  active
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900',
                ].join(' ')}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="sm:min-w-56">
        <label className="text-sm font-medium text-zinc-900" htmlFor="filter-category">
          分类
        </label>
        <select
          id="filter-category"
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          value={filter.category ?? ''}
          onChange={(e) => onSetCategory(e.target.value.length === 0 ? null : e.target.value)}
        >
          <option value="">全部分类</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

