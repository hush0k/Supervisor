function Bar({ label, value, color }) {
    const pct = Math.min(Math.max(value, 0), 100)
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-2">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color }}>
                    {value}<span className="text-base font-semibold ml-0.5">%</span>
                </span>
            </div>
            <div className="h-2.5 bg-gray-100 overflow-hidden">
                <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    )
}

export function DashboardSuccessBar({ data }) {
    const solo  = Math.round(data.success_rate)
    const group = Math.round(data.group_success_rate)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Bar label="Соло задачи"      value={solo}  color="#10b981" />
            <Bar label="Групповые задачи" value={group} color="#3b82f6" />
        </div>
    )
}
