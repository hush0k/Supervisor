import {
    Sidebar, SidebarContent, SidebarFooter,
    SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton
} from "@/shared/ui/sidebar"
import { MdDashboard, MdLeaderboard } from "react-icons/md"
import { BsBuildingFill } from "react-icons/bs"
import { BiTask } from "react-icons/bi"
import { GrLogout } from "react-icons/gr"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/entities/user/model/store.js"

export function SideBar() {
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: MdDashboard },
        { label: "Tasks", path: "/tasks", icon: BiTask },
        { label: "Leaderboard", path: "/leaderboard", icon: MdLeaderboard },
        { label: "Моя компания", path: "/company", icon: BsBuildingFill },
    ]

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <p className="text-xs text-muted-foreground font-semibold">MANAGEMENT</p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton onClick={() => navigate(item.path)}>
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <SidebarMenuButton onClick={() => { localStorage.clear(); window.location.href = '/home' }}>
                    <GrLogout />
                    <span>Выйти</span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    )
}