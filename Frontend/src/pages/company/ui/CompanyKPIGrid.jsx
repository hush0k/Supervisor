import { FiUsers, FiBriefcase, FiActivity, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi'
import { IoCashOutline } from 'react-icons/io5'

function StatCard({ icon, label, value, sub, accent }) {
    return (
        <div className="bg-white border p-4">
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center ${accent}`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
                    <p className="text-xl font-extrabold leading-tight mt-1">{value}</p>
                    {sub ? <p className="text-xs text-gray-400 mt-1">{sub}</p> : null}
                </div>
            </div>
        </div>
    )
}

export function CompanyKPIGrid({ data }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
                icon={<FiUsers size={18} />}
                label="Сотрудники"
                value={data.employees_count}
                sub="В штате компании"
                accent="bg-blue-100 text-blue-700"
            />
            <StatCard
                icon={<IoCashOutline size={18} />}
                label="Фонд зарплат"
                value={`${data.total_salary.toLocaleString('ru-RU')} ₸`}
                sub={`Средняя: ${Math.round(data.avg_salary).toLocaleString('ru-RU')} ₸`}
                accent="bg-emerald-100 text-emerald-700"
            />
            <StatCard
                icon={<FiBriefcase size={18} />}
                label="Всего задач"
                value={data.tasks_total}
                sub={`В работе: ${data.tasks_in_progress}`}
                accent="bg-amber-100 text-amber-700"
            />
            <StatCard
                icon={<FiTrendingUp size={18} />}
                label="Успешность"
                value={`${Math.round(data.success_rate)}%`}
                sub={`Проверено: ${data.tasks_verified}, отклонено: ${data.tasks_failed}`}
                accent="bg-violet-100 text-violet-700"
            />
            <StatCard
                icon={<FiActivity size={18} />}
                label="Доступно"
                value={data.tasks_available}
                sub="Можно взять в работу"
                accent="bg-cyan-100 text-cyan-700"
            />
            <StatCard
                icon={<FiCheckCircle size={18} />}
                label="Завершено"
                value={data.tasks_completed}
                sub="Ожидают проверки"
                accent="bg-indigo-100 text-indigo-700"
            />
            <StatCard
                icon={<FiXCircle size={18} />}
                label="Бонусы"
                value={`${data.total_bonus.toLocaleString('ru-RU')} ₸`}
                sub="Суммарно по сотрудникам"
                accent="bg-rose-100 text-rose-700"
            />
            <StatCard
                icon={<FiCheckCircle size={18} />}
                label="Проверено"
                value={data.tasks_verified}
                sub="Успешно закрытые задачи"
                accent="bg-lime-100 text-lime-700"
            />
        </div>
    )
}
