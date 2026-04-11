import { CustomCalendar } from "@/pages/dashboard/ui/CustomCalendar"
import { LeaderBoard } from "@/pages/dashboard/ui/LeaderBoard"
import { Link } from 'react-router-dom'
import { FiUser } from 'react-icons/fi'

export function RightSideBar() {
    return (
        <div className="hidden md:flex flex-col w-80 bg-white border-l shrink-0 overflow-y-auto">
            <CustomCalendar />
            <div className="px-4 pt-3">
                <Link
                    to="/profile"
                    className="w-full border bg-white hover:bg-gray-50 transition-colors h-10 px-3 text-sm font-semibold text-gray-700 inline-flex items-center justify-center gap-2"
                >
                    <FiUser size={14} />
                    Мой профиль
                </Link>
            </div>
            <p className="px-4 py-2 text-sm font-bold tracking-wider">ТОП 10 РАБОТНИКОВ</p>
            <LeaderBoard />
        </div>
    )
}
