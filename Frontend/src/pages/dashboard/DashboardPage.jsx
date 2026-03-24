import { Header } from "@/shared/ui/header.jsx"
import { LeftSideBar } from "@/pages/dashboard/ui/LeftSideBar.jsx"
import { RightSideBar } from "@/pages/dashboard/ui/RightSideBar.jsx"
import { MainBlock } from "@/pages/dashboard/ui/MainBlock"

export function DashboardPage() {
    return (
        <div className="flex flex-col h-screen">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header variant="logo-left" />
            </div>
            <div className="flex flex-1 mt-16 overflow-hidden">
                <LeftSideBar />
                <main className="flex-1 min-w-0 overflow-y-auto dot-bg">
                    <MainBlock />
                </main>
                <RightSideBar />
            </div>
        </div>
    )
}