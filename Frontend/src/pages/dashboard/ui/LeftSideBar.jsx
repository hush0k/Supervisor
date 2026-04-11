import { MdDashboard, MdLeaderboard } from "react-icons/md"
import { BsBuildingFill } from "react-icons/bs"
import { BiTask } from "react-icons/bi"
import { useNavigate, useLocation } from "react-router-dom"
import { RiTeamFill } from "react-icons/ri"
import { AiFillControl } from "react-icons/ai"
import { useAuthStore } from "@/entities/user/model/store"

export function LeftSideBar() {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const role = useAuthStore(s => s.user?.role)
    const isManager = role === 'admin' || role === 'supervisor'

    const managerItems = [
        { label: "Главная",          path: "/dashboard",  icon: <MdDashboard size={18} /> },
        { label: "Сотрудники",       path: "/team",       icon: <RiTeamFill size={18} /> },
        { label: "Задачи",           path: "/tasks",      icon: <BiTask size={18} /> },
        { label: "Проверка задач",   path: "/task-check", icon: <AiFillControl size={18} /> },
        { label: "Таблица лидеров",  path: "/leaderboard",icon: <MdLeaderboard size={18} /> },
        { label: "Моя компания",     path: "/company",    icon: <BsBuildingFill size={18} /> },
    ]
    const userItems = [
        { label: "Главная",          path: "/dashboard",  icon: <MdDashboard size={18} /> },
        { label: "Мои задачи",       path: "/my-tasks",   icon: <BiTask size={18} /> },
        { label: "Активные задачи",  path: "/active-tasks", icon: <AiFillControl size={18} /> },
        { label: "Таблица лидеров",  path: "/leaderboard",icon: <MdLeaderboard size={18} /> },
    ]
    const menuItems = isManager ? managerItems : userItems

    return (
        <div className="hidden lg:flex flex-col w-64 bg-white border-r shrink-0">
            <nav className="flex flex-col flex-1 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`group/item text-left flex flex-row items-center hover:bg-accent transition-colors ${isActive ? 'bg-accent' : ''}`}
                        >
                            <div className={`h-10 w-1 mr-6 transition-colors ${isActive ? 'bg-primary' : 'bg-transparent group-hover/item:bg-primary'}`} />
                            <div className={`flex flex-row items-center gap-2 ${isActive ? 'text-primary font-semibold' : 'group-hover/item:text-primary'}`}>
                                {item.icon}{item.label}
                            </div>
                        </button>
                    )
                })}
            </nav>
            <div className="py-4 px-3">
                <div className="bg-muted p-2">
                    <p className="text-gray-500 italic text-xs">"Работай как проклятый. 80–100 часов в неделю — и ты будешь впереди всех."</p>
                    <p className="text-gray-500 italic text-xs text-right pt-2">- Илон Маск</p>
                </div>
            </div>
        </div>
    )
}
