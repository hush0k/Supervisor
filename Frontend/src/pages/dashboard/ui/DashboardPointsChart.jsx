import { useMemo, useState } from 'react'
import { FiTrendingUp } from 'react-icons/fi'
import { useUserChart } from '@/features/statistics/useUserChart'

const W = 640
const H = 260
const PAD = { top: 20, right: 16, bottom: 36, left: 44 }
const PRIMARY = '#2563eb'
const SUCCESS = '#10b981'

function formatShortDate(value) {
    if (!value) return ''
    return new Date(value).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
}

function catmullRomPath(points) {
    if (!points.length) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    const tension = 0.32
    let d = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = i > 0 ? points[i - 1] : points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1]
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`
    }

    return d
}

export function DashboardPointsChart() {
    const { data, isLoading } = useUserChart('total_points')
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const points = useMemo(() => data?.data ?? [], [data])

    const chart = useMemo(() => {
        if (!points.length) return null

        const values = points.map(item => Number(item.value) || 0)
        const rawMax = Math.max(...values, 1)
        const rawMin = Math.min(...values, 0)
        const pad = Math.max((rawMax - rawMin) * 0.16, 6)
        const min = Math.max(rawMin - pad, 0)
        const max = rawMax + pad
        const range = Math.max(max - min, 1)

        const innerW = W - PAD.left - PAD.right
        const innerH = H - PAD.top - PAD.bottom
        const xStep = points.length > 1 ? innerW / (points.length - 1) : 0
        const toX = i => PAD.left + i * xStep
        const toY = value => PAD.top + innerH - ((value - min) / range) * innerH

        const coords = points.map((item, index) => ({
            x: toX(index),
            y: toY(Number(item.value) || 0),
            value: Number(item.value) || 0,
            date: item.date,
        }))

        const yTickCount = 4
        const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => min + ((max - min) / yTickCount) * i)
        const linePath = catmullRomPath(coords)
        const areaPath =
            `${linePath} L ${coords[coords.length - 1].x} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`

        return {
            coords,
            yTicks,
            linePath,
            areaPath,
            innerH,
            xStep,
            min,
            max,
        }
    }, [points])

    if (isLoading) {
        return <div className="h-72 bg-gray-100 animate-pulse" />
    }

    if (!points.length || !chart) {
        return (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                Пока нет данных для графика очков
            </div>
        )
    }

    const latest = chart.coords[chart.coords.length - 1]?.value ?? 0
    const first = chart.coords[0]?.value ?? 0
    const delta = latest - first
    const avg = Math.round(chart.coords.reduce((sum, p) => sum + p.value, 0) / chart.coords.length)
    const maxValue = Math.round(chart.max)
    const labelStep = Math.max(Math.ceil(chart.coords.length / 6), 1)

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="border bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Текущее значение</p>
                    <p className="text-lg font-extrabold text-gray-900">{latest.toLocaleString('ru-RU')}</p>
                </div>
                <div className="border bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Среднее</p>
                    <p className="text-lg font-extrabold text-gray-900">{avg.toLocaleString('ru-RU')}</p>
                </div>
                <div className="border bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Изменение</p>
                    <p className={`text-lg font-extrabold inline-flex items-center gap-1 ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <FiTrendingUp size={15} />
                        {`${delta >= 0 ? '+' : ''}${delta.toLocaleString('ru-RU')}`}
                    </p>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ width: '100%', height: 260, minWidth: 320, display: 'block' }}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <defs>
                        <linearGradient id="pointsArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.22" />
                            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0.02" />
                        </linearGradient>
                    </defs>

                    {chart.yTicks.map((tick, i) => {
                        const y = PAD.top + chart.innerH - ((tick - chart.min) / (chart.max - chart.min || 1)) * chart.innerH
                        return (
                            <g key={`y-${i}`}>
                                <line
                                    x1={PAD.left}
                                    y1={y}
                                    x2={W - PAD.right}
                                    y2={y}
                                    stroke={i === 0 ? '#e2e8f0' : '#f1f5f9'}
                                    strokeWidth="1"
                                    strokeDasharray={i === 0 ? '0' : '4 4'}
                                />
                                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                                    {Math.round(tick).toLocaleString('ru-RU')}
                                </text>
                            </g>
                        )
                    })}

                    <path d={chart.areaPath} fill="url(#pointsArea)" />
                    <path d={chart.linePath} fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" />

                    {chart.coords.map((point, i) => {
                        const barWidth = Math.max(chart.xStep, 24)
                        return (
                            <rect
                                key={`hover-zone-${i}`}
                                x={point.x - barWidth / 2}
                                y={PAD.top}
                                width={barWidth}
                                height={chart.innerH}
                                fill="transparent"
                                onMouseEnter={() => setHoveredIndex(i)}
                            />
                        )
                    })}

                    {chart.coords.map((point, i) => {
                        const showLabel = i === 0 || i === chart.coords.length - 1 || i % labelStep === 0
                        if (!showLabel) return null
                        return (
                            <text key={`x-${i}`} x={point.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
                                {formatShortDate(point.date)}
                            </text>
                        )
                    })}

                    {chart.coords.map((point, i) => (
                        <circle
                            key={`dot-${i}`}
                            cx={point.x}
                            cy={point.y}
                            r={hoveredIndex === i ? 4.8 : 3}
                            fill={hoveredIndex === i ? SUCCESS : PRIMARY}
                        />
                    ))}

                    {hoveredIndex !== null && (() => {
                        const point = chart.coords[hoveredIndex]
                        const tipW = 132
                        const tipH = 40
                        const tipX = Math.min(Math.max(point.x - tipW / 2, PAD.left), W - PAD.right - tipW)
                        const tipY = Math.max(point.y - tipH - 12, PAD.top + 4)

                        return (
                            <g>
                                <line
                                    x1={point.x}
                                    y1={PAD.top}
                                    x2={point.x}
                                    y2={PAD.top + chart.innerH}
                                    stroke="#cbd5e1"
                                    strokeDasharray="4 3"
                                />
                                <circle cx={point.x} cy={point.y} r="9" fill={PRIMARY} fillOpacity="0.12" />
                                <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="6" fill="#0f172a" />
                                <text x={tipX + tipW / 2} y={tipY + 15} textAnchor="middle" fontSize="10" fill="#bfdbfe">
                                    {formatShortDate(point.date)}
                                </text>
                                <text x={tipX + tipW / 2} y={tipY + 29} textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="700">
                                    {`${point.value.toLocaleString('ru-RU')} очков`}
                                </text>
                            </g>
                        )
                    })()}

                    <text x={W - PAD.right} y={14} textAnchor="end" fontSize="10" fill="#94a3b8">
                        Пик: {maxValue.toLocaleString('ru-RU')}
                    </text>
                </svg>
            </div>
        </div>
    )
}
