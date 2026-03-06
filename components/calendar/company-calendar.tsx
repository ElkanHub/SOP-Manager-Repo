'use client'

import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    addDays, addMonths, subMonths, addWeeks, subWeeks,
    isSameMonth, isToday, parseISO, differenceInCalendarDays,
    startOfDay, endOfDay, isSameDay, addDays as add,
    getHours, eachHourOfInterval,
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
    start_time?: string | null
    event_type: 'manual' | 'pm_auto'
    visibility: 'public' | 'dept'
}

interface CompanyCalendarProps {
    events: CalendarEvent[]
    onRefresh: () => void
}

type ViewMode = 'month' | 'week' | 'day'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function chipColor(ev: CalendarEvent) {
    if (ev.event_type === 'pm_auto') return 'bg-teal-100 text-teal-800 border-teal-200'
    if (ev.visibility === 'public') return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-purple-100 text-purple-800 border-purple-200'
}

function EventChip({ ev, mini = false }: { ev: CalendarEvent; mini?: boolean }) {
    return (
        <div
            className={cn(
                'rounded border px-1.5 truncate font-medium leading-snug',
                chipColor(ev),
                mini ? 'py-0.5 text-[10px]' : 'py-1 text-xs'
            )}
            title={ev.title}
        >
            {ev.start_time && !mini && (
                <span className="opacity-60 mr-1">{ev.start_time.slice(0, 5)}</span>
            )}
            {ev.title}
        </div>
    )
}

