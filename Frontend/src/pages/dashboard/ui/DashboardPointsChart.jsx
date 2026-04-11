import { useUserChart } from '@/features/statistics/useUserChart'
import { useState } from 'react'

const PRIMARY = '#3b82f6'
const W = 600
const H = 260
const PAD = { top: 24, right: 20, bottom: 38, left: 50 }
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

function formatDate(str) {
    if (!str) return ''
    return new Date(str).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
}

function catmullRom(pts) {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
    let d = `M ${pts[0].x} ${pts[0].y}`
    const t = 0.38
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[i]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = i < pts.length - 2 ? pts[i + 2] : pts[i + 1]
        const cp1x = p1.x + (p2.x - p0.x) * t
        const cp1y = p1.y + (p2.y - p0.y) * t
        const cp2x = p2.x - (p3.x - p1.x) * t
        const cp2y = p2.y - (p3.y - p1.y) * t
        d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`
    }
    return d
}

export function DashboardPointsChart() {
    const { data, isLoading } = useUserChart('total_points')
    const [hovered, setHovered] = useState(null)

    if (isLoading) {
        return <div className="h-64 bg-gray-100 animate-pulse" />
    }

    const points = data?.data ?? []

    if (points.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Пока нет данных для графика
            </div>
        )
    }

    const values = points.map(p => p.value)
    const rawMax = Math.max(...values)
    const rawMin = Math.min(...values)
    const padding = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.05, 1)
    const max = rawMax + padding
    const min = Math.max(rawMin - padding, 0)
    const range = Math.max(max - min, 1)

    const xStep = points.length > 1 ? innerW / (points.length - 1) : 0
    const toX = i => PAD.left + i * xStep
    const toY = v => PAD.top + innerH - ((v - min) / range) * innerH

    const coords = points.map((p, i) => ({
        x: toX(i),
        y: toY(p.value),
        value: p.value,
        date: p.date,
    }))

    const linePath = catmullRom(coords)
    const areaPath = linePath
        + ` L ${coords[coords.length - 1].x},${PAD.top + innerH}`
        + ` L ${PAD.left},${PAD.top + innerH} Z`

    const yTickCount = 4
    const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
        min + (range / yTickCount) * i
    )

    const showEvery = Math.ceil(points.length / 7)

    return (
        <div className="w-full overflow-x-auto">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: 260, minWidth: 300, display: 'block' }}
                onMouseLeave={() => setHovered(null)}
            >
                <defs>
                    <linearGradient id="pgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={PRIMARY} stopOpacity="0.01" />
                    </linearGradient>
                    <clipPath id="pgClip">
                        <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} />
                    </clipPath>
                </defs>

                {/* Y-axis grid + ticks */}
                {yTicks.map((v, i) => {
                    const y = toY(v)
                    return (
                        <g key={i}>
                            <line
                                x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                                stroke={i === 0 ? '#e2e8f0' : '#f1f5f9'}
                                strokeWidth="1"
                                strokeDasharray={i === 0 ? '0' : '5 4'}
                            />
                            <text x={PAD.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                                {Math.round(v).toLocaleString('ru-RU')}
                            </text>
                        </g>
                    )
                })}

                {/* Area */}
                <path d={areaPath} fill="url(#pgAreaGrad)" clipPath="url(#pgClip)" />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={PRIMARY}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    clipPath="url(#pgClip)"
                />

                {/* Hover columns */}
                {coords.map((pt, i) => (
                    <rect
                        key={i}
                        x={pt.x - xStep / 2}
                        y={PAD.top}
                        width={Math.max(xStep, 20)}
                        height={innerH}
                        fill="transparent"
                        onMouseEnter={() => setHovered(i)}
                    />
                ))}

                {/* X-axis labels */}
                {coords.map((pt, i) => {
                    const show = i === 0 || i === points.length - 1 || i % showEvery === 0
                    if (!show) return null
                    return (
                        <text key={i} x={pt.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
                            {formatDate(pt.date)}
                        </text>
                    )
                })}

                {/* Dots */}
                {coords.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r={hovered === i ? 5 : 3.5} fill={PRIMARY} />
                ))}

                {/* Hover ring + tooltip */}
                {hovered !== null && (() => {
                    const pt = coords[hovered]
                    const tipW = 64
                    const tipH = 24
                    const tipX = Math.min(Math.max(pt.x - tipW / 2, PAD.left), W - PAD.right - tipW)
                    const tipY = pt.y - tipH - 10

                    return (
                        <g>
                            <circle cx={pt.x} cy={pt.y} r={10} fill={PRIMARY} fillOpacity="0.12" />
                            <rect x={tipX} y={tipY} width={tipW} height={tipH} fill="#0f172a" />
                            <text x={tipX + tipW / 2} y={tipY + 15} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
                                {pt.value.toLocaleString('ru-RU')} pts
                            </text>
                        </g>
                    )
                })()}
            </svg>
        </div>
    )
}
