'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Columns2, GitCompare } from 'lucide-react'

interface DiffEntry {
    type: 'unchanged' | 'removed' | 'added'
    text: string
}

interface DiffViewerProps {
    diffJson: DiffEntry[] | null
    oldVersion: string
    newVersion: string
}

export function DiffViewer({ diffJson, oldVersion, newVersion }: DiffViewerProps) {
    const [showChangesOnly, setShowChangesOnly] = useState(false)

    if (!diffJson) {
        return (
            <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-400 italic">No diff data available for this Change Control.</p>
            </div>
        )
    }

    const oldLines = diffJson.filter((e) => showChangesOnly
        ? e.type !== 'added'
        : e.type !== 'added'
    )
    const newLines = diffJson.filter((e) => showChangesOnly
        ? e.type !== 'removed'
        : e.type !== 'removed'
    )

    // For "changes only" mode, filter out unchanged lines on both sides
    const filteredOld = showChangesOnly ? diffJson.filter((e) => e.type !== 'added') : diffJson.filter((e) => e.type !== 'added')
    const filteredNew = showChangesOnly ? diffJson.filter((e) => e.type !== 'removed') : diffJson.filter((e) => e.type !== 'removed')

    // Build side-by-side representation
    const changesOnly = showChangesOnly
    const leftEntries = diffJson.filter((e) => e.type === 'unchanged' || e.type === 'removed')
    const rightEntries = diffJson.filter((e) => e.type === 'unchanged' || e.type === 'added')

    const visibleLeft = changesOnly ? leftEntries.filter((e) => e.type === 'removed') : leftEntries
    const visibleRight = changesOnly ? rightEntries.filter((e) => e.type === 'added') : rightEntries

    return (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
                <div className="flex items-center gap-2">
                    <GitCompare className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Document Diff</span>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                    <Button
                        size="sm"
                        variant="ghost"
                        className={cn('h-7 text-xs px-3', !showChangesOnly && 'bg-brand-navy text-white hover:bg-brand-navy')}
                        onClick={() => setShowChangesOnly(false)}
                    >
                        <Columns2 className="mr-1.5 h-3 w-3" /> Show All
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className={cn('h-7 text-xs px-3', showChangesOnly && 'bg-brand-navy text-white hover:bg-brand-navy')}
                        onClick={() => setShowChangesOnly(true)}
                    >
                        Changes Only
                    </Button>
                </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="border-r border-slate-200 bg-red-50/60 px-4 py-2">
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Old — {oldVersion}</span>
                </div>
                <div className="bg-green-50/60 px-4 py-2">
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">New — {newVersion}</span>
                </div>
            </div>

            {/* Diff content */}
            <div className="grid grid-cols-2 max-h-[500px] overflow-y-auto">
                {/* Left: old (unchanged + removed) */}
                <div className="border-r border-slate-200 bg-red-50/20">
                    {visibleLeft.map((entry, i) => (
                        <div
                            key={i}
                            className={cn(
                                'border-l-2 px-4 py-1.5 text-sm leading-relaxed font-mono',
                                entry.type === 'removed'
                                    ? 'border-l-red-400 bg-red-50 text-red-800 line-through'
                                    : 'border-l-transparent text-slate-700'
                            )}
                        >
                            {entry.text || '\u00A0'}
                        </div>
                    ))}
                </div>

                {/* Right: new (unchanged + added) */}
                <div className="bg-green-50/20">
                    {visibleRight.map((entry, i) => (
                        <div
                            key={i}
                            className={cn(
                                'border-l-2 px-4 py-1.5 text-sm leading-relaxed font-mono',
                                entry.type === 'added'
                                    ? 'border-l-green-400 bg-green-50 text-green-800'
                                    : 'border-l-transparent text-slate-700'
                            )}
                        >
                            {entry.text || '\u00A0'}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
