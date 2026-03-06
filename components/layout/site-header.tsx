'use client'

import { Bell, Search, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SiteHeader() {
    const router = useRouter()
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

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

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

            {/* Right side: Actions & User */}
            <div className="flex items-center gap-4">
                {/* Bell Icon */}
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-slate-800">
                    <Bell className="h-5 w-5" />
                    {/* Static Unread Badge */}
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-brand-teal"></span>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8 border border-slate-700">
                                <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
                                <AvatarFallback className="bg-slate-800 text-xs text-brand-teal">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-brand-navy">{profile?.full_name || 'Loading...'}</p>
                                <p className="text-xs leading-none text-slate-500">{profile?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-50 focus:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
