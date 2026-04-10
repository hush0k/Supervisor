function formatMonthLabel(month) {
    const [year, mon] = month.split('-')
    return new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString('ru-RU', { month: 'short' })
}

export function CompanyTasksChart({ data }) {
    if (!data.length) {
        return <div className="h-72 flex items-center justify-center text-gray-400 text-sm">Нет данных по месяцам</div>
    }

    const maxValue = Math.max(...data.map(d => Math.max(d.verified, d.failed)), 1)

    const W = 760
    const H = 280
    const PAD = { top: 14, right: 12, bottom: 44, left: 40 }
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const xStep = innerW / Math.max(data.length - 1, 1)

    const toX = i => PAD.left + i * xStep
    const toY = v => PAD.top + innerH - (v / maxValue) * innerH

    const verifiedLine = data.map((item, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(item.verified)}`).join(' ')
    const failedLine = data.map((item, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(item.failed)}`).join(' ')

    const verifiedArea = [
        ...data.map((item, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(item.verified)}`),
        `L ${toX(data.length - 1)} ${PAD.top + innerH}`,
        `L ${toX(0)} ${PAD.top + innerH}`,
        'Z',
    ].join(' ')

    const yTicks = [0, Math.round(maxValue / 2), maxValue]

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
                <defs>
                    <linearGradient id="companyVerified" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {yTicks.map(v => (
                    <g key={v}>
                        <line
                            x1={PAD.left}
                            y1={toY(v)}
                            x2={W - PAD.right}
                            y2={toY(v)}
                            stroke="#f0f0f0"
                            strokeWidth="1"
                        />
                        <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                            {v}
                        </text>
                    </g>
                ))}

                <path d={verifiedArea} fill="url(#companyVerified)" />
                <path d={verifiedLine} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                <path d={failedLine} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                {data.map((item, i) => (
                    <g key={item.month}>
                        <circle cx={toX(i)} cy={toY(item.verified)} r="3.5" fill="#10b981" />
                        <circle cx={toX(i)} cy={toY(item.failed)} r="3.5" fill="#ef4444" />
                        <text x={toX(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">
                            {formatMonthLabel(item.month)}
                        </text>
                    </g>
                ))}
            </svg>

            <div className="flex items-center gap-5 pt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-emerald-500" /> Подтверждено
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 bg-red-500" /> Отклонено
                </div>
            </div>
        </div>
    )
}
