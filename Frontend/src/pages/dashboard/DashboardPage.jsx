import { Header } from "@/shared/ui/header.jsx"
import { LeftSideBar } from "@/pages/dashboard/ui/LeftSideBar.jsx"
import { RightSideBar } from "@/pages/dashboard/ui/RightSideBar.jsx"
import { SidebarProvider } from "@/shared/ui/sidebar"

export function DashboardPage() {
    return (
        <div className="flex flex-col bg-muted">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header variant="logo-left" />
            </div>
            <div className="grid ">
                <SidebarProvider
                    style={{ "--sidebar-top": "64px" }}
                    className="flex flex-1 overflow-hidden"
                >
                    <LeftSideBar />
                </SidebarProvider>
                <div>

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