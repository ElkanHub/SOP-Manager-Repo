'use client'

import { useSopTabStore } from '@/stores/useSopTabStore'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export function SopTabStrip() {
    const { openTabs, activeTabId, closeTab, setActive } = useSopTabStore()

    if (openTabs.length === 0) return null

    return (
        <div className="flex items-end gap-0 overflow-x-auto border-b border-border bg-muted/50 px-4 pt-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
            {openTabs.map((tab) => {
                const isActive = tab.id === activeTabId
                return (
                    <div
                        key={tab.id}
                        onClick={() => setActive(tab.id)}
                        className={cn(
                            'group flex min-w-0 max-w-[200px] shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border border-b-0 px-3 py-2 text-xs transition-all',
                            isActive
                                ? 'border-border bg-card font-semibold text-foreground shadow-sm border-b-[3px] border-b-brand-teal -mb-px'
                                : 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        )}
                    >
                        <span className="font-mono text-[10px] uppercase tracking-wider shrink-0 text-brand-teal">
                            {tab.sop_number}
                        </span>
                        <span className="truncate">{tab.title}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                closeTab(tab.id)
                            }}
                            className={cn(
                                'ml-auto shrink-0 rounded p-0.5 transition-opacity',
                                isActive
                                    ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    : 'text-transparent group-hover:text-muted-foreground'
                            )}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
