import { MdDashboard, MdLeaderboard } from "react-icons/md"
import { BsBuildingFill } from "react-icons/bs"
import { BiTask } from "react-icons/bi"
import { useNavigate } from "react-router-dom"
import { RiTeamFill } from "react-icons/ri"
import { AiFillControl } from "react-icons/ai"

export function LeftSideBar() {
    const navigate = useNavigate()
    const menuItems = [
        { label: "Главная", path: "/dashboard", icon: <MdDashboard size={18} /> },
        { label: "Сотрудники", path: "/team", icon: <RiTeamFill size={18} /> },
        { label: "Задачи", path: "/tasks", icon: <BiTask size={18} /> },
        { label: "Проверка задач", path: "/tasks", icon: <AiFillControl size={18} /> },
        { label: "Таблица лидеров", path: "/leaderboard", icon: <MdLeaderboard size={18} /> },
        { label: "Моя компания", path: "/company", icon: <BsBuildingFill size={18} /> },
    ]

    return (
        <div className="hidden lg:flex flex-col w-64 bg-white border-r shrink-0">
            <nav className="flex flex-col flex-1 py-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        className="group/item text-left flex flex-row items-center hover:bg-accent rounded-md transition-colors"
                    >
                        <div className="h-10 w-1 mr-6 bg-transparent group-hover/item:bg-primary transition-colors" />
                        <div className="flex flex-row items-center gap-2 group-hover/item:text-primary">
                            {item.icon}{item.label}
                        </div>
                    </button>
                ))}
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