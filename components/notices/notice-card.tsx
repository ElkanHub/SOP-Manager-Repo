'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Check, Trash2, Users, Building2, User } from 'lucide-react'
import { toast } from 'sonner'

interface Notice {
    id: string
    subject: string
    message: string
    audience: 'everyone' | 'department' | 'individuals'
    created_at: string
    author_name?: string
    author_initials?: string
    ack_count?: number
    total_count?: number
}

interface NoticeCardProps {
    notice: Notice
    currentUserId: string
    isAuthor: boolean
    isAcknowledged: boolean
    onDelete: (id: string) => void
}

const AudienceIcon = ({ audience }: { audience: string }) => {
    if (audience === 'everyone') return <Users className="h-2.5 w-2.5" />
    if (audience === 'department') return <Building2 className="h-2.5 w-2.5" />
    return <User className="h-2.5 w-2.5" />
}

export function NoticeCard({ notice, currentUserId, isAuthor, isAcknowledged, onDelete }: NoticeCardProps) {
    const [acked, setAcked] = useState(isAcknowledged)
    const [deleting, setDeleting] = useState(false)
    const supabase = createClient()

    const handleAcknowledge = async () => {
        if (acked) return
        const { error } = await supabase
            .from('notice_acknowledgements')
            .insert({ notice_id: notice.id, user_id: currentUserId })
        if (!error) {
            setAcked(true)
            toast.success('Notice acknowledged')
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        const { error } = await supabase
            .from('notices')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', notice.id)

        if (!error) {
            // Broadcast deletion so other Pulse panels hide it instantly
            await supabase.channel('notices').send({
                type: 'broadcast',
                event: 'notice-deleted',
                payload: { id: notice.id },
            })
            onDelete(notice.id)
        } else {
            toast.error('Failed to delete notice')
            setDeleting(false)
        }
    }

    return (
        <div className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm space-y-2 transition-all">
            {/* Author + meta */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center uppercase">
                        {notice.author_initials ?? '?'}
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-600">{notice.author_name ?? 'System'}</p>
                        <p className="text-[9px] text-slate-400">{formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <span className="flex items-center gap-0.5 text-[9px] text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5 font-medium capitalize">
                        <AudienceIcon audience={notice.audience} />
                        {notice.audience}
                    </span>
                    {isAuthor && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-slate-300 hover:text-red-400 transition-colors p-0.5"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div>
                <p className="text-xs font-semibold text-brand-navy leading-snug">{notice.subject}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-3">{notice.message}</p>
            </div>

            {/* Acknowledge / author stats */}
            <div className="flex items-center justify-between pt-1">
                {isAuthor && notice.ack_count !== undefined ? (
                    <div className="flex-1 mr-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                            <span>{notice.ack_count}/{notice.total_count ?? '?'} acknowledged</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-400 rounded-full transition-all"
                                style={{ width: `${notice.total_count ? (notice.ack_count / notice.total_count) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div />
                )}
                {!isAuthor && (
                    <button
                        onClick={handleAcknowledge}
                        disabled={acked}
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all border',
                            acked
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                        )}
                    >
                        <Check className="h-2.5 w-2.5" />
                        {acked ? 'Acknowledged' : 'Acknowledge'}
                    </button>
                )}
            </div>
        </div>
    )
}
