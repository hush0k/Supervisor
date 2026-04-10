import { Header } from '@/shared/ui/header.jsx'
import { LeftSideBar } from '@/pages/dashboard/ui/LeftSideBar.jsx'
import { CompanyContent } from '@/pages/company/ui/CompanyContent.jsx'

export function CompanyPage() {
    return (
        <div className="flex flex-col h-screen">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header variant="logo-left" />
            </div>
            <div className="flex flex-1 mt-16 overflow-hidden">
                <LeftSideBar />
                <main className="flex flex-col flex-1 min-w-0 h-full overflow-y-auto dot-bg">
                    <CompanyContent />
                </main>
            </div>
        </div>
    )
}
