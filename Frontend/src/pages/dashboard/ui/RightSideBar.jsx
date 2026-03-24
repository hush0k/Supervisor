import { CustomCalendar } from "@/pages/dashboard/ui/CustomCalendar"
import { LeaderBoard } from "@/pages/dashboard/ui/LeaderBoard"

export function RightSideBar() {
    return (
        <div className="hidden md:flex flex-col w-80 bg-white border-l shrink-0 overflow-y-auto">
            <CustomCalendar />
            <p className="px-4 py-2 text-sm font-bold tracking-wider">ТОП 10 РАБОТНИКОВ</p>
            <LeaderBoard />
        </div>
    )
}