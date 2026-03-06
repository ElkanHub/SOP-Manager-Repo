'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { PmCompletionModal } from './pm-completion-modal'
import QRCode from 'react-qr-code'
import { format } from 'date-fns'
import { Wrench, Link2, Calendar, Hash, Cpu } from 'lucide-react'
import type { Equipment } from '@/types/app.types'

interface PmTask {
    id: string
    status: string
    due_date: string
    completed_at: string | null
    notes: string | null
    photo_url: string | null
    profiles?: { full_name: string } | null
}

interface AssetDetailSheetProps {
    equipment: Equipment & { departments?: { name: string } | null; sops?: { sop_number: string; title: string } | null }
    open: boolean
    onOpenChange: (open: boolean) => void
    onRefresh?: () => void
}

export function AssetDetailSheet({ equipment, open, onOpenChange, onRefresh }: AssetDetailSheetProps) {
    const [history, setHistory] = useState<PmTask[]>([])
    const [pendingTask, setPendingTask] = useState<PmTask | null>(null)
    const [completionModalOpen, setCompletionModalOpen] = useState(false)
    const supabase = createClient()

    const fetchHistory = useCallback(async () => {
        const { data } = await supabase
            .from('pm_tasks')
            .select('id, status, due_date, completed_at, notes, photo_url, profiles!completed_by(full_name)')
            .eq('equipment_id', equipment.id)
            .order('due_date', { ascending: false })
            .limit(20)

        const tasks = (data ?? []) as PmTask[]
        setHistory(tasks.filter((t) => t.status === 'complete'))
        setPendingTask(tasks.find((t) => t.status === 'pending' || t.status === 'overdue') ?? null)
    }, [equipment.id])

    useEffect(() => {
        if (open) fetchHistory()
    }, [open, fetchHistory])

    const pageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/equipment/${equipment.id}`

    const dept = equipment.departments as { name: string } | null
    const sop = equipment.sops as { sop_number: string; title: string } | null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[480px] overflow-y-auto p-0" side="right">
                {/* Top section */}
                <div className="border-b border-slate-200 bg-gradient-to-br from-brand-navy to-slate-800 p-6 text-white">
                    <SheetHeader>
                        <SheetTitle className="text-white text-lg font-bold">{equipment.name}</SheetTitle>
                    </SheetHeader>
                    <div className="flex items-start justify-between mt-3 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-300">{equipment.asset_id}</span>
                                {dept && (
                                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">{dept.name}</span>
                                )}
                                <StatusBadge status={equipment.status} size="sm" />
                            </div>
                            {equipment.model && <p className="text-sm text-slate-300">{equipment.model}</p>}
                        </div>
                        <div className="shrink-0 bg-white rounded-lg p-2">
                            <QRCode value={pageUrl} size={80} />
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {equipment.serial_number && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Hash className="h-3.5 w-3.5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Serial</p>
                                    <p className="font-mono">{equipment.serial_number}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Cpu className="h-3.5 w-3.5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase">Frequency</p>
                                <p className="capitalize">{equipment.frequency}{equipment.custom_interval_days ? ` (${equipment.custom_interval_days}d)` : ''}</p>
                            </div>
                        </div>
                        {equipment.next_due && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Next Due</p>
                                    <p>{format(new Date(equipment.next_due), 'MMM d, yyyy')}</p>
                                </div>
                            </div>
                        )}
                        {sop && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Link2 className="h-3.5 w-3.5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase">SOP</p>
                                    <a href={`/sops/${equipment.linked_sop_id}`} className="text-brand-blue hover:underline">
                                        {sop.sop_number}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {equipment.photo_url && (
                        <div className="rounded-xl overflow-hidden border border-slate-200">
                            <img src={equipment.photo_url} alt={equipment.name} className="w-full h-48 object-cover" />
                        </div>
                    )}

                    {/* Log PM button */}
                    {pendingTask && (
                        <Button
                            className="w-full bg-brand-teal hover:bg-teal-700 text-white"
                            onClick={() => setCompletionModalOpen(true)}
                        >
                            <Wrench className="mr-2 h-4 w-4" />
                            Log PM Completion
                        </Button>
                    )}

                    {/* Service history */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Service History</h3>
                        <div className="space-y-2">
                            {history.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-3 text-center">No service history yet.</p>
                            ) : (
                                history.map((task) => (
                                    <div key={task.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {task.completed_at
                                                    ? format(new Date(task.completed_at), 'MMM d, yyyy h:mm a')
                                                    : format(new Date(task.due_date), 'MMM d, yyyy')
                                                }
                                            </span>
                                            {task.profiles && (
                                                <span className="text-[10px] text-slate-500">
                                                    by {(task.profiles as { full_name: string }).full_name}
                                                </span>
                                            )}
                                        </div>
                                        {task.notes && <p className="text-xs text-slate-600">{task.notes}</p>}
                                        {task.photo_url && (
                                            <img src={task.photo_url} alt="PM photo" className="mt-2 h-20 w-full object-cover rounded-md" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {pendingTask && (
                    <PmCompletionModal
                        open={completionModalOpen}
                        onOpenChange={setCompletionModalOpen}
                        task={pendingTask}
                        equipmentName={equipment.name}
                        onComplete={() => {
                            setCompletionModalOpen(false)
                            fetchHistory()
                            onRefresh?.()
                        }}
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}
