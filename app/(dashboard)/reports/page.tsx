'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReportFilters } from '@/components/reports/report-filters'
import { AiRiskCard } from '@/components/reports/ai-risk-card'
import { exportToCsv } from '@/lib/utils/export'
import { FileText, AlertCircle, CalendarClock, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type ReportType = 'sops' | 'acks' | 'pms' | 'notices' | 'ai'

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportType>('sops')
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>()
    const [deptId, setDeptId] = useState<string>('all')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any[]>([])

    const supabase = createClient()

    const fetchReport = useCallback(async () => {
        setLoading(true)
        setData([])

        try {
            if (activeTab === 'sops') {
                // Fetch SOP changes (simplified from audit_log for now to guarantee history)
                let query = supabase.from('audit_log')
                    .select('id, action, entity_type, created_at, profiles!actor_id(full_name), metadata')
                    .eq('entity_type', 'SOP')
                    .order('created_at', { ascending: false })
                    .limit(500)

                if (deptId !== 'all') query = query.eq('dept_id', deptId)
                if (dateRange?.from) query = query.gte('created_at', dateRange.from.toISOString())
                if (dateRange?.to) {
                    const toEnd = new Date(dateRange.to)
                    toEnd.setHours(23, 59, 59, 999)
                    query = query.lte('created_at', toEnd.toISOString())
                }

                const { data: qData } = await query
                setData(qData?.map(row => ({
                    Date: row.created_at ? format(new Date(row.created_at as string), 'yyyy-MM-dd HH:mm') : '',
                    Actor: (row.profiles as any)?.full_name || 'System',
                    Action: row.action,
                    Details: (row.metadata as any)?.title || (row.metadata as any)?.sop_number || 'SOP Update'
                })) || [])

            } else if (activeTab === 'acks') {
                // Fetch Worker Acknowledgements
                let query = supabase.from('sop_acknowledgements')
                    .select('id, acknowledged_at, sops!inner(sop_number, title, dept_id), profiles!inner(full_name)')
                    .order('acknowledged_at', { ascending: false })
                    .limit(500)

                if (deptId !== 'all') query = query.eq('sops.dept_id', deptId)
                if (dateRange?.from) query = query.gte('acknowledged_at', dateRange.from.toISOString())
                if (dateRange?.to) {
                    const toEnd = new Date(dateRange.to)
                    toEnd.setHours(23, 59, 59, 999)
                    query = query.lte('acknowledged_at', toEnd.toISOString())
                }

                const { data: qData } = await query
                setData(qData?.map((row: any) => ({
                    Date: row.acknowledged_at ? format(new Date(row.acknowledged_at as string), 'yyyy-MM-dd HH:mm') : '',
                    Worker: row.profiles?.full_name,
                    'SOP No.': row.sops?.sop_number,
                    'SOP Title': row.sops?.title
                })) || [])

            } else if (activeTab === 'pms') {
                // PM Log
                let query = supabase.from('pm_tasks')
                    .select('id, due_date, status, completion_notes, equipment!inner(name, asset_id)')
                    .order('due_date', { ascending: false })
                    .limit(500)

                if (deptId !== 'all') query = query.eq('assigned_dept', deptId)
                if (dateRange?.from) query = query.gte('due_date', dateRange.from.toISOString())
                if (dateRange?.to) {
                    const toEnd = new Date(dateRange.to)
                    toEnd.setHours(23, 59, 59, 999)
                    query = query.lte('due_date', toEnd.toISOString())
                }

                const { data: qData } = await query
                setData(qData?.map((row: any) => ({
                    'Due Date': row.due_date,
                    Asset: `${row.equipment?.name} (${row.equipment?.asset_id})`,
                    Status: row.status.toUpperCase(),
                    Notes: row.completion_notes || ''
                })) || [])

            } else if (activeTab === 'notices') {
                // Sent Notices Log
                let query = supabase.from('notices')
                    .select('id, subject, audience, created_at, profiles!inner(full_name), notice_acknowledgements(count)')
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })
                    .limit(500)

                if (deptId !== 'all') query = query.eq('dept_id', deptId) // Shows notices created BY this dept
                if (dateRange?.from) query = query.gte('created_at', dateRange.from.toISOString())
                if (dateRange?.to) {
                    const toEnd = new Date(dateRange.to)
                    toEnd.setHours(23, 59, 59, 999)
                    query = query.lte('created_at', toEnd.toISOString())
                }

                const { data: qData } = await query
                setData(qData?.map((row: any) => ({
                    Date: row.created_at ? format(new Date(row.created_at as string), 'yyyy-MM-dd HH:mm') : '',
                    Author: row.profiles?.full_name,
                    Subject: row.subject,
                    Audience: row.audience,
                    'Acks': row.notice_acknowledgements[0]?.count || 0
                })) || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [activeTab, dateRange, deptId, supabase])

    useEffect(() => {
        if (activeTab !== 'ai') fetchReport()
    }, [fetchReport, activeTab])

    const tabs: { id: ReportType, label: string, icon: any }[] = [
        { id: 'sops', label: 'SOP History', icon: FileText },
        { id: 'acks', label: 'Ack Log', icon: AlertCircle },
        { id: 'pms', label: 'PM Log', icon: CalendarClock },
        { id: 'notices', label: 'Notices', icon: Bell },
        { id: 'ai', label: 'AI Risk Insights', icon: AlertCircle },
    ]

    const handleExport = () => {
        if (data.length === 0) return
        exportToCsv(data, `${activeTab}_report`)
    }

    const TableHeaders = data.length > 0 ? Object.keys(data[0]) : []

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <FileText className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-xs text-muted-foreground">Query, export, and analyze operational data</p>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="border-b border-border bg-card px-6 shrink-0 flex gap-4 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isAi = tab.id === 'ai'
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                                activeTab === tab.id
                                    ? isAi ? "border-purple-500 text-purple-700 dark:text-purple-400" : "border-brand-teal text-brand-teal"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                            {isAi && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded ml-1 font-bold tracking-wider">BETA</span>}
                        </button>
                    )
                })}
            </div>

            {/* Filters Area */}
            <div className="p-6 shrink-0">
                <ReportFilters
                    onDateChange={setDateRange}
                    onDeptChange={setDeptId}
                    onExport={handleExport}
                    isExportable={activeTab !== 'ai' && data.length > 0}
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 px-6 pb-6 p-0 relative">
                <div className="absolute inset-x-6 inset-y-0 pb-6">
                    {activeTab === 'ai' ? (
                        <div className="h-full">
                            <AiRiskCard deptId={deptId} />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col">
                            {loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="h-6 w-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-sm font-medium text-muted-foreground">Compiling report...</p>
                                </div>
                            ) : data.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">No Data Found</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mt-1">Try adjusting the department or date filters above to widen your search.</p>
                                </div>
                            ) : (
                                <div className="flex-1 min-h-0 overflow-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead className="bg-muted/50 sticky top-0 z-10 shadow-[0_1px_0_hsl(var(--border))]">
                                            <tr>
                                                {TableHeaders.map(th => (
                                                    <th key={th} className="px-5 py-3 font-semibold text-muted-foreground whitespace-nowrap">{th}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {data.map((row, i) => (
                                                <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                    {TableHeaders.map(th => (
                                                        <td key={th + i} className="px-5 py-3 text-foreground">{row[th]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="border-t border-border bg-muted/50 px-5 py-3 text-xs font-semibold text-muted-foreground shrink-0">
                                {data.length} row{data.length !== 1 ? 's' : ''} returned
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