// ─── Month View ──────────────────────────────────────────────────────────────
function MonthView({ date, events, onDayClick }: {
    date: Date
    events: CalendarEvent[]
    onDayClick: (d: string) => void
}) {
    const monthStart = startOfMonth(date)
    const gridStart = startOfWeek(monthStart)
    const gridEnd = endOfWeek(endOfMonth(date))

    const days: Date[] = []
    let d = gridStart
    while (d <= gridEnd) { days.push(d); d = addDays(d, 1) }

    const byDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        for (const ev of events) {
            const key = ev.start_date.slice(0, 10)
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(ev)
        }
        return map
    }, [events])

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-l border-t border-slate-200">
                {WEEKDAYS.map((wd) => (
                    <div key={wd} className="border-r border-b border-slate-200 py-1.5 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                        {wd}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-1 border-l border-slate-200 overflow-hidden">
                {days.map((day, i) => {
                    const key = format(day, 'yyyy-MM-dd')
                    const dayEvs = byDate.get(key) ?? []
                    const overflow = dayEvs.length - 3
                    const inMonth = isSameMonth(day, date)
                    return (
                        <div
                            key={i}
                            onClick={() => onDayClick(key)}
                            className={cn(
                                'border-r border-b border-slate-200 p-1.5 min-h-[90px] cursor-pointer transition-colors',
                                inMonth ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/60'
                            )}
                        >
                            <div className="flex justify-end mb-1">
                                <span className={cn(
                                    'h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold',
                                    isToday(day) ? 'bg-brand-teal text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                {dayEvs.slice(0, 3).map((ev) => <EventChip key={ev.id} ev={ev} mini />)}
                                {overflow > 0 && <p className="text-[10px] text-slate-400 px-1">+{overflow} more</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ date, events, onDayClick }: {
    date: Date
    events: CalendarEvent[]
    onDayClick: (d: string) => void
}) {
    const weekStart = startOfWeek(date)
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    const byDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        for (const ev of events) {
            const key = ev.start_date.slice(0, 10)
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(ev)
        }
        return map
    }, [events])

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-l border-t border-slate-200 shrink-0">
                {days.map((day) => (
                    <div
                        key={day.toISOString()}
                        onClick={() => onDayClick(format(day, 'yyyy-MM-dd'))}
                        className="border-r border-b border-slate-100 py-2 text-center cursor-pointer hover:bg-slate-50"
                    >
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{format(day, 'EEE')}</p>
                        <span className={cn(
                            'mx-auto mt-0.5 h-7 w-7 flex items-center justify-center rounded-full text-sm font-bold',
                            isToday(day) ? 'bg-brand-teal text-white' : 'text-slate-700'
                        )}>
                            {format(day, 'd')}
                        </span>
                    </div>
                ))}
            </div>
            {/* Hour rows */}
            <div className="flex-1 overflow-y-auto border-l border-slate-200">
                {HOURS.map((hour) => (
                    <div key={hour} className="grid grid-cols-7 border-b border-slate-100 min-h-[48px]">
                        {days.map((day) => {
                            const key = format(day, 'yyyy-MM-dd')
                            const evs = (byDate.get(key) ?? []).filter((ev) => {
                                if (!ev.start_time) return hour === 0
                                return parseInt(ev.start_time.slice(0, 2)) === hour
                            })
                            return (
                                <div key={key} className={cn('border-r border-slate-100 p-0.5 relative', isToday(day) && 'bg-teal-50/30')}>
                                    {hour === 0 && evs.length === 0 && !days.some(d => format(d, 'yyyy-MM-dd') === key) ? null : null}
                                    <div className="space-y-0.5 mt-0.5">
                                        {evs.map((ev) => <EventChip key={ev.id} ev={ev} mini />)}
                                    </div>
                                    {/* Show all-day events in hour 0 */}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Day / Schedule View ──────────────────────────────────────────────────────
function DayView({ date, events, onDayClick }: {
    date: Date
    events: CalendarEvent[]
    onDayClick: (d: string) => void
}) {
    const key = format(date, 'yyyy-MM-dd')
    const dayEvs = events.filter((ev) => ev.start_date.slice(0, 10) === key)
    const timedEvs = dayEvs.filter((ev) => ev.start_time)
    const allDayEvs = dayEvs.filter((ev) => !ev.start_time)

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 shrink-0">
                <p className="text-lg font-bold text-brand-navy">{format(date, 'EEEE, MMMM d, yyyy')}</p>
                {allDayEvs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {allDayEvs.map((ev) => <EventChip key={ev.id} ev={ev} />)}
                    </div>
                )}
            </div>
            {/* Hour timeline */}
            <div className="flex-1 overflow-y-auto">
                {HOURS.map((hour) => {
                    const evs = timedEvs.filter((ev) => parseInt(ev.start_time!.slice(0, 2)) === hour)
                    return (
                        <div key={hour} className="flex border-b border-slate-100 min-h-[56px] group hover:bg-slate-50/50">
                            <div className="w-16 shrink-0 px-2 pt-1 text-[10px] text-slate-400 font-medium text-right">
                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </div>
                            <div className="flex-1 border-l border-slate-100 p-1 space-y-1">
                                {evs.map((ev) => <EventChip key={ev.id} ev={ev} />)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Upcoming List ────────────────────────────────────────────────────────────
function UpcomingList({ events }: { events: CalendarEvent[] }) {
    const today = new Date()
    const upcoming = events
        .filter((ev) => differenceInCalendarDays(parseISO(ev.start_date), today) >= 0)
        .sort((a, b) => a.start_date.localeCompare(b.start_date))
        .slice(0, 10)

    if (upcoming.length === 0) return (
        <p className="text-xs text-slate-400 italic text-center py-3">No upcoming events in the next 7 days.</p>
    )

    // Group by date
    const grouped = upcoming.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
        const key = ev.start_date.slice(0, 10)
        if (!acc[key]) acc[key] = []
        acc[key].push(ev)
        return acc
    }, {})

    return (
        <div className="space-y-3">
            {Object.entries(grouped).map(([dateKey, evs]) => (
                <div key={dateKey} className="flex gap-3 items-start">
                    <div className="w-16 shrink-0 text-right">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{format(parseISO(dateKey), 'MMM')}</p>
                        <p className="text-2xl font-bold text-brand-navy leading-none">{format(parseISO(dateKey), 'd')}</p>
                        <p className="text-[10px] text-slate-400">{format(parseISO(dateKey), 'EEE')}</p>
                    </div>
                    <div className="flex-1 space-y-1.5 pt-1">
                        {evs.map((ev) => <EventChip key={ev.id} ev={ev} />)}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CompanyCalendar({ events, onRefresh }: CompanyCalendarProps) {
    const [view, setView] = useState<ViewMode>('month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [newEventOpen, setNewEventOpen] = useState(false)
    const [newEventDate, setNewEventDate] = useState<string | undefined>()

    const navigate = (dir: 1 | -1) => {
        if (view === 'month') setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
        else if (view === 'week') setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
        else setCurrentDate(add(currentDate, dir))
    }

    const headerLabel = () => {
        if (view === 'month') return format(currentDate, 'MMMM yyyy')
        if (view === 'week') {
            const s = startOfWeek(currentDate)
            const e = endOfWeek(currentDate)
            return isSameMonth(s, e)
                ? `${format(s, 'MMM d')} – ${format(e, 'd, yyyy')}`
                : `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`
        }
        return format(currentDate, 'EEEE, MMMM d, yyyy')
    }

    const handleDayClick = (dateStr: string) => {
        if (view === 'month') {
            setCurrentDate(parseISO(dateStr))
            setView('day')
        } else {
            setNewEventDate(dateStr)
            setNewEventOpen(true)
        }
    }

    const views: { key: ViewMode; label: string }[] = [
        { key: 'day', label: 'Day' },
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
    ]

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-base font-bold text-brand-navy min-w-[200px] text-center">{headerLabel()}</h2>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs ml-1" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        {views.map((v) => (
                            <button
                                key={v.key}
                                onClick={() => setView(v.key)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-semibold transition-colors border-r border-slate-200 last:border-0',
                                    view === v.key
                                        ? 'bg-brand-navy text-white'
                                        : 'bg-white text-slate-500 hover:bg-slate-50'
                                )}
                            >
                                {v.label}
                            </button>
                        ))}
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
            </div>

            {/* Calendar view — fills available space */}
            <div className="flex-1 min-h-0 rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm bg-white">
                {view === 'month' && <MonthView date={currentDate} events={events} onDayClick={handleDayClick} />}
                {view === 'week' && <WeekView date={currentDate} events={events} onDayClick={handleDayClick} />}
                {view === 'day' && <DayView date={currentDate} events={events} onDayClick={handleDayClick} />}
            </div>

            {/* Upcoming events BELOW the calendar */}
            <div className="shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Upcoming Events</h3>
                    <div className="flex gap-3 text-[9px] font-medium text-slate-400">
                        {[
                            { color: 'bg-blue-400', label: 'Public' },
                            { color: 'bg-purple-400', label: 'Dept' },
                            { color: 'bg-teal-400', label: 'PM' },
                        ].map(({ color, label }) => (
                            <span key={label} className="flex items-center gap-1">
                                <span className={cn('h-2 w-2 rounded-sm', color)} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
                <UpcomingList events={events} />
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
