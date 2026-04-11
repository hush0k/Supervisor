import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'

function Action({ to, title, subtitle }) {
    return (
        <Link
            to={to}
            className="border bg-white p-4 hover:border-primary/40 transition-colors flex items-center justify-between gap-3"
        >
            <div>
                <p className="text-sm font-bold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            </div>
            <FiArrowRight size={15} className="text-gray-500 shrink-0" />
        </Link>
    )
}

export function ProfileQuickActions({ isManager = false }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <Action to="/dashboard" title="Вернуться на дашборд" subtitle="Общая панель и виджеты" />
            <Action to="/leaderboard" title="Открыть лидерборд" subtitle="Сравнить результаты команды" />
            {isManager ? (
                <Action to="/company" title="Моя компания" subtitle="Аналитика зарплат и структуры" />
            ) : (
                <Action to="/my-tasks" title="Мои задачи" subtitle="Список доступных задач" />
            )}
        </div>
    )
}
