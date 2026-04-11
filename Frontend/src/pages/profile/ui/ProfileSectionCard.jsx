export function ProfileSectionCard({ title, subtitle, children, className = '', bodyClassName = '' }) {
    return (
        <div className={`bg-white border p-4 flex flex-col ${className}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
                {subtitle ? <span className="text-[11px] text-gray-400">{subtitle}</span> : null}
            </div>
            <div className={`flex-1 ${bodyClassName}`}>{children}</div>
        </div>
    )
}
