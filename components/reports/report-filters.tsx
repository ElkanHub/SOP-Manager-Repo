'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Download } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Department {
    id: string
    name: string
}

interface ReportFiltersProps {
    onDateChange: (range: { from?: Date; to?: Date } | undefined) => void
    onDeptChange: (deptId: string | 'all') => void
    onExport: () => void
    isExportable?: boolean
}

export function ReportFilters({ onDateChange, onDeptChange, onExport, isExportable = true }: ReportFiltersProps) {
    const [departments, setDepartments] = useState<Department[]>([])
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>()
    const [selectedDept, setSelectedDept] = useState<string>('all')
    const [isQAAdmin, setIsQAAdmin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function fetchAccess() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('dept_id, role, departments(is_qa, name)')
                .eq('id', user.id)
                .single()

            const qa = profile?.role === 'admin' || (profile?.departments as any)?.is_qa === true
            setIsQAAdmin(qa)

            if (qa) {
                // QA can see all departments
                const { data: depts } = await supabase.from('departments').select('id, name').order('name')
                setDepartments(depts || [])
            } else {
                // Standard users locked to their own
                setDepartments([
                    { id: profile?.dept_id as string, name: (profile?.departments as any)?.name as string }
                ])
                setSelectedDept(profile?.dept_id as string) // enforce local
                onDeptChange(profile?.dept_id as string)
            }
        }
        fetchAccess()
    }, [supabase, onDeptChange])

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border border-border bg-muted/50 rounded-lg">

            {/* Date Range Picker */}
            <div className="flex-1 w-full sm:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[260px] justify-start text-left font-normal bg-card",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange as any}
                            onSelect={(range: any) => {
                                setDateRange(range)
                                onDateChange(range)
                            }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Department Filter (Only enabled for QA) */}
            <Select
                value={selectedDept}
                onValueChange={(val) => {
                    setSelectedDept(val)
                    onDeptChange(val)
                }}
                disabled={!isQAAdmin}
            >
                <SelectTrigger className="w-full sm:w-[220px] bg-card">
                    <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                    {isQAAdmin && <SelectItem value="all">All Departments</SelectItem>}
                    {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* View / Clear Filters
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => {
                setDateRange(undefined)
                if (isQAAdmin) setSelectedDept('all')
                onDateChange(undefined)
                if (isQAAdmin) onDeptChange('all')
            }}>
                Clear Filters
            </Button> */}

            <div className="flex-1 w-full flex sm:justify-end">
                <Button
                    variant="outline"
                    className="w-full sm:w-auto bg-card hover:bg-muted/50 border-border"
                    onClick={onExport}
                    disabled={!isExportable}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
        </div>
    )
}
