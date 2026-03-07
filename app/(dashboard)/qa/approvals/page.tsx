import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card } from '@/components/ui/card'
import { format, formatDistanceToNow } from 'date-fns'
import { ClipboardList, ArrowRight } from 'lucide-react'

interface ApprovalRequest {
    id: string
    type: 'new' | 'update'
    status: string
    notes_to_qa: string | null
    created_at: string
    sops: { sop_number: string; title: string; departments: { name: string } | null } | null
    profiles: { full_name: string; avatar_url: string | null } | null
}

export default async function QaApprovalsPage() {
    const supabase = await createClient()

    // Gate: QA/Admin only
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, dept_id, departments(is_qa)')
        .eq('id', user.id)
        .single()

    const isQaOrAdmin = profile?.role === 'admin' || (profile?.departments as any)?.is_qa === true
    if (!isQaOrAdmin) redirect('/dashboard')

    const { data: requests } = await supabase
        .from('sop_approval_requests')
        .select(`
            id, type, status, notes_to_qa, created_at,
            sops(sop_number, title, departments(name)),
            profiles!submitted_by(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

    const pending = (requests ?? []) as unknown as ApprovalRequest[]

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">QA Approvals</h1>
                    <p className="text-xs text-muted-foreground">SOP submissions awaiting review</p>
                </div>
                <span className="ml-auto rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                    {pending.filter((r) => r.status === 'pending').length} pending
                </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {pending.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ClipboardList className="h-10 w-10" />
                        <p className="text-sm">No approval requests yet.</p>
                    </div>
                ) : (
                    pending.map((req) => (
                        <Link key={req.id} href={`/qa/approvals/${req.id}`}>
                            <Card className="flex items-center gap-4 p-4 hover:border-brand-teal/50 hover:shadow-md transition-all cursor-pointer group">
                                {/* Submitter Avatar */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white text-sm font-bold">
                                    {req.profiles?.full_name?.[0] ?? '?'}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-mono text-xs font-bold text-foreground">
                                            {req.sops?.sop_number}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${req.type === 'new' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                            {req.type}
                                        </span>
                                        <StatusBadge status={req.status} size="sm" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground truncate">{req.sops?.title}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {req.profiles?.full_name} · {req.sops?.departments?.name} · {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                                    </p>
                                </div>

                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-teal transition-colors shrink-0" />
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
