'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, differenceInCalendarDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Plus, ExternalLink, SearchX } from 'lucide-react'
import { useState } from 'react'
import { AddEquipmentModal } from './add-equipment-modal'
import { AssetDetailSheet } from './asset-detail-sheet'
import type { Equipment } from '@/types/app.types'

interface EquipmentWithDept extends Equipment {
    departments?: { name: string; color?: string } | null
    sops?: { sop_number: string; title: string } | null
}

const freqColors: Record<string, string> = {
    daily: 'bg-red-100 text-red-800',
    weekly: 'bg-amber-100 text-amber-800',
    monthly: 'bg-blue-100 text-blue-800',
    quarterly: 'bg-teal-100 text-teal-800',
    custom: 'bg-purple-100 text-purple-800',
}

function NextDueCell({ date }: { date?: string }) {
    if (!date) return <span className="text-muted-foreground">—</span>
    const days = differenceInCalendarDays(new Date(date), new Date())
    const classes =
        days < 0 ? 'text-red-600 font-bold' :
            days <= 7 ? 'text-amber-600 font-semibold' :
                'text-green-700'
    return (
        <span className={cn('text-xs', classes)}>
            {format(new Date(date), 'MMM d, yyyy')}
            {days < 0 && ' (overdue)'}
            {days >= 0 && days <= 7 && ` (${days}d)`}
        </span>
    )
}

interface EquipmentTableProps {
    equipment: EquipmentWithDept[]
    isLoading?: boolean
    onRefresh?: () => void
}

export function EquipmentTable({ equipment, isLoading, onRefresh }: EquipmentTableProps) {
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithDept | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    const columns: ColumnDef<EquipmentWithDept>[] = [
        {
            accessorKey: 'asset_id',
            header: 'Asset ID',
            cell: ({ row }) => (
                <span className="font-mono text-xs text-brand-navy font-semibold">{row.original.asset_id}</span>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <span className="font-medium text-slate-800">{row.original.name}</span>
            ),
        },
        {
            accessorKey: 'departments.name',
            header: 'Department',
            cell: ({ row }) => {
                const dept = row.original.departments
                if (!dept) return null
                return (
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
                        {dept.name}
                    </span>
                )
            },
        },
        {
            accessorKey: 'sops.sop_number',
            header: 'Linked SOP',
            cell: ({ row }) => {
                const sop = row.original.sops
                if (!sop) return <span className="text-slate-400 text-xs">—</span>
                return (
                    <a
                        href={`/sops/${row.original.linked_sop_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-brand-blue hover:underline font-mono"
                    >
                        {sop.sop_number}
                        <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                )
            },
        },
        {
            accessorKey: 'frequency',
            header: 'Frequency',
            cell: ({ row }) => {
                const freq = row.original.frequency
                if (!freq) return null
                return (
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize', freqColors[freq] ?? 'bg-slate-100 text-slate-700')}>
                        {freq}
                    </span>
                )
            },
        },
        {
            accessorKey: 'last_serviced',
            header: 'Last Serviced',
            cell: ({ row }) => {
                const d = row.original.last_serviced
                return d
                    ? <span className="text-xs text-slate-500">{format(new Date(d), 'MMM d, yyyy')}</span>
                    : <span className="text-slate-400 text-xs">Never</span>
            },
        },
        {
            accessorKey: 'next_due',
            header: 'Next Due',
            cell: ({ row }) => <NextDueCell date={row.original.next_due} />,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Equipment actions">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedEquipment(row.original); setSheetOpen(true) }}>
                            View Details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div />
                <Button
                    size="sm"
                    className="bg-brand-teal hover:bg-teal-700 text-white"
                    onClick={() => setAddModalOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equipment
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={equipment}
                onRowClick={(row) => { setSelectedEquipment(row); setSheetOpen(true) }}
                searchPlaceholder="Search by name, asset ID, or department..."
                emptyStateIcon={<SearchX className="h-6 w-6" />}
                emptyStateMessage={
                    <div className="space-y-1">
                        <p className="font-semibold text-slate-700">No equipment found</p>
                        <p className="text-slate-500">Add your first piece of equipment by clicking the "Add Equipment" button above.</p>
                    </div>
                }
            />

            <AddEquipmentModal
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                onSuccess={() => { setAddModalOpen(false); onRefresh?.() }}
            />

            {selectedEquipment && (
                <AssetDetailSheet
                    equipment={selectedEquipment}
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    onRefresh={onRefresh}
                />
            )}
        </div>
    )
}
