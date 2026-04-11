const BUCKETS = [
    { key: 'overdue', label: 'Просрочено', color: '#ef4444' },
    { key: 'today_3', label: '0–3 дн.',    color: '#f59e0b' },
    { key: 'day_7',   label: '4–7 дн.',    color: '#3b82f6' },
    { key: 'later',   label: '8+ дн.',     color: '#10b981' },
]

function diffInDays(deadline) {
    const dayMs = 24 * 60 * 60 * 1000
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(deadline)
    target.setHours(0, 0, 0, 0)
    return Math.round((target.getTime() - now.getTime()) / dayMs)
}

function buildBuckets(tasks) {
    const result = { overdue: 0, today_3: 0, day_7: 0, later: 0 }
    for (const task of tasks ?? []) {
        const days = diffInDays(task.deadline)
        if (days < 0)      result.overdue += 1
        else if (days <= 3) result.today_3 += 1
        else if (days <= 7) result.day_7   += 1
        else                result.later   += 1
    }
    return result
}

const BAR_AREA_H = 140

export function DashboardDeadlineChart({ tasks }) {
    const buckets = buildBuckets(tasks)
    const max     = Math.max(...Object.values(buckets), 1)
    const total   = Object.values(buckets).reduce((sum, v) => sum + v, 0)

    if (total === 0) {
        return (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                Нет данных по дедлайнам
            </div>
        )
    }

    return (
        <div className="flex items-end gap-3" style={{ height: 200 }}>
            {BUCKETS.map(bucket => {
                const value = buckets[bucket.key]
                const barH  = value > 0
                    ? Math.max(Math.round((value / max) * BAR_AREA_H), 10)
                    : 0

                return (
                    <div
                        key={bucket.key}
                        className="flex-1 flex flex-col items-center justify-end"
                        style={{ height: 200 }}
                    >
                        {/* Count label above bar */}
                        <span
                            className="text-sm font-bold tabular-nums mb-1.5"
                            style={{ color: value > 0 ? bucket.color : 'transparent' }}
                        >
                            {value}
                        </span>

                        {/* Bar */}
                        <div
                            className="w-full transition-all duration-700"
                            style={{ height: barH, background: bucket.color, minHeight: value > 0 ? 10 : 0 }}
                        />

                        {/* X label */}
                        <p className="text-xs text-gray-500 text-center mt-2 leading-tight">{bucket.label}</p>
                    </div>
                )
            })}
        </div>
    )
}
