'use client'

import { BellRing, CalendarDays, CheckCircle2, ChevronDown, PenTool, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { cn } from "@/lib/utils"
// import { usePulse } from "@/hooks/use-pulse"

function PulseSection({ title, icon: Icon, defaultOpen = true, children, count = 0 }: any) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="mb-4"
        >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-slate-100/50 px-4 py-2 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-brand-teal" />
                    <span className="text-sm font-semibold text-brand-navy uppercase tracking-wider">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {count > 0 && (
                        <span className="flex h-5 items-center justify-center rounded-full bg-red-100 px-2 text-[10px] font-bold text-red-600">
                            {count}
                        </span>
                    )}
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2 pb-1 space-y-2">
                {children}
            </CollapsibleContent>
        </Collapsible>
    )
}

export function ThePulse() {
    // Static state for Phase 3 - Realtime hook will be imported later
    // const { connected } = usePulse()
    const connected = true

    return (
        <aside className="fixed right-0 top-12 bottom-0 w-[300px] border-l border-slate-200 bg-slate-50 flex flex-col hidden md:flex z-40 transform transition-transform duration-300">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", connected ? "bg-brand-teal" : "bg-red-400")}></span>
                        <span className={cn("relative inline-flex h-2 w-2 rounded-full", connected ? "bg-brand-teal" : "bg-red-500")}></span>
                    </div>
                    <h2 className="text-sm font-bold text-brand-navy tracking-tight uppercase">The Pulse</h2>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <PulseSection title="Priority Approvals" icon={PenTool} count={2}>
                    {/* Dummy content */}
                    <div className="rounded-lg border border-red-100 bg-white p-3 shadow-sm cursor-pointer hover:border-red-200 transition-colors">
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <div>
                                <p className="text-xs font-semibold text-brand-navy leading-snug">SOP-042 Revision</p>
                                <p className="text-[10px] text-slate-500 mt-1">Pending QA Approval • 2h ago</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-red-100 bg-white p-3 shadow-sm cursor-pointer hover:border-red-200 transition-colors">
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <div>
                                <p className="text-xs font-semibold text-brand-navy leading-snug">New Centrifuge Checklist</p>
                                <p className="text-[10px] text-slate-500 mt-1">Pending QA Approval • 5h ago</p>
                            </div>
                        </div>
                    </div>
                </PulseSection>

                <PulseSection title="Daily To-Do" icon={CheckCircle2} count={1}>
                    <div className="rounded-lg border border-amber-100 bg-white p-3 shadow-sm flex items-start gap-2 cursor-pointer hover:border-amber-200 transition-colors">
                        <input type="checkbox" className="mt-1 shrink-0 accent-brand-teal h-3 w-3 rounded-sm cursor-pointer" />
                        <div>
                            <p className="text-xs font-semibold text-brand-navy leading-snug">SOP-019 Acknowledgement</p>
                            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Due Today</p>
                        </div>
                    </div>
                </PulseSection>

                <PulseSection title="Notices" icon={BellRing}>
                    <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-3 shadow-sm cursor-pointer hover:border-brand-blue/30 transition-colors">
                        <p className="text-xs font-semibold text-brand-navy leading-snug">All Hands Meeting</p>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">The monthly safety review will take place in the main hall at 2PM today. Please remember to wear PPE when transiting.</p>
                    </div>
                </PulseSection>

                <PulseSection title="Today's Schedule" icon={CalendarDays} defaultOpen={false}>
                    <p className="text-xs text-slate-500 text-center py-4 italic">No events scheduled.</p>
                </PulseSection>

            </ScrollArea>

            <div className="border-t border-slate-200 bg-white p-4">
                <Button className="w-full bg-brand-navy hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-2 h-10">
                    <Send className="h-4 w-4" />
                    Send Notice
                </Button>
            </div>
        </aside>
    )
}
