import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { ThePulse } from "@/components/layout/the-pulse"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex flex-col w-full h-svh overflow-hidden bg-background">
                <SiteHeader />
                <div className="flex flex-1 overflow-hidden relative w-full">
                    <AppSidebar />

                    {/* Main Content Area - Responsive Margins per UI Spec */}
                    {/* md:mr-[300px] pushes the content aside so it isn't buried underneath ThePulse */}
                    <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden xl:mr-[300px]">
                        {children}
                    </main>

                    <ThePulse />
                </div>
            </div>
        </SidebarProvider>
    )
}
