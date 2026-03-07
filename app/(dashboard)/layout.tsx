'use client'

import { useState } from 'react'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { ThePulse } from "@/components/layout/the-pulse"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [pulseOpen, setPulseOpen] = useState(true)

    return (
        <SidebarProvider>
            <div className="flex flex-col w-full h-svh overflow-hidden bg-background">
                <SiteHeader />
                <div className="flex flex-1 overflow-hidden relative w-full">
                    <AppSidebar />

                    {/* Main Content Area */}
                    <main className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden transition-[margin] duration-300 ease-linear ${pulseOpen ? 'xl:mr-[300px]' : ''}`}>
                        {children}
                    </main>

                    <ThePulse open={pulseOpen} onToggle={() => setPulseOpen(o => !o)} />
                </div>
            </div>
        </SidebarProvider>
    )
}
