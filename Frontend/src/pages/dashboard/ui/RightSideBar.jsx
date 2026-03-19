import {
    Sidebar, SidebarContent, SidebarFooter,
} from "@/shared/ui/sidebar"
import { MdDashboard, MdLeaderboard } from "react-icons/md"
import { BsBuildingFill } from "react-icons/bs"
import { BiTask } from "react-icons/bi"
import { useNavigate } from "react-router-dom"
import { CustomCalendar } from "@/pages/dashboard/ui/CustomCalendar"

export function RightSideBar() {
    const navigate = useNavigate()

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: <MdDashboard size={18} /> },
        { label: "Tasks", path: "/tasks", icon: <BiTask size={18} /> },
        { label: "Leaderboard", path: "/leaderboard", icon: <MdLeaderboard size={18} /> },
        { label: "Моя компания", path: "/company", icon: <BsBuildingFill size={18} /> },
    ]

    return (
        <div className="hidden lg:block">
            <Sidebar className="bg-white w-66" side="right">
                <SidebarContent>
                    <CustomCalendar />
                    
                </SidebarContent>
            </Sidebar>
        </div>
    )
}