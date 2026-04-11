function Meter({ label, value, tone = 'blue' }) {
    const normalized = Math.max(0, Math.min(100, Math.round(value || 0)))
    const tones = {
        blue: '#3b82f6',
        emerald: '#10b981',
        rose: '#ef4444',
    }
    const color = tones[tone] || tones.blue

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
                <p className="text-gray-700 font-semibold">{label}</p>
                <p className="text-gray-900 font-extrabold">{normalized}%</p>
            </div>
            <div className="h-3 bg-gray-100">
                <div className="h-full transition-all duration-700" style={{ width: `${normalized}%`, background: color }} />
            </div>
        </div>
    )
}

export function ProfileProgressPanel({ data }) {
    const leaderboardPosition = data?.leaderboard_position ? `#${data.leaderboard_position}` : '—'

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="border p-3 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Рейтинг</p>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">{leaderboardPosition}</p>
                </div>
                <div className="border p-3 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Командный KPI</p>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                        {Math.round(data?.group_success_rate || 0)}%
                    </p>
                </div>
            </div>

            <Meter label="Личная успешность" value={data?.success_rate || 0} tone="emerald" />
            <Meter label="Успех в групповых задачах" value={data?.group_success_rate || 0} tone="blue" />
            <Meter
                label="Расчетная доля задач в работе"
                value={
                    ((data?.tasks_in_progress || 0) / Math.max((data?.tasks_in_progress || 0) + (data?.tasks_verified || 0), 1)) * 100
                }
                tone="rose"
            />
        </div>
    )
}
