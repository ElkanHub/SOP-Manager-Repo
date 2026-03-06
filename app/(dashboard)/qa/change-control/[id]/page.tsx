import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ChangeControlHeader } from '@/components/change-control/change-control-header'
import { DiffViewer } from '@/components/change-control/diff-viewer'
import { DeltaSummaryCard } from '@/components/change-control/delta-summary-card'
import { SignatureGrid } from '@/components/change-control/signature-grid'

interface Params {
    params: Promise<{ id: string }>
}

export default async function ChangeControlPage({ params }: Params) {
    const { id } = await params
    const supabase = await createClient()

    // Auth guard
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, departments(is_qa)')
        .eq('id', user.id)
        .single()

    const isQaOrAdmin =
        profile?.role === 'admin' || (profile?.departments as { is_qa: boolean } | null)?.is_qa === true

    if (!isQaOrAdmin) redirect('/dashboard')

    // Fetch change control with joined data
    const { data: cc, error } = await supabase
        .from('change_controls')
        .select(`
            id, status, old_version, new_version, old_file_url, new_file_url,
            diff_json, delta_summary, created_at, completed_at,
            sops(id, sop_number, title, dept_id),
            profiles!issued_by(full_name)
        `)
        .eq('id', id)
        .single()

    if (error || !cc) notFound()

    const sop = cc.sops as { id: string; sop_number: string; title: string; dept_id: string } | null

    // Count signatures collected
    const { count: sigCount } = await supabase
        .from('signature_certificates')
        .select('*', { count: 'exact', head: true })
        .eq('change_control_id', id)

    // Count required signatories
    const { count: reqCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('dept_id', sop?.dept_id ?? '')
        .in('role', ['manager', 'admin'])

    const stats = { collected: sigCount ?? 0, required: reqCount ?? 0 }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <ChangeControlHeader
                cc={{
                    ...cc,
                    created_at: cc.created_at ?? '',
                    sops: sop,
                    profiles: cc.profiles as { full_name: string } | null,
                }}
                stats={stats}
            />

            {/* Body */}
            <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
                {/* AI Summary */}
                <DeltaSummaryCard
                    changeControlId={id}
                    initialSummary={cc.delta_summary ?? null}
                />

                {/* Diff Viewer */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Document Diff</h2>
                    <DiffViewer
                        diffJson={cc.diff_json as { type: 'unchanged' | 'removed' | 'added'; text: string }[] | null}
                        oldVersion={cc.old_version}
                        newVersion={cc.new_version}
                    />
                </div>

                {/* Signature Grid */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Signatures</h2>
                    {sop && (
                        <SignatureGrid
                            changeControlId={id}
                            sopTitle={`${sop.sop_number} — ${sop.title}`}
                            sopVersion={cc.new_version}
                            deptId={sop.dept_id}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
