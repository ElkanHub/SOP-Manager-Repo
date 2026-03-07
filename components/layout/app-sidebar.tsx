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
    LogOut,
    MoreVertical
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
    SidebarGroupContent,
    useSidebar
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    const { isMobile } = useSidebar()
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
        <Sidebar collapsible="icon" className="pt-14 border-r border-sidebar-border bg-sidebar" {...props}>
            <SidebarHeader className="border-b border-sidebar-border py-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-foreground/70 uppercase group-data-[collapsible=icon]:hidden">
                            My Department
                        </SidebarGroupLabel>
                        <SidebarMenuButton size="lg" className="mt-2 bg-sidebar-accent pointer-events-none w-full justify-start group-data-[collapsible=icon]:justify-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-navy text-white shrink-0">
                                <Building2 className="h-4 w-4 shrink-0" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none px-2 truncate group-data-[collapsible=icon]:hidden">
                                <span className="font-semibold text-sidebar-foreground truncate">{department?.name || 'Loading...'}</span>
                                <span className="text-xs text-sidebar-foreground/70 truncate">Active Workspace</span>
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
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-4 border-brand-teal !pl-2"
                                                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-4 border-transparent"
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
                        <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-foreground/70 uppercase flex items-center">
                            <ShieldAlert className="h-3 w-3 text-brand-teal mr-1" />
                            QA Oversight
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {allDepartments.map((dept) => (
                                    <SidebarMenuItem key={dept.id}>
                                        <SidebarMenuButton
                                            className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8"
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

            <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
                <SidebarMenu>

                    {/* User Profile Block */}
                    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg border border-border shrink-0">
                                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                                        <AvatarFallback className="rounded-lg bg-brand-navy text-xs text-white">
                                            {profile?.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-medium">{profile?.full_name || 'Loading...'}</span>
                                        <span className="truncate text-xs text-sidebar-foreground/70 capitalize">
                                            {profile?.role || '...'}
                                        </span>
                                    </div>
                                    <MoreVertical className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg border border-border">
                                            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                                            <AvatarFallback className="rounded-lg bg-brand-navy text-white text-xs">
                                                {profile?.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{profile?.full_name || 'User'}</span>
                                            <span className="truncate text-xs text-muted-foreground capitalize">
                                                {profile?.role || 'User'}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="flex items-center w-full cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-500 cursor-pointer"
                                    onClick={async () => {
                                        await supabase.auth.signOut({ scope: 'global' })
                                        window.location.href = '/login'
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
