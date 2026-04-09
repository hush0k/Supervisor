const SEGMENTS = [
    { key: 'verified',    label: 'Подтверждено', color: '#10b981' },
    { key: 'in_progress', label: 'В процессе',   color: '#f59e0b' },
    { key: 'failed',      label: 'Отклонено',    color: '#ef4444' },
]

function getValues(data) {
    return {
        verified:    data.tasks_verified ?? 0,
        in_progress: data.tasks_in_progress ?? 0,
        failed:      0,
    }
}

function polarToXY(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * (Math.PI / 180)
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function arcPath(cx, cy, r, startAngle, endAngle) {
    const [sx, sy] = polarToXY(cx, cy, r, startAngle)
    const [ex, ey] = polarToXY(cx, cy, r, endAngle)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`
}

export function DashboardTasksDonut({ data }) {
    const vals = getValues(data)
    const total = Object.values(vals).reduce((a, b) => a + b, 0)

    if (total === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Нет завершённых задач
            </div>
        )
    }

    const cx = 80
    const cy = 80
    const R = 62
    const rInner = 38

    let currentAngle = 0
    const arcs = SEGMENTS.map(seg => {
        const val = vals[seg.key]
        const angle = (val / total) * 360
        const start = currentAngle
        const end = currentAngle + angle
        currentAngle = end
        return { ...seg, val, angle, start, end }
    }).filter(s => s.val > 0)

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 160 160" className="shrink-0" style={{ width: 140, height: 140 }}>
                {arcs.map((arc, i) => (
                    <path
                        key={i}
                        d={arcPath(cx, cy, R, arc.start, arc.end)}
                        fill="none"
                        stroke={arc.color}
                        strokeWidth={rInner}
                        strokeLinecap="butt"
                    />
                ))}
                <circle cx={cx} cy={cy} r={rInner - 1} fill="white" />
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111">
                    {total}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9ca3af">
                    задач
                </text>
            </svg>

            <div className="flex flex-col gap-2">
                {SEGMENTS.map(seg => {
                    const val = vals[seg.key]
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0
                    return (
                        <div key={seg.key} className="flex items-center gap-2 text-sm">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                            <span className="text-gray-600 text-xs">{seg.label}</span>
                            <span className="font-bold text-xs ml-auto pl-4">{val} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
