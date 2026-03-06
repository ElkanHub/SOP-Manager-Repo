'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Beaker, FileText, Settings, PenTool, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuditLogEntry {
    id: string
    action: string
    entity_type: string
    created_at: string
    actor_id: string
    profiles: {
        full_name: string
    } | null
}

const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'sop': return <FileText className="h-4 w-4" />
        case 'pm task': return <Settings className="h-4 w-4" />
        case 'equipment': return <Database className="h-4 w-4" />
        case 'signature': return <PenTool className="h-4 w-4" />
        default: return <Activity className="h-4 w-4" />
    }
}

export function ActivityFeed({ initialData, deptId }: { initialData: AuditLogEntry[], deptId: string | null }) {
    const [feed, setFeed] = useState<AuditLogEntry[]>(initialData)
    const supabase = createClient()

    useEffect(() => {
        // Realtime subscription for this department (or global if QA/Admin with deptId=null)
        let query = supabase.channel('audit-feed').on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'audit_log' },
            async (payload) => {
                if (deptId && payload.new.dept_id !== deptId) return // skip if scoped and not match

                // Fetch the profile name
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', payload.new.actor_id)
                    .single()

                const newEntry: AuditLogEntry = {
                    ...(payload.new as any),
                    profiles: profile as any,
                }

                setFeed((prev) => [newEntry, ...prev].slice(0, 15)) // Keep last 15
            }
        ).subscribe()

        return () => { supabase.removeChannel(query) }
    }, [supabase, deptId])

    if (feed.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
                <Activity className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-sm font-medium text-slate-500">No recent activity.</p>
                <p className="text-xs text-slate-400 mt-1 text-center">Actions taken in your department will appear here automatically.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-[400px] flex flex-col overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4 shrink-0 bg-slate-50/50">
                <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-teal" />
                    Activity Feed
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1 relative before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-slate-100">
                    {feed.map((entry) => (
                        <div key={entry.id} className="relative flex items-start gap-4 rounded-lg p-3 hover:bg-slate-50 transition-colors animate-in slide-in-from-left-2 fade-in duration-300">
                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-500">
                                {getIcon(entry.entity_type)}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm text-slate-700 leading-snug">
                                    <span className="font-semibold text-brand-navy">{entry.profiles?.full_name ?? 'System'}</span>
                                    {' '}{entry.action}
                                    <span className="text-slate-500"> · {entry.entity_type}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
