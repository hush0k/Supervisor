import { Header } from "@/shared/ui/header.jsx"
import { LeftSideBar } from "@/pages/dashboard/ui/LeftSideBar.jsx"
import { RightSideBar } from "@/pages/dashboard/ui/RightSideBar.jsx"
import { SidebarProvider } from "@/shared/ui/sidebar"
import { MainBlock } from "@/pages/dashboard/ui/MainBlock"

export function DashboardPage() {
    return (
        <div className="flex flex-col dot-bg h-screen">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header variant="logo-left" />
            </div>
            <div className="flex flex-row flex-1 mt-16 overflow-hidden h-[calc(100vh-64px)]">
                <SidebarProvider
                    style={{ "--sidebar-top": "64px" }}
                    className="flex flex-1 overflow-hidden"
                >
                    <LeftSideBar />
                </SidebarProvider>
                <div>
                <div className="flex-1 overflow-y-auto">
                    <MainBlock />
                </div>
                </div>
                <SidebarProvider
                    style={{ "--sidebar-top": "64px" }}
                    className="flex flex-1 overflow-hidden"
                >
                    <RightSideBar />
                </SidebarProvider>
            </div>
        </div>
    )
}