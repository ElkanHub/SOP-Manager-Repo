'use client'

import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
    parseISO, differenceInCalendarDays,
} from 'date-fns'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewEventModal } from './new-event-modal'

interface CalendarEvent {
    id: string
    title: string
    start_date: string
    event_type: 'manual' | 'pm_auto'
    visibility: 'public' | 'dept'
}

interface CompanyCalendarProps {
    events: CalendarEvent[]
    onRefresh: () => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function chipColor(ev: CalendarEvent) {
    if (ev.event_type === 'pm_auto') return 'bg-teal-100 text-teal-800'
    if (ev.visibility === 'public') return 'bg-blue-100 text-blue-800'
    return 'bg-purple-100 text-purple-800'
}

export function CompanyCalendar({ events, onRefresh }: CompanyCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [newEventOpen, setNewEventOpen] = useState(false)
    const [newEventDate, setNewEventDate] = useState<string | undefined>()

    // Build grid days
    const monthStart = startOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart)
    const gridEnd = endOfWeek(endOfMonth(currentMonth))

    const days: Date[] = []
    let day = gridStart
    while (day <= gridEnd) {
        days.push(day)
        day = addDays(day, 1)
    }

    // Group events by date string
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        for (const ev of events) {
            const key = ev.start_date.slice(0, 10)
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(ev)
        }
        return map
    }, [events])

    // Upcoming events: next 7 days
    const today = new Date()
    const upcoming = events
        .filter((ev) => {
            const d = differenceInCalendarDays(parseISO(ev.start_date), today)
            return d >= 0 && d <= 7
        })
        .sort((a, b) => a.start_date.localeCompare(b.start_date))
        .slice(0, 10)

    return (
        <div className="flex gap-4 h-full">
            {/* Main Calendar */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-bold text-brand-navy w-44 text-center">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs ml-1" onClick={() => setCurrentMonth(new Date())}>
                            Today
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        className="bg-brand-teal hover:bg-teal-700 text-white h-8"
                        onClick={() => { setNewEventDate(undefined); setNewEventOpen(true) }}
                    >
                        <CalendarPlus className="mr-2 h-3.5 w-3.5" />
                        New Event
                    </Button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                    {WEEKDAYS.map((wd) => (
                        <div key={wd} className="py-1 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {wd}
                        </div>
                    ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 flex-1 border-l border-t border-slate-200 rounded-xl overflow-hidden">
                    {days.map((d, i) => {
                        const key = format(d, 'yyyy-MM-dd')
                        const dayEvents = eventsByDate.get(key) ?? []
                        const overflow = dayEvents.length - 3
                        const isCurrentMonth = isSameMonth(d, currentMonth)
                        const todayRing = isToday(d)

                        return (
                            <div
                                key={i}
                                onClick={() => { setNewEventDate(key); setNewEventOpen(true) }}
                                className={cn(
                                    'border-r border-b border-slate-200 p-1.5 min-h-[90px] cursor-pointer hover:bg-slate-50 transition-colors',
                                    !isCurrentMonth && 'bg-slate-50/60'
                                )}
                            >
                                <div className="flex justify-end mb-1">
                                    <span className={cn(
                                        'h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold',
                                        todayRing ? 'bg-brand-teal text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                                    )}>
                                        {format(d, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    {dayEvents.slice(0, 3).map((ev) => (
                                        <div
                                            key={ev.id}
                                            className={cn('rounded px-1 py-0.5 text-[10px] font-medium truncate leading-snug', chipColor(ev))}
                                            title={ev.title}
                                        >
                                            {ev.title}
                                        </div>
                                    ))}
                                    {overflow > 0 && (
                                        <div className="text-[10px] text-slate-400 px-1">+{overflow} more</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Upcoming sidebar */}
            <div className="w-[220px] shrink-0 flex flex-col">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Next 7 Days</h3>
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {upcoming.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">No upcoming events.</p>
                    ) : (
                        upcoming.map((ev) => (
                            <div key={ev.id} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                                <p className="text-xs font-semibold text-brand-navy leading-snug truncate">{ev.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{format(parseISO(ev.start_date), 'EEE, MMM d')}</p>
                                <span className={cn('inline-flex mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium', chipColor(ev))}>
                                    {ev.event_type === 'pm_auto' ? 'PM' : ev.visibility === 'public' ? 'Public' : 'Dept'}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Legend</p>
                    {[
                        { color: 'bg-blue-100 text-blue-800', label: 'Public Event' },
                        { color: 'bg-purple-100 text-purple-800', label: 'Dept Event' },
                        { color: 'bg-teal-100 text-teal-800', label: 'PM Schedule' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-2">
                            <span className={cn('h-2.5 w-2.5 rounded-sm', color.split(' ')[0])} />
                            <span className="text-[10px] text-slate-500">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <NewEventModal
                open={newEventOpen}
                onOpenChange={setNewEventOpen}
                defaultDate={newEventDate}
                onSuccess={() => { setNewEventOpen(false); onRefresh() }}
            />
        </div>
    )
}
