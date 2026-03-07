'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SopViewer } from '@/components/sops/sop-viewer'
import { ApprovalThread } from '@/components/sops/approval-thread'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/ui/status-badge'
import { toast } from 'sonner'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
    CheckCircle2, AlertCircle, Loader2, ChevronLeft, Send,
    User, Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ApprovalRequest {
    id: string
    sop_id: string
    type: 'new' | 'update'
    status: string
    submitted_by: string
    notes_to_qa: string | null
    created_at: string
    profiles: { full_name: string } | null
    sops: { sop_number: string; title: string; file_url: string | null } | null
}

interface Props {
    params: Promise<{ id: string }>
}

export default function ApprovalDetailPage({ params }: Props) {
    const { id } = use(params)
    const supabase = createClient()
    const router = useRouter()

    const [request, setRequest] = useState<ApprovalRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [showChangesForm, setShowChangesForm] = useState(false)
    const [changeComment, setChangeComment] = useState('')
    const [sendingComment, setSendingComment] = useState(false)
    const [viewerSopId, setViewerSopId] = useState<string | null>(null)

    const fetchRequest = useCallback(async () => {
        const { data } = await supabase
            .from('sop_approval_requests')
            .select('*, profiles!submitted_by(full_name), sops(sop_number, title, file_url)')
            .eq('id', id)
            .single()
        setRequest(data as ApprovalRequest)
        setViewerSopId(data?.sop_id ?? null)
        setLoading(false)
    }, [id])

    useEffect(() => { fetchRequest() }, [fetchRequest])

    const handleApprove = async () => {
        if (!request) return
        setApproving(true)
        try {
            const { data, error } = await (supabase.rpc as any)('approve_sop_request', {
                p_request_id: id,
                p_qa_user_id: (await supabase.auth.getUser()).data.user!.id,
            })
            if (error) throw error
            const outcome = (data as any)?.outcome
            toast.success('SOP Approved!', {
                description: outcome === 'activated'
                    ? 'The SOP is now Active and visible in the library.'
                    : 'A Change Control has been issued for manager sign-off.',
            })
            fetchRequest()
        } catch (err: any) {
            toast.error('Approval failed', { description: err.message })
        } finally {
            setApproving(false)
        }
    }

    const handleRequestChanges = async () => {
        if (!request) return
        if (!changeComment.trim()) { toast.error('Please add a comment explaining the required changes.'); return }
        setSendingComment(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Insert comment
            const { error: commentErr } = await supabase
                .from('sop_approval_comments')
                .insert({
                    request_id: id,
                    author_id: user.id,
                    comment: changeComment,
                    action: 'changes_requested',
                })
            if (commentErr) throw commentErr

            // Update request status
            await supabase
                .from('sop_approval_requests')
                .update({ status: 'needs_revision', updated_at: new Date().toISOString() })
                .eq('id', id)

            // Insert direct notice to the author
            if (request.sops) {
                const noticeData = {
                    subject: `Revisions Required: ${request.sops.sop_number}`,
                    message: `Your SOP submission requires revisions. Please check the Pulse panel for details.`,
                    audience: 'individuals',
                    author_id: user.id,
                }
                const { data: newNotice } = await supabase.from('notices').insert(noticeData).select().single()

                if (newNotice) {
                    await supabase.from('notice_recipients').insert({ notice_id: newNotice.id, user_id: request.submitted_by })
                    // Broadcast to trigger Pulse globally
                    supabase.channel('notices').send({ type: 'broadcast', event: 'new-notice', payload: newNotice })
                }
            }

            toast.success('Changes requested', { description: 'The submitter has been notified.' })
            setChangeComment('')
            setShowChangesForm(false)
            fetchRequest()
        } catch (err: any) {
            toast.error('Failed', { description: err.message })
        } finally {
            setSendingComment(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading request...
            </div>
        )
    }

    if (!request) return null
    const isPending = request.status === 'pending' || request.status === 'needs_revision'

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 border-b border-border bg-card px-6 py-3 shrink-0">
                <button onClick={() => router.push('/qa/approvals')}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4" />QA Approvals
                </button>
                <span className="text-muted-foreground/50">/</span>
                <span className="text-sm font-semibold text-foreground">{request.sops?.sop_number}</span>
                <StatusBadge status={request.status} size="sm" className="ml-2" />
            </div>

            {/* Body: 65% viewer + 35% panel */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Document Viewer */}
                <div className="flex-1 overflow-hidden border-r border-border">
                    {viewerSopId && <SopViewer sopId={viewerSopId} />}
                </div>

                {/* Right: Approval Panel */}
                <div className="w-[340px] shrink-0 flex flex-col overflow-hidden bg-card border-l border-border">
                    {/* Request info */}
                    <div className="border-b border-border p-4 space-y-3">
                        <h3 className="font-semibold text-foreground text-sm">Submission Details</h3>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-foreground font-medium">{request.profiles?.full_name ?? 'Unknown'}</span>
                                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${request.type === 'new' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                    {request.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                            </div>
                            {request.notes_to_qa && (
                                <div className="rounded-lg bg-muted/50 border border-border p-3 text-foreground italic leading-relaxed text-xs">
                                    "{request.notes_to_qa}"
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        {isPending && (
                            <div className="space-y-2 pt-2">
                                <Button
                                    size="sm"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleApprove}
                                    disabled={approving}
                                >
                                    {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/50 dark:text-amber-400 dark:hover:bg-amber-950/50"
                                    onClick={() => setShowChangesForm(!showChangesForm)}
                                    disabled={approving}
                                >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Request Changes
                                </Button>

                                {showChangesForm && (
                                    <div className="space-y-2 pt-1">
                                        <Textarea
                                            value={changeComment}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChangeComment(e.target.value)}
                                            placeholder="Describe the changes required..."
                                            rows={3}
                                            className="resize-none text-sm"
                                        />
                                        <Button
                                            size="sm"
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                            onClick={handleRequestChanges}
                                            disabled={sendingComment}
                                        >
                                            {sendingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                            Send Feedback
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Approval Thread */}
                    <div className="flex-1 overflow-y-auto p-4 bg-background/50">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activity Thread</h4>
                        <ApprovalThread requestId={id} onUpdate={fetchRequest} />
                    </div>
                </div>
            </div>
        </div>
    )
}
