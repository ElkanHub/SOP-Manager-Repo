'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeltaSummaryCardProps {
    changeControlId: string
    initialSummary: string | null
}

export function DeltaSummaryCard({ changeControlId, initialSummary }: DeltaSummaryCardProps) {
    const [summary, setSummary] = useState(initialSummary)
    const [loading, setLoading] = useState(false)

    const generateSummary = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/gemini/delta-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ changeControlId }),
            })
            const data = await res.json() as { summary?: string; error?: string }
            if (!res.ok) throw new Error(data.error ?? 'Failed to generate summary')
            setSummary(data.summary ?? '')
            toast.success('AI Summary generated')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            toast.error('Failed to generate summary', { description: message })
        } finally {
            setLoading(false)
        }
    }

    // Parse bullet points from Gemini output
    const bullets = summary
        ? summary.split('\n').filter((l) => l.trim().startsWith('•') || l.trim().startsWith('-')).map((l) => l.replace(/^[•\-]\s*/, '').trim())
        : []

    return (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand-navy/5 via-transparent to-brand-teal/5 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-teal" />
                    <h3 className="font-semibold text-brand-navy text-sm">AI Summary of Changes</h3>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-brand-teal/40 text-brand-teal hover:bg-teal-50"
                    onClick={generateSummary}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1.5 h-3 w-3" />}
                    {summary ? 'Regenerate' : 'Generate'}
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysing document changes...
                </div>
            ) : bullets.length > 0 ? (
                <ul className="space-y-2">
                    {bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                            {bullet}
                        </li>
                    ))}
                </ul>
            ) : summary ? (
                <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
            ) : (
                <p className="text-sm text-slate-400 italic py-2">
                    No AI summary yet. Click &quot;Generate&quot; to analyse the changes.
                </p>
            )}

            <p className="mt-4 text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                ⚠ This summary is AI-generated. Review the full diff before signing.
            </p>
        </div>
    )
}
