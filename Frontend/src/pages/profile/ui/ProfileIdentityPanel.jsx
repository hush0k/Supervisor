import { FiCalendar, FiBriefcase, FiHash, FiGlobe, FiUser } from 'react-icons/fi'

function Field({ icon, label, value }) {
    return (
        <div className="border p-3 bg-white">
            <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-800 inline-flex items-center gap-2">
                <span className="text-gray-400">{icon}</span>
                <span className="truncate">{value}</span>
            </p>
        </div>
    )
}

export function ProfileIdentityPanel({ user }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <Field icon={<FiUser size={14} />} label="Логин" value={user?.login || '—'} />
            <Field
                icon={<FiCalendar size={14} />}
                label="Дата рождения"
                value={user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('ru-RU') : '—'}
            />
            <Field icon={<FiBriefcase size={14} />} label="Должность" value={user?.position?.name || '—'} />
            <Field icon={<FiHash size={14} />} label="ID пользователя" value={user?.id ?? '—'} />
            <Field icon={<FiGlobe size={14} />} label="ID компании" value={user?.company_id ?? '—'} />
            <Field
                icon={<FiCalendar size={14} />}
                label="В системе с"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}
            />
        </div>
    )
}
