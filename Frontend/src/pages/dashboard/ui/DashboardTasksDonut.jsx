const SEGMENTS = [
    { key: 'verified',    label: 'Подтверждено', color: '#10b981' },
    { key: 'in_progress', label: 'В процессе',   color: '#3b82f6' },
    { key: 'failed',      label: 'Отклонено',    color: '#ef4444' },
]

function getValues(data) {
    return {
        verified:    data.tasks_verified   ?? 0,
        in_progress: data.tasks_in_progress ?? 0,
        failed:      data.tasks_failed     ?? 0,
    }
}

const SIZE   = 188
const STROKE = 20
const GAP    = 4
const RADIUS = (SIZE - STROKE) / 2
const CIRC   = 2 * Math.PI * RADIUS
const CENTER = SIZE / 2

export function DashboardTasksDonut({ data }) {
    const vals     = getValues(data)
    const total    = Object.values(vals).reduce((a, b) => a + b, 0)
    const safeTot  = Math.max(total, 1)

    let offset = 0
    const rings = SEGMENTS.map(seg => {
        const value  = vals[seg.key]
        const share  = value / safeTot
        const length = Math.max(CIRC * share - (value > 0 ? GAP : 0), 0)
        const ring   = { ...seg, value, length, offset }
        offset += CIRC * share
        return ring
    })

    return (
        <div className="flex flex-col gap-5 h-full justify-between py-1">
            {/* Donut */}
            <div className="flex justify-center">
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
                    {/* Track */}
                    <circle
                        cx={CENTER} cy={CENTER} r={RADIUS}
                        fill="none" stroke="#e2e8f0" strokeWidth={STROKE}
                    />
                    {/* Segments */}
                    {rings.filter(r => r.value > 0).map(ring => (
                        <circle
                            key={ring.key}
                            cx={CENTER} cy={CENTER} r={RADIUS}
                            fill="none"
                            stroke={ring.color}
                            strokeWidth={STROKE}
                            strokeLinecap="butt"
                            strokeDasharray={`${ring.length} ${Math.max(CIRC - ring.length, 0)}`}
                            strokeDashoffset={-ring.offset}
                            transform={`rotate(-90 ${CENTER} ${CENTER})`}
                        />
                    ))}
                    {/* Center text */}
                    <text x={CENTER} y={CENTER - 8} textAnchor="middle" fontSize="34" fontWeight="800" fill="#0f172a">
                        {total}
                    </text>
                    <text x={CENTER} y={CENTER + 13} textAnchor="middle" fontSize="11" fill="#94a3b8" letterSpacing="0.5">
                        задач
                    </text>
                </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3">
                {SEGMENTS.map(seg => {
                    const value = vals[seg.key]
                    const pct   = Math.round((value / safeTot) * 100)
                    return (
                        <div key={seg.key}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 shrink-0"
                                        style={{ background: seg.color }}
                                    />
                                    <span className="text-gray-600">{seg.label}</span>
                                </div>
                                <div className="flex items-center gap-2 tabular-nums">
                                    <span className="font-semibold text-gray-800">{value}</span>
                                    <span className="text-gray-400 w-9 text-right">{pct}%</span>
                                </div>
                            </div>
                            <div className="h-1.5 bg-gray-100">
                                <div
                                    className="h-full transition-all duration-700"
                                    style={{ width: `${pct}%`, background: seg.color }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {total === 0 && (
                <p className="text-xs text-gray-400 text-center">
                    Пока нет задач за выбранный период
                </p>
            )}
        </div>
    )
}
