'use client'

import { BellRing, CalendarDays, CheckCircle2, ChevronDown, PenTool, Send, Activity, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { usePulse } from "@/hooks/use-pulse"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { NoticeCard } from "@/components/notices/notice-card"
import { NoticeComposer } from "@/components/notices/notice-composer"

function PulseSection({ title, icon: Icon, defaultOpen = true, children, count = 0 }: any) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-muted/50 px-4 py-2 hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-brand-teal" />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {count > 0 && (
                        <span className="flex h-5 items-center justify-center rounded-full bg-destructive/10 px-2 text-[10px] font-bold text-destructive">
                            {count}
                        </span>
                    )}
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2 pb-1 space-y-2">
                {children}
            </CollapsibleContent>
        </Collapsible>
    )
}

export function ThePulse({ open, onToggle }: { open: boolean; onToggle: () => void }) {
    const { connected, priorityApprovals, isQaOrAdmin, notices, acknowledgedIds, currentUserId } = usePulse()
    const [composerOpen, setComposerOpen] = useState(false)

    // Keep local copy in sync when hook updates
    const displayNotices = notices
    const unreadCount = displayNotices.filter(n => !acknowledgedIds.has(n.id) && n.author_id !== currentUserId).length + priorityApprovals.length

    const handleDelete = (id: string) => {
        // The hook's Realtime subscription will auto-remove it
    }

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={onToggle}
                className={cn(
                    "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg",
                    "bg-brand-navy text-white transition-all duration-200 hover:scale-110 hover:shadow-xl",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2"
                )}
                aria-label={open ? 'Close The Pulse' : 'Open The Pulse'}
            >
                {/* Unread badge */}
                {!open && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                {open ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Activity className="h-5 w-5" />
                )}
            </button>

            {/* Panel */}
            <aside
                className={cn(
                    "fixed right-0 top-12 bottom-0 w-[300px] border-l border-border bg-card flex flex-col z-40",
                    "transition-transform duration-300 ease-in-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", connected ? "bg-brand-teal" : "bg-red-400")}></span>
                            <span className={cn("relative inline-flex h-2 w-2 rounded-full", connected ? "bg-brand-teal" : "bg-red-500")}></span>
                        </div>
                        <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">The Pulse</h2>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {/* Priority Approvals — QA/Admin only */}
                    {isQaOrAdmin && (
                        <PulseSection title="Priority Approvals" icon={PenTool} count={priorityApprovals.length}>
                            {priorityApprovals.length === 0 ? (
                                <p className="text-xs text-muted-foreground/70 py-2 text-center italic">No pending approvals.</p>
                            ) : (
                                priorityApprovals.map((a) => (
                                    <Link key={a.id} href={`/qa/approvals/${a.id}`} className="block">
                                        <div className="rounded-lg border border-destructive/20 bg-card p-3 shadow-sm cursor-pointer hover:border-destructive/40 transition-colors">
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-foreground leading-snug truncate">
                                                        {(a.sops as any)?.sop_number} — {(a.sops as any)?.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {a.type === 'new' ? 'New' : 'Update'} by {(a.profiles as any)?.full_name} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </PulseSection>
                    )}

                    <PulseSection title="Daily To-Do" icon={CheckCircle2} count={0}>
                        <p className="text-xs text-muted-foreground/70 py-2 text-center italic">No tasks due today.</p>
                    </PulseSection>

                    {/* Live Notices */}
                    <PulseSection title="Notices" icon={BellRing} count={unreadCount}>
                        {displayNotices.length === 0 ? (
                            <p className="text-xs text-muted-foreground/70 py-2 text-center italic">No notices.</p>
                        ) : (
                            displayNotices.map((n) => (
                                <NoticeCard
                                    key={n.id}
                                    notice={n}
                                    currentUserId={currentUserId}
                                    isAuthor={n.author_id === currentUserId}
                                    isAcknowledged={acknowledgedIds.has(n.id)}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </PulseSection>

                    <PulseSection title="Today's Schedule" icon={CalendarDays} defaultOpen={false}>
                        <p className="text-xs text-muted-foreground text-center py-4 italic">No events scheduled.</p>
                    </PulseSection>
                </ScrollArea>

                <div className="border-t border-border bg-card p-4">
                    <Button
                        className="w-full bg-brand-navy hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-2 h-10"
                        onClick={() => setComposerOpen(true)}
                    >
                        <Send className="h-4 w-4" />
                        Send Notice
                    </Button>
                </div>

                <NoticeComposer open={composerOpen} onOpenChange={setComposerOpen} />
            </aside>
        </>
    )
}
