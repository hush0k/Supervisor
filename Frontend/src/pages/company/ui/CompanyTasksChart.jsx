function formatMonthLabel(month) {
    const [year, mon] = month.split('-')
    return new Date(Number(year), Number(mon) - 1, 1)
        .toLocaleDateString('ru-RU', { month: 'short' })
}

export function CompanyTasksChart({ data }) {
    if (!data.length) {
        return (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                Нет данных за выбранный период
            </div>
        )
    }

    const W = 640, H = 200
    const PAD = { top: 16, right: 16, bottom: 36, left: 36 }
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom

    const maxVal = Math.max(...data.map(d => Math.max(d.verified, d.failed, d.completed)), 1)
    const toY = v => PAD.top + innerH - (v / maxVal) * innerH

    const groupW = innerW / data.length
    const barW = Math.max(Math.min(groupW * 0.28, 22), 6)
    const gap = barW * 0.4

    const yTicks = [0, Math.round(maxVal / 2), maxVal]

    return (
        <div className="w-full">
            <div className="flex items-center gap-5 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    Принято
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-400" />
                    Отклонено
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-400" />
                    На проверке
                </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
                <defs>
                    <linearGradient id="verGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f87171" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="1" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.7" />
                    </linearGradient>
                </defs>

                {/* Y grid lines */}
                {yTicks.map(v => (
                    <g key={v}>
                        <line
                            x1={PAD.left} y1={toY(v)}
                            x2={W - PAD.right} y2={toY(v)}
                            stroke="#f1f5f9" strokeWidth="1"
                        />
                        <text x={PAD.left - 6} y={toY(v) + 3.5}
                            textAnchor="end" fontSize="9" fill="#cbd5e1">
                            {v}
                        </text>
                    </g>
                ))}

                {/* Bars */}
                {data.map((item, i) => {
                    const cx = PAD.left + i * groupW + groupW / 2
                    const x1 = cx - barW * 1.5 - gap
                    const x2 = cx - barW / 2
                    const x3 = cx + barW / 2 + gap
                    const base = PAD.top + innerH

                    const hVer  = Math.max((item.verified  / maxVal) * innerH, 1)
                    const hFail = Math.max((item.failed    / maxVal) * innerH, 1)
                    const hComp = Math.max((item.completed / maxVal) * innerH, 1)

                    return (
                        <g key={item.month}>
                            {/* verified */}
                            <rect x={x1} y={base - hVer}  width={barW} height={hVer}  fill="url(#verGrad)"  rx="2" />
                            {/* failed */}
                            <rect x={x2} y={base - hFail} width={barW} height={hFail} fill="url(#failGrad)" rx="2" />
                            {/* completed */}
                            <rect x={x3} y={base - hComp} width={barW} height={hComp} fill="url(#compGrad)" rx="2" />
                            {/* month label */}
                            <text x={cx} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
                                {formatMonthLabel(item.month)}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
