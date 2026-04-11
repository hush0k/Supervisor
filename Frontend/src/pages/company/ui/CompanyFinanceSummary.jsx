import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi'

function formatMoney(value) {
    return `${Math.round(value || 0).toLocaleString('ru-RU')} ₸`
}

function formatMonth(month) {
    if (!month) return '—'
    const [year, mon] = String(month).split('-').map(Number)
    return new Date(year, (mon || 1) - 1, 1).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
    })
}

function InfoCard({ label, value, hint, trend = null }) {
    return (
        <div className="border bg-white p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
            {hint ? (
                <div className="mt-1 text-xs inline-flex items-center gap-1">
                    {trend !== null && (trend >= 0
                        ? <FiTrendingUp className="text-emerald-600" size={12} />
                        : <FiTrendingDown className="text-rose-600" size={12} />)}
                    <span className={trend === null ? 'text-gray-500' : trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {hint}
                    </span>
                </div>
            ) : null}
        </div>
    )
}

export function CompanyFinanceSummary({ data }) {
    const monthly = data?.monthly_compensation_stats ?? []
    const current = monthly[monthly.length - 1] ?? null
    const prev = monthly.length > 1 ? monthly[monthly.length - 2] : null

    const payrollDelta = current && prev ? current.payroll_fund - prev.payroll_fund : null
    const bonusDelta = current && prev ? current.bonus_paid - prev.bonus_paid : null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard
                label="Фонд зарплат (текущий)"
                value={formatMoney(current?.payroll_fund)}
                hint={current ? `${formatMonth(current.month)} · ${current.employees_count} сотрудников` : 'Нет данных за текущий месяц'}
            />
            <InfoCard
                label="Средняя зарплата"
                value={formatMoney(current?.avg_salary ?? data?.avg_salary)}
                hint="По сотрудникам компании"
            />
            <InfoCard
                label="Бонусы (текущий)"
                value={formatMoney(current?.bonus_paid)}
                hint={bonusDelta !== null ? `${bonusDelta >= 0 ? '+' : ''}${formatMoney(bonusDelta)} к прошлому месяцу` : 'Нет данных для сравнения'}
                trend={bonusDelta}
            />
            <InfoCard
                label="Общий фонд зарплат"
                value={formatMoney(data?.total_salary)}
                hint={payrollDelta !== null ? `${payrollDelta >= 0 ? '+' : ''}${formatMoney(payrollDelta)} к прошлому месяцу` : `Всего бонусов: ${formatMoney(data?.total_bonus)}`}
                trend={payrollDelta}
            />
        </div>
    )
}
