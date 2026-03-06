'use client'

import { StatusBadge } from '@/components/ui/status-badge'
import { format } from 'date-fns'
import { FileCheck2, CheckCircle2, Clock } from 'lucide-react'

interface ChangeControl {
    id: string
    status: string
    old_version: string
    new_version: string
    created_at: string
    completed_at?: string | null
    sops?: { sop_number: string; title: string } | null
    profiles?: { full_name: string } | null
}

interface SignatureStats {
    collected: number
    required: number
}

interface ChangeControlHeaderProps {
    cc: ChangeControl
    stats: SignatureStats
}

export function ChangeControlHeader({ cc, stats }: ChangeControlHeaderProps) {
    const ccRef = cc.id.slice(0, 8).toUpperCase()
    const isComplete = cc.status === 'complete'

    return (
        <div className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-white shrink-0">
                            <FileCheck2 className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">CC-{ccRef}</span>
                                <StatusBadge
                                    status={isComplete ? 'active' : 'pending_qa'}
                                    size="sm"
                                />
                            </div>
                            <h1 className="text-lg font-bold text-brand-navy mt-0.5">
                                {cc.sops?.sop_number} — {cc.sops?.title}
                            </h1>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 ml-10">
                        Issued {format(new Date(cc.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                        {cc.profiles && <> by {cc.profiles.full_name}</>}
                        {' · '}Version {cc.old_version} → {cc.new_version}
                    </p>
                </div>

                {/* Signature counter */}
                <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${isComplete ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                    {isComplete
                        ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        : <Clock className="h-5 w-5 text-red-500 shrink-0" />
                    }
                    <div>
                        <p className={`text-lg font-bold leading-none ${isComplete ? 'text-green-700' : 'text-red-600'}`}>
                            {stats.collected}/{stats.required}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 mt-0.5">
                            {isComplete ? 'Complete' : 'Signatures Pending'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
