import {Header} from "@/shared/ui/header.jsx";
import { SideBar } from "@/pages/dashboard/ui/SideBar.jsx"
import { SidebarProvider, SidebarInset } from "@/shared/ui/sidebar"

export function DashboardPage() {
    return (
        <div>
            <Header />
            <SidebarProvider>
                <SideBar />
                <SidebarInset>
                    <main className="p-6">
                        {/* контент */}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}