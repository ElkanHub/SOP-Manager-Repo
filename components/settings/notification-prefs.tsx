'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, SmartphoneNfc } from 'lucide-react'
import { toast } from 'sonner'

export function NotificationPrefs() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [prefs, setPrefs] = useState({
        email: true,
        pulse: true
    })

    const supabase = createClient()

    useEffect(() => {
        async function loadPrefs() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('profiles')
                .select('notification_prefs')
                .eq('id', user.id)
                .single() as any

            if (data?.notification_prefs) {
                setPrefs(data.notification_prefs)
            }
            setLoading(false)
        }
        loadPrefs()
    }, [supabase])

    const handleToggle = async (key: 'email' | 'pulse', value: boolean) => {
        const newPrefs = { ...prefs, [key]: value }
        setPrefs(newPrefs) // Optimistic update
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const { error } = await supabase
                .from('profiles')
                .update({ notification_prefs: newPrefs } as any)
                .eq('id', user.id)

            if (error) throw error
            toast.success("Preferences updated")
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to save preferences")
            // Revert changes
            setPrefs(prefs)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex h-32 items-center justify-center bg-card rounded-xl border border-border">
            <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
        </div>
    )

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Communication Settings</h2>
                    <p className="text-sm text-muted-foreground">Decide how SOP-Guard Pro contacts you.</p>
                </div>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />}
            </div>

            <div className="p-6 space-y-8">

                {/* Email Toggles */}
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="pt-1">
                            <Label htmlFor="email-toggle" className="text-base font-semibold text-foreground cursor-pointer">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">Receive a daily digest of new PM assignments, overdue SOPs, and system notices directly to your inbox.</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Switch
                            id="email-toggle"
                            checked={prefs.email}
                            onCheckedChange={(v) => handleToggle('email', v)}
                            disabled={saving}
                        />
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Pulse In-App Toggles */}
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                            <SmartphoneNfc className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="pt-1">
                            <Label htmlFor="pulse-toggle" className="text-base font-semibold text-foreground cursor-pointer">"The Pulse" Alerts</Label>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">Allow the real-time sidebar to pop open and display urgent broadcast notices or immediate workflow tasks.</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Switch
                            id="pulse-toggle"
                            checked={prefs.pulse}
                            onCheckedChange={(v) => handleToggle('pulse', v)}
                            disabled={saving}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}
