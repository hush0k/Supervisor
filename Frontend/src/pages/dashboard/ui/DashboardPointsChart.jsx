import { useUserChart } from '@/features/statistics/useUserChart'

function formatDate(str) {
    if (!str) return ''
    const d = new Date(str)
    return d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
}

export function DashboardPointsChart() {
    const { data, isLoading } = useUserChart('total_points')

    if (isLoading) {
        return <div className="h-56 bg-gray-100 animate-pulse rounded" />
    }

    const points = data?.data ?? []

    if (points.length === 0) {
        return (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                Пока нет данных для графика
            </div>
        )
    }

    const values = points.map(p => p.value)
    const max = Math.max(...values, 1)
    const min = Math.min(...values)

    const W = 600
    const H = 180
    const PAD = { top: 12, right: 12, bottom: 28, left: 40 }
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom

    const xStep = innerW / Math.max(points.length - 1, 1)

    const toX = i => PAD.left + i * xStep
    const toY = v => PAD.top + innerH - ((v - min) / Math.max(max - min, 1)) * innerH

    const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.value)}`)
        .join(' ')

    const areaPath = [
        ...points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.value)}`),
        `L ${toX(points.length - 1)} ${PAD.top + innerH}`,
        `L ${toX(0)} ${PAD.top + innerH}`,
        'Z',
    ].join(' ')

    const yTicks = [min, Math.round((min + max) / 2), max]

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {yTicks.map(v => (
                    <g key={v}>
                        <line
                            x1={PAD.left} y1={toY(v)}
                            x2={W - PAD.right} y2={toY(v)}
                            stroke="#f0f0f0" strokeWidth="1"
                        />
                        <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                            {v.toLocaleString('ru-RU')}
                        </text>
                    </g>
                ))}

                <path d={areaPath} fill="url(#areaGrad)" />
                <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={toX(i)} cy={toY(p.value)} r="4" fill="#6366f1" />
                        <text
                            x={toX(i)}
                            y={H - 6}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#9ca3af"
                        >
                            {formatDate(p.date)}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    )
}
