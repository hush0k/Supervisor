const PRIORITY_SERIES = [
    { key: 'critical', label: 'Критичные', color: '#ef4444' },
    { key: 'high',     label: 'Высокие',   color: '#f59e0b' },
    { key: 'medium',   label: 'Средние',   color: '#3b82f6' },
    { key: 'low',      label: 'Низкие',    color: '#94a3b8' },
]

function collectCounts(tasks) {
    return tasks.reduce(
        (acc, task) => {
            const key = task.priority ?? 'medium'
            acc[key] = (acc[key] ?? 0) + 1
            return acc
        },
        { critical: 0, high: 0, medium: 0, low: 0 }
    )
}

export function DashboardTaskPriorityChart({ tasks }) {
    const counts = collectCounts(tasks ?? [])
    const total  = Object.values(counts).reduce((sum, v) => sum + v, 0)
    const max    = Math.max(...Object.values(counts), 1)

    if (total === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Нет данных по приоритетам задач
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {PRIORITY_SERIES.map(item => {
                const value    = counts[item.key] ?? 0
                const barPct   = Math.round((value / max) * 100)
                const totalPct = Math.round((value / total) * 100)
                return (
                    <div key={item.key} className="flex items-center gap-3">
                        {/* Colored left accent */}
                        <div className="w-1 shrink-0 self-stretch" style={{ background: item.color }} />
                        <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-gray-700">{item.label}</span>
                                <div className="flex items-center gap-1.5 tabular-nums">
                                    <span className="font-bold text-gray-800">{value}</span>
                                    <span className="text-gray-400">({totalPct}%)</span>
                                </div>
                            </div>
                            <div className="h-2 bg-gray-100">
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{ width: `${barPct}%`, background: item.color }}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
