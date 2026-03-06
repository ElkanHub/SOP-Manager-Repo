'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AiRiskCardProps {
    deptId: string // 'all' or uuid
}

interface Insights {
    riskLevel: 'Low' | 'Medium' | 'High'
    insights: string[]
}

export function AiRiskCard({ deptId }: AiRiskCardProps) {
    const [loading, setLoading] = useState(false)
    const [insights, setInsights] = useState<Insights | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const generateInsights = async () => {
        setLoading(true)
        setError(null)
        setInsights(null)

        try {
            // First, gather the real metrics to send to the AI
            let deptName = 'the entire company'
            if (deptId !== 'all') {
                const { data } = await supabase.from('departments').select('name').eq('id', deptId).single()
                if (data) deptName = `the ${data.name} department`
            }

            const isSpecificDept = deptId !== 'all'
            const dbQuery = isSpecificDept ? { dept_id: deptId } : {}
            const pmQuery = isSpecificDept ? { assigned_dept: deptId } : {}

            const [
                { count: activeSops },
                { count: overdueSops },
                { count: missedPms },
                { count: activeNotices }
            ] = await Promise.all([
                supabase.from('sops').select('*', { count: 'exact', head: true }).eq('status', 'active').match(dbQuery),
                supabase.from('sops').select('*', { count: 'exact', head: true }).eq('status', 'active').lte('due_for_revision', new Date().toISOString()).match(dbQuery),
                supabase.from('pm_tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending').lte('due_date', new Date().toISOString()).match(pmQuery),
                supabase.from('notices').select('*', { count: 'exact', head: true }).is('deleted_at', null).match(dbQuery)
            ])

            // Second, call our API route
            const res = await fetch('/api/gemini/risk-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deptName,
                    activeSops: activeSops || 0,
                    overdueSops: overdueSops || 0,
                    missedPms: missedPms || 0,
                    activeNotices: activeNotices || 0,
                })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Failed to fetch insights')

            setInsights(json)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Auto-run on mount or when deptId changes
    useEffect(() => {
        generateInsights()
    }, [deptId]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col h-full shadow-sm max-w-3xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-start justify-between shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-200" />
                        AI Risk Analyst
                    </h2>
                    <p className="text-purple-100 text-sm mt-1">
                        Powered by Gemini • Analyzing operational health
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                    onClick={generateInsights}
                    disabled={loading}
                >
                    {loading ? 'Analyzing...' : 'Refresh Analysis'}
                </Button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-center min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center animate-pulse">
                        <div className="h-12 w-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Crunching your database metrics...</p>
                    </div>
                ) : error ? (
                    <div className="text-center">
                        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">{error}</p>
                    </div>
                ) : insights ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">

                        {/* Risk Badge */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Calculated Risk Level</span>
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold",
                                insights.riskLevel === 'Low' && "bg-green-100 text-green-700",
                                insights.riskLevel === 'Medium' && "bg-amber-100 text-amber-700",
                                insights.riskLevel === 'High' && "bg-red-100 text-red-700",
                            )}>
                                {insights.riskLevel === 'Low' && <CheckCircle className="h-4 w-4" />}
                                {insights.riskLevel === 'Medium' && <Info className="h-4 w-4" />}
                                {insights.riskLevel === 'High' && <AlertTriangle className="h-4 w-4" />}
                                {insights.riskLevel}
                            </div>
                        </div>

                        {/* Bullets */}
                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">Key Takeaways & Recommendations</h3>
                            <ul className="space-y-3">
                                {insights.insights.map((pt, i) => (
                                    <li key={i} className="flex gap-3 text-slate-700 leading-snug">
                                        <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-400">
                                            {i + 1}
                                        </span>
                                        <span className="pt-0.5">{pt}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                ) : null}
            </div>
        </div>
    )
}
