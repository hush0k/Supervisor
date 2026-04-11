import { FiBriefcase, FiUser } from 'react-icons/fi'

function roleLabel(role) {
    if (role === 'admin') return 'Администратор'
    if (role === 'supervisor') return 'Супервайзер'
    if (role === 'head') return 'Руководитель'
    return 'Сотрудник'
}

function initials(user) {
    if (!user) return 'U'
    const first = user.first_name?.[0] || ''
    const last = user.last_name?.[0] || ''
    return `${first}${last}`.toUpperCase() || 'U'
}

export function ProfileHeroCard({ user }) {
    return (
        <div className="border bg-white p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 border bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-lg font-black text-gray-600">{initials(user)}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Personal Snapshot</p>
                        <h2 className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-gray-900 truncate">
                            {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Профиль'}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1.5">
                                <FiUser size={14} />
                                {roleLabel(user?.role)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <FiBriefcase size={14} />
                                {user?.position?.name || 'Без должности'}
                            </span>
                            <span className="text-gray-400">ID: {user?.id ?? '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-[240px]">
                    <div className="border p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">Оклад</p>
                        <p className="text-lg font-extrabold mt-1 text-gray-900">
                            {Math.round(user?.salary || 0).toLocaleString('ru-RU')} ₸
                        </p>
                    </div>
                    <div className="border p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">Бонус</p>
                        <p className="text-lg font-extrabold mt-1 text-gray-900">
                            {Math.round(user?.bonus || 0).toLocaleString('ru-RU')} ₸
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
