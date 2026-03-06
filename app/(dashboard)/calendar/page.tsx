'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CompanyCalendar } from '@/components/calendar/company-calendar'
import { CalendarDays } from 'lucide-react'
import {
    startOfMonth, endOfMonth, subMonths, addMonths,
    format,
} from 'date-fns'

interface CalendarEvent {
    id: string
    title: string
    start_date: string
    event_type: 'manual' | 'pm_auto'
    visibility: 'public' | 'dept'
}

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const supabase = createClient()

    const fetchEvents = useCallback(async () => {
        // Fetch a 3-month window so nav is smooth
        const start = format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd')
        const end = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd')

        const { data } = await supabase
            .from('events')
            .select('id, title, start_date, event_type, visibility')
            .gte('start_date', start)
            .lte('start_date', end)
            .order('start_date', { ascending: true })

        setEvents((data ?? []) as CalendarEvent[])
    }, [currentMonth])

    useEffect(() => { fetchEvents() }, [fetchEvents])

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-brand-navy">Company Calendar</h1>
                    <p className="text-xs text-slate-500">Events, PM schedules &amp; team activities</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <CompanyCalendar
                    events={events}
                    onRefresh={fetchEvents}
                />
            </div>
        </div>
    )
}
