import { formatDistanceToNow, isPast, parseISO } from 'date-fns'
import { CalendarClock, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface UpcomingPm {
    id: string
    due_date: string
    status: string
    equipment: {
        id: string
        name: string
        asset_id: string
    } | null
}

export function UpcomingPmList({ tasks }: { tasks: UpcomingPm[] }) {
    if (tasks.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground/70 mt-1">No pending maintenance tasks.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm h-[400px] flex flex-col overflow-hidden">
            <div className="border-b border-border px-5 py-4 shrink-0 bg-muted/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-brand-teal" />
                    Upcoming PMs
                </h3>
                <Link href="/equipment" className="text-[10px] font-semibold text-brand-teal hover:underline">
                    View Registry
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {tasks.map((task) => {
                    const d = parseISO(task.due_date)
                    const isOverdue = isPast(d)
                    const diffDays = Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                    const urgency = isOverdue ? 'red' : diffDays <= 7 ? 'amber' : 'green'

                    return (
                        <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                            <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                                urgency === 'red' ? 'bg-red-50 border-red-200 text-red-600' :
                                    urgency === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                        'bg-green-50 border-green-200 text-green-600'
                            )}>
                                {isOverdue ? <AlertCircle className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">
                                    {task.equipment?.name ?? 'Unknown Asset'}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {task.equipment?.asset_id}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-wide",
                                    urgency === 'red' ? 'text-red-500' :
                                        urgency === 'amber' ? 'text-amber-500' :
                                            'text-green-500'
                                )}>
                                    {isOverdue ? 'Overdue' : `In ${diffDays} day${diffDays === 1 ? '' : 's'}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(d, { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
