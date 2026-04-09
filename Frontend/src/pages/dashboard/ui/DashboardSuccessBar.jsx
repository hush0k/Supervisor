function Bar({ label, value, color, max }) {
    const pct = max > 0 ? (value / max) * 100 : 0
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className="font-bold" style={{ color }}>{value}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    )
}

export function DashboardSuccessBar({ data }) {
    const solo  = Math.round(data.success_rate)
    const group = Math.round(data.group_success_rate)
    const max   = Math.max(solo, group, 1)

    return (
        <div className="flex flex-col gap-4">
            <Bar label="Соло задачи"    value={solo}  color="#10b981" max={max} />
            <Bar label="Групповые задачи" value={group} color="#6366f1" max={max} />
        </div>
    )
}
