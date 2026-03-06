'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Settings, User, Bell, Building2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// Placeholders for the 4 tabs
import { ProfileSettings } from '@/components/settings/profile-settings'
import { NotificationPrefs } from '@/components/settings/notification-prefs'
import { DepartmentManager } from '@/components/settings/department-manager'
import { UserManager } from '@/components/settings/user-manager'

type SettingsTab = 'profile' | 'notifications' | 'departments' | 'users'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'admin') {
                setIsAdmin(true)
            }
            setLoading(false)
        }
        fetchRole()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand-teal mb-4" />
                <p className="text-slate-500">Loading settings...</p>
            </div>
        )
    }

    const tabs: { id: SettingsTab, label: string, icon: any, adminOnly?: boolean }[] = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'departments', label: 'Departments', icon: Building2, adminOnly: true },
        { id: 'users', label: 'Users & Roles', icon: Users, adminOnly: true },
    ]

    const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin)

    return (
        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Settings className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-50 border-r border-border bg-card/50 shrink-0 hidden md:block overflow-y-auto p-4">
                    <nav className="space-y-1">
                        {visibleTabs.map(tab => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground/70")} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Mobile Tabs (Scrollable horizontal) */}
                <div className="md:hidden border-b border-border bg-card px-4 shrink-0 flex gap-4 overflow-x-auto absolute w-full top-[73px] z-10">
                    {visibleTabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 mt-12 md:mt-0 relative">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'notifications' && <NotificationPrefs />}
                        {activeTab === 'departments' && isAdmin && <DepartmentManager />}
                        {activeTab === 'users' && isAdmin && <UserManager />}
                    </div>
                </div>
            </div>
        </div>
    )
}
