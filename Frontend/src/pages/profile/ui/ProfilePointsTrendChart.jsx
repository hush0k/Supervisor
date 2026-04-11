import { useMemo, useState } from 'react'

const W = 640
const H = 260
const PAD = { top: 20, right: 16, bottom: 36, left: 44 }
const PRIMARY = '#2563eb'

function formatShortDate(value) {
    if (!value) return ''
    return new Date(value).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
}

function linePath(points) {
    if (!points.length) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
    return `M ${points.map(point => `${point.x} ${point.y}`).join(' L ')}`
}

export function ProfilePointsTrendChart({ points = [], isLoading = false }) {
    const [hovered, setHovered] = useState(null)

    const chart = useMemo(() => {
        if (!points.length) return null
        const values = points.map(item => Number(item.value) || 0)
        const max = Math.max(...values, 1)
        const innerW = W - PAD.left - PAD.right
        const innerH = H - PAD.top - PAD.bottom
        const xStep = points.length > 1 ? innerW / (points.length - 1) : 0
        const toX = index => PAD.left + index * xStep
        const toY = value => PAD.top + innerH - (value / max) * innerH
        const coords = points.map((item, index) => ({
            x: toX(index),
            y: toY(Number(item.value) || 0),
            value: Number(item.value) || 0,
            date: item.date,
        }))
        const path = linePath(coords)
        const areaPath = `${path} L ${coords[coords.length - 1].x} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`
        return { coords, max, innerH, xStep, path, areaPath }
    }, [points])

    if (isLoading) {
        return <div className="h-72 bg-gray-100 animate-pulse" />
    }

    if (!chart || !points.length) {
        return <div className="h-72 flex items-center justify-center text-sm text-gray-400">Нет данных по динамике очков</div>
    }

    const labelStep = Math.max(Math.ceil(chart.coords.length / 6), 1)
    const avg = Math.round(chart.coords.reduce((acc, item) => acc + item.value, 0) / chart.coords.length)
    const current = chart.coords[chart.coords.length - 1]?.value || 0

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="border p-2.5 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Текущие очки</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{current.toLocaleString('ru-RU')}</p>
                </div>
                <div className="border p-2.5 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Среднее</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{avg.toLocaleString('ru-RU')}</p>
                </div>
                <div className="border p-2.5 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Максимум</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{Math.round(chart.max).toLocaleString('ru-RU')}</p>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ width: '100%', height: 260, minWidth: 320, display: 'block' }}
                    onMouseLeave={() => setHovered(null)}
                >
                    <defs>
                        <linearGradient id="profilePointsArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0.03" />
                        </linearGradient>
                    </defs>

                    <line x1={PAD.left} y1={PAD.top + chart.innerH} x2={W - PAD.right} y2={PAD.top + chart.innerH} stroke="#e2e8f0" />
                    <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chart.innerH} stroke="#e2e8f0" />

                    <path d={chart.areaPath} fill="url(#profilePointsArea)" />
                    <path d={chart.path} fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" />

                    {chart.coords.map((point, i) => {
                        const zoneWidth = Math.max(chart.xStep, 24)
                        return (
                            <rect
                                key={`zone-${i}`}
                                x={point.x - zoneWidth / 2}
                                y={PAD.top}
                                width={zoneWidth}
                                height={chart.innerH}
                                fill="transparent"
                                onMouseEnter={() => setHovered(i)}
                            />
                        )
                    })}

                    {chart.coords.map((point, i) => (
                        <circle key={`dot-${i}`} cx={point.x} cy={point.y} r={hovered === i ? 5 : 3.5} fill={PRIMARY} />
                    ))}

                    {chart.coords.map((point, i) => {
                        const show = i === 0 || i === chart.coords.length - 1 || i % labelStep === 0
                        if (!show) return null
                        return (
                            <text key={`label-${i}`} x={point.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
                                {formatShortDate(point.date)}
                            </text>
                        )
                    })}

                    {hovered !== null && (() => {
                        const point = chart.coords[hovered]
                        const tipW = 126
                        const tipH = 38
                        const tipX = Math.min(Math.max(point.x - tipW / 2, PAD.left), W - PAD.right - tipW)
                        const tipY = Math.max(point.y - tipH - 10, PAD.top + 4)
                        return (
                            <g>
                                <line x1={point.x} y1={PAD.top} x2={point.x} y2={PAD.top + chart.innerH} stroke="#cbd5e1" strokeDasharray="4 3" />
                                <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="6" fill="#0f172a" />
                                <text x={tipX + tipW / 2} y={tipY + 14} textAnchor="middle" fontSize="10" fill="#bfdbfe">
                                    {formatShortDate(point.date)}
                                </text>
                                <text x={tipX + tipW / 2} y={tipY + 28} textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="700">
                                    {`${point.value.toLocaleString('ru-RU')} очков`}
                                </text>
                            </g>
                        )
                    })()}
                </svg>
            </div>
        </div>
    )
}
