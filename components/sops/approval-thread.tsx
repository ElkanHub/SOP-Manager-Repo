'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { CheckCircle2, MessageSquare, AlertCircle, RefreshCw, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Comment {
    id: string
    author_id: string
    comment: string
    action: 'comment' | 'changes_requested' | 'approved' | 'resubmitted' | null
    created_at: string
    profiles?: { full_name: string; role: string }
}

interface ApprovalThreadProps {
    requestId: string
    onUpdate?: () => void
}

const actionConfig: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
    comment: { label: 'Comment', icon: MessageSquare, classes: 'bg-slate-100 text-slate-600' },
    changes_requested: { label: 'Changes Requested', icon: AlertCircle, classes: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', icon: CheckCircle2, classes: 'bg-green-100 text-green-700' },
    resubmitted: { label: 'Resubmitted', icon: RefreshCw, classes: 'bg-blue-100 text-blue-700' },
}

export function ApprovalThread({ requestId, onUpdate }: ApprovalThreadProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchComments = async () => {
        const { data } = await supabase
            .from('sop_approval_comments')
            .select('*, profiles(full_name, role)')
            .eq('request_id', requestId)
            .order('created_at', { ascending: true })
        setComments((data ?? []) as Comment[])
        setLoading(false)
    }

    useEffect(() => {
        fetchComments()

        // Realtime subscription for new comments
        const channel = supabase
            .channel(`approval-thread-${requestId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'sop_approval_comments',
                filter: `request_id=eq.${requestId}`,
            }, () => {
                fetchComments()
                onUpdate?.()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [requestId])

    if (loading) return <div className="text-xs text-slate-400 py-4 text-center">Loading thread...</div>

    return (
        <div className="space-y-3">
            {comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">No comments yet.</p>
            ) : (
                comments.map((c) => {
                    const cfg = actionConfig[c.action ?? 'comment'] ?? actionConfig.comment
                    const Icon = cfg.icon
                    return (
                        <div key={c.id} className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white text-[10px] font-bold uppercase">
                                {c.profiles?.full_name?.[0] ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-xs font-semibold text-slate-800">
                                        {c.profiles?.full_name ?? 'Unknown'}
                                    </span>
                                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', cfg.classes)}>
                                        <Icon className="h-2.5 w-2.5" />
                                        {cfg.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-auto">
                                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                {c.comment && (
                                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                        {c.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}
