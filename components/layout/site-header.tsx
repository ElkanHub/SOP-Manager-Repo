'use client'

import { Bell, Search, ShieldCheck } from 'lucide-react'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function SiteHeader() {
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setProfile(data)
            }
        }
        loadUser()
    }, [])

    return (
        <header className="sticky top-0 z-50 flex h-12 w-full items-center justify-between bg-brand-navy px-4 text-white shadow-sm shrink-0">
            {/* Left side: branding & sidebar trigger */}
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:bg-slate-800 hover:text-white" />
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-brand-teal" />
                    <span className="text-lg font-bold tracking-tight hidden sm:inline-block">SOP-Guard Pro</span>
                </div>
            </div>

            {/* Center: Search */}
            <div className="hidden flex-1 items-center justify-center px-6 md:flex">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Search SOPs, Equipment, Notices..."
                        className="h-8 w-full rounded-md border-slate-700 bg-slate-800/50 pl-9 pr-4 text-sm text-white placeholder:text-slate-400 focus-visible:ring-brand-teal border-none focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Bell Icon */}
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-slate-800">
                    <Bell className="h-5 w-5" />
                    {/* Static Unread Badge */}
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-brand-teal"></span>
                </Button>
            </div>
        </header>
    )
}
