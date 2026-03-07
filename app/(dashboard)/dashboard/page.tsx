import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { UpcomingPmList } from '@/components/dashboard/upcoming-pm-list'
import { FileText, AlertCircle, CalendarCheck, FileWarning } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Role check for scoping
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, dept_id, departments(is_qa, name)')
        .eq('id', user.id)
        .single()

    const isQA = profile?.role === 'admin' || (profile?.departments as any)?.is_qa === true
    const deptId: string | null = isQA ? null : profile?.dept_id ?? null // Ensure strict null, not undefined
    const scopeLabel = isQA ? 'Global Overview' : `${(profile?.departments as any)?.name} Department`

    // Concurrent fetching for KPIs
    const [
        { count: activeSops },
        { count: pendingApprovals },
        { data: complianceResult },
        { count: dueSops },
        { data: rawFeed },
        { data: rawPms }
    ] = await Promise.all([
        supabase.from('sops').select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .match(deptId ? { dept_id: deptId } : {}),

        supabase.from('sop_approval_requests').select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
            // Only QA usually cares about pending, but scoping just in case
            .match(deptId ? { requested_by: user.id } : {}), // simple scope for worker

        supabase.rpc('get_pm_compliance' as any, deptId ? { p_dept_id: deptId } : {}),

        supabase.from('sops').select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lte('due_for_revision', new Date().toISOString())
            .match(deptId ? { dept_id: deptId } : {}),

        // Fetch feed
        supabase.from('audit_log')
            .select('id, action, entity_type, created_at, actor_id, profiles!actor_id(full_name)')
            .match(deptId ? { dept_id: deptId } : {})
            .order('created_at', { ascending: false })
            .limit(10),

        // Fetch upcoming PMs
        supabase.from('pm_tasks')
            .select('id, due_date, status, equipment!inner(id, name, asset_id)')
            .eq('status', 'pending')
            .match(deptId ? { assigned_dept: deptId } : {})
            .order('due_date', { ascending: true })
            .limit(5)
    ])

    const compliance = typeof complianceResult === 'number' ? complianceResult : 100

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-500 w-full min-w-0">
            {/* Page Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <FileText className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
                    <p className="text-xs text-muted-foreground">{scopeLabel}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* KPI Row */}
                <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Active SOPs"
                        value={activeSops || 0}
                        icon={FileText}
                        colorScheme="blue"
                        href="/sop-library"
                    />
                    <KpiCard
                        title="Needs Revision"
                        value={dueSops || 0}
                        icon={FileWarning}
                        colorScheme={dueSops && dueSops > 0 ? "amber" : "slate"}
                        href="/sop-library?filter=due"
                    />
                    <KpiCard
                        title="Pending Approvals"
                        value={pendingApprovals || 0}
                        icon={AlertCircle}
                        colorScheme={pendingApprovals && pendingApprovals > 0 ? "red" : "slate"}
                        href="/qa/approvals"
                    />
                    <KpiCard
                        title="PM Compliance"
                        value={compliance}
                        suffix="%"
                        icon={CalendarCheck}
                        colorScheme={compliance >= 95 ? "green" : compliance >= 80 ? "amber" : "red"}
                        href="/equipment"
                    />
                </div>

                {/* Bottom row: Feed + PMs */}
                <div className="grid gap-6 xl:grid-cols-7">
                    <div className="md:col-span-4">
                        <ActivityFeed initialData={rawFeed as any} deptId={deptId} />
                    </div>
                    <div className="md:col-span-3">
                        <UpcomingPmList tasks={rawPms as any} />
                    </div>
                </div>
            </div>
        </div>
    )
}
