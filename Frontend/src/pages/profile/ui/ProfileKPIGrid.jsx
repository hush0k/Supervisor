import { FiCheckCircle, FiClock, FiDollarSign, FiTarget, FiTrendingUp, FiUsers } from 'react-icons/fi'

function KpiItem({ label, value, hint, icon, tone = 'blue' }) {
    const toneMap = {
        blue: { text: 'text-blue-700', border: 'border-blue-200' },
        amber: { text: 'text-amber-700', border: 'border-amber-200' },
        emerald: { text: 'text-emerald-700', border: 'border-emerald-200' },
        rose: { text: 'text-rose-700', border: 'border-rose-200' },
    }
    const colors = toneMap[tone] || toneMap.blue

    return (
        <div className="border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold ${colors.text}`}>{label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-900 truncate">{value}</p>
                    <p className="mt-1 text-xs text-gray-600 truncate">{hint}</p>
                </div>
                <div className={`w-9 h-9 border bg-gray-50 flex items-center justify-center shrink-0 ${colors.border} ${colors.text}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function formatMoney(value) {
    return `${Math.round(value || 0).toLocaleString('ru-RU')} ₸`
}

export function ProfileKPIGrid({ data }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiItem
                tone="amber"
                label="Очки за период"
                value={(data?.current_month_points || 0).toLocaleString('ru-RU')}
                hint={`Прошлый период: ${(data?.last_month_points || 0).toLocaleString('ru-RU')}`}
                icon={<FiTrendingUp size={16} />}
            />
            <KpiItem
                tone="blue"
                label="Позиция в рейтинге"
                value={data?.leaderboard_position ? `#${data.leaderboard_position}` : '—'}
                hint="Текущий месяц"
                icon={<FiTarget size={16} />}
            />
            <KpiItem
                tone="emerald"
                label="Подтверждено"
                value={data?.tasks_verified || 0}
                hint={`Успешность: ${Math.round(data?.success_rate || 0)}%`}
                icon={<FiCheckCircle size={16} />}
            />
            <KpiItem
                tone="rose"
                label="Заработок"
                value={formatMoney(data?.profit_for_period || 0)}
                hint="За выбранный период"
                icon={<FiDollarSign size={16} />}
            />
            <KpiItem
                tone="blue"
                label="Задач в работе"
                value={data?.tasks_in_progress || 0}
                hint={`Доступно: ${data?.tasks_available || 0}`}
                icon={<FiClock size={16} />}
            />
            <KpiItem
                tone="emerald"
                label="Групповых задач"
                value={data?.group_tasks_completed || 0}
                hint={`Ср. команда: ${Number(data?.avg_team_size || 0).toFixed(1)}`}
                icon={<FiUsers size={16} />}
            />
            <KpiItem
                tone="amber"
                label="Личная успешность"
                value={`${Math.round(data?.success_rate || 0)}%`}
                hint="Подтверждено / закрыто"
                icon={<FiTrendingUp size={16} />}
            />
            <KpiItem
                tone="rose"
                label="Успех в группах"
                value={`${Math.round(data?.group_success_rate || 0)}%`}
                hint="Групповые задачи"
                icon={<FiTrendingUp size={16} />}
            />
        </div>
    )
}
