function Row({ label, count, total, colorClass }) {
    const width = total > 0 ? (count / total) * 100 : 0
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{label}</span>
                <span className="font-semibold">{count}</span>
            </div>
            <div className="h-2 bg-gray-100 overflow-hidden">
                <div className={`h-full ${colorClass}`} style={{ width: `${width}%` }} />
            </div>
        </div>
    )
}

function RoleLabel({ role }) {
    if (role === 'supervisor') return 'Супервайзер'
    if (role === 'admin') return 'Админ'
    if (role === 'head') return 'Руководитель'
    return 'Сотрудник'
}

export function CompanyDistributionPanel({ roleDistribution, positionDistribution, employeesCount }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Роли в команде</h3>
                <div className="space-y-3">
                    {roleDistribution.length ? roleDistribution.map(item => (
                        <Row
                            key={item.role}
                            label={RoleLabel({ role: item.role })}
                            count={item.count}
                            total={employeesCount}
                            colorClass="bg-blue-500"
                        />
                    )) : <p className="text-sm text-gray-400">Нет данных</p>}
                </div>
            </div>

            <div className="bg-white border p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Должности</h3>
                <div className="space-y-3">
                    {positionDistribution.length ? positionDistribution.slice(0, 8).map(item => (
                        <Row
                            key={item.position_name}
                            label={item.position_name}
                            count={item.count}
                            total={employeesCount}
                            colorClass="bg-emerald-500"
                        />
                    )) : <p className="text-sm text-gray-400">Нет данных по должностям</p>}
                </div>
            </div>
        </div>
    )
}
