'use client'

import * as React from "react"
import {
    LayoutDashboard,
    Library,
    Wrench,
    Calendar,
    FileText,
    Settings,
    ShieldAlert,
    Building2,
    LogOut
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const mainNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "SOP Library", url: "/sops", icon: Library },
    { title: "Equipments", url: "/equipment", icon: Wrench },
    { title: "Calendar", url: "/calendar", icon: Calendar },
    { title: "Reports", url: "/reports", icon: FileText },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const supabase = createClient()
    const [profile, setProfile] = React.useState<any>(null)
    const [department, setDepartment] = React.useState<any>(null)
    const [allDepartments, setAllDepartments] = React.useState<any[]>([])

    React.useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: prof } = await supabase.from('profiles').select('*, departments(*)').eq('id', user.id).single()
            if (prof) {
                setProfile(prof)
                setDepartment(prof.departments)

                // If QA or Admin, fetch all departments for oversight
                if (prof.departments?.is_qa || prof.role === 'admin') {
                    const { data: depts } = await supabase.from('departments').select('*').order('name')
                    if (depts) setAllDepartments(depts)
                }
            }
        }
        loadData()
    }, [])

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white" {...props}>
            <SidebarHeader className="border-b border-slate-100 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarGroupLabel className="text-xs font-bold tracking-wider text-slate-500 uppercase group-data-[collapsible=icon]:hidden">
                            My Department
                        </SidebarGroupLabel>
                        <SidebarMenuButton size="lg" className="mt-2 bg-slate-50 pointer-events-none w-full justify-start group-data-[collapsible=icon]:justify-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-navy text-white shrink-0">
                                <Building2 className="h-4 w-4 shrink-0" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none px-2 truncate group-data-[collapsible=icon]:hidden">
                                <span className="font-semibold text-brand-navy truncate">{department?.name || 'Loading...'}</span>
                                <span className="text-xs text-slate-500 truncate">Active Workspace</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent className="pt-4">
                        <SidebarMenu>
                            {mainNavItems.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "transition-all h-10",
                                                isActive
                                                    ? "bg-blue-50 text-brand-blue font-semibold border-l-4 border-brand-teal !pl-2"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy border-l-4 border-transparent"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={cn("h-4 w-4", isActive ? "text-brand-teal" : "")} />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* QA Conditional: All Departments */}
                {allDepartments.length > 0 && (
                    <SidebarGroup className="mt-4">
                        <SidebarGroupLabel className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center">
                            <ShieldAlert className="h-3 w-3 text-brand-teal mr-1" />
                            QA Oversight
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {allDepartments.map((dept) => (
                                    <SidebarMenuItem key={dept.id}>
                                        <SidebarMenuButton
                                            className="text-slate-600 hover:bg-slate-50 hover:text-brand-navy h-8"
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: dept.color ? `var(--${dept.color}-500, #94a3b8)` : '#0ea5e9' }}
                                            />
                                            <span className="text-sm truncate">{dept.name}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-100 p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="text-slate-600 hover:bg-slate-50 hover:text-brand-navy h-10 mb-2">
                            <Link href="/settings">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* User Profile Block */}
                    <SidebarMenuItem className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200 shrink-0">
                            <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
                            <AvatarFallback className="bg-brand-navy text-xs text-white">
                                {profile?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden leading-tight flex-1 group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-semibold text-brand-navy truncate">
                                {profile?.full_name || 'Loading...'}
                            </span>
                            <span className="text-xs text-slate-500 capitalize truncate">
                                {profile?.role || '...'}
                            </span>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
