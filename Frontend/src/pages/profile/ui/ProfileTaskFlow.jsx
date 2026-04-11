function Row({ label, value, total, color }) {
    const safeTotal = Math.max(total, 1)
    const percent = Math.round((value / safeTotal) * 100)
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-gray-600">{label}</span>
                <span className="font-semibold text-gray-800">{value} ({percent}%)</span>
            </div>
            <div className="h-2 bg-gray-100">
                <div className="h-full transition-all duration-700" style={{ width: `${percent}%`, background: color }} />
            </div>
        </div>
    )
}

export function ProfileTaskFlow({ data }) {
    const available = data?.tasks_available || 0
    const inProgress = data?.tasks_in_progress || 0
    const verified = data?.tasks_verified || 0
    const total = available + inProgress + verified

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
                <div className="border p-2.5 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Доступно</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{available}</p>
                </div>
                <div className="border p-2.5 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">В работе</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{inProgress}</p>
                </div>
                <div className="border p-2.5 bg-gray-50">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Проверено</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{verified}</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <Row label="Доступные задачи" value={available} total={total} color="#3b82f6" />
                <Row label="Задачи в работе" value={inProgress} total={total} color="#f59e0b" />
                <Row label="Подтвержденные задачи" value={verified} total={total} color="#10b981" />
            </div>

            {total === 0 ? <p className="text-xs text-gray-400">Пока нет данных по задачам за выбранный период.</p> : null}
        </div>
    )
}
