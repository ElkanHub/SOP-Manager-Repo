'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { useSopTabStore } from '@/stores/useSopTabStore'
import type { SopRecordWithDept } from '@/types/app.types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { MoreHorizontal, ExternalLink } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface SopLibraryTableProps {
    sops: SopRecordWithDept[]
    isLoading?: boolean
    error?: string | null
}

const deptColorMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800',
    blue: 'bg-blue-100 text-blue-800',
    teal: 'bg-teal-100 text-teal-800',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
}

export function SopLibraryTable({ sops, isLoading, error }: SopLibraryTableProps) {
    const { openTab, setActive } = useSopTabStore()
    const router = useRouter()

    const handleRowClick = (sop: SopRecordWithDept) => {
        openTab({ id: sop.id, sop_number: sop.sop_number, title: sop.title })
        setActive(sop.id)
    }

    const columns: ColumnDef<SopRecordWithDept>[] = [
        {
            accessorKey: 'sop_number',
            header: 'SOP No.',
            cell: ({ row }) => (
                <span className="font-mono text-brand-navy font-semibold text-xs">
                    {row.original.sop_number}
                </span>
            ),
        },
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => (
                <span className="font-medium text-slate-800 max-w-[300px] block truncate">
                    {row.original.title}
                </span>
            ),
        },
        {
            accessorKey: 'departments.name',
            header: 'Department',
            cell: ({ row }) => {
                const dept = row.original.departments
                if (!dept) return null
                const colorClass = deptColorMap[dept.color ?? 'blue'] ?? 'bg-blue-100 text-blue-800'
                return (
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', colorClass)}>
                        {dept.name}
                    </span>
                )
            },
        },
        {
            accessorKey: 'version',
            header: 'Version',
            cell: ({ row }) => (
                <span className="text-xs text-slate-500 font-mono">{row.original.version}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: 'date_listed',
            header: 'Listed',
            cell: ({ row }) => {
                if (!row.original.date_listed) return <span className="text-slate-400">—</span>
                return (
                    <span className="text-xs text-slate-500">
                        {format(new Date(row.original.date_listed), 'MMM d, yyyy')}
                    </span>
                )
            },
        },
        {
            accessorKey: 'due_for_revision',
            header: 'Due for Revision',
            cell: ({ row }) => {
                const due = row.original.due_for_revision
                if (!due) return <span className="text-slate-400">—</span>
                const isOverdue = new Date(due) < new Date()
                return (
                    <span className={cn('text-xs', isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500')}>
                        {format(new Date(due), 'MMM d, yyyy')}
                    </span>
                )
            },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRowClick(row.original)
                            }}
                        >
                            Open in Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/sops/${row.original.id}`)
                            }}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Full Page
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center text-slate-400 text-sm">
                Loading SOPs...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-48 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">
                {error}
            </div>
        )
    }

    return (
        <DataTable
            columns={columns}
            data={sops}
            onRowClick={handleRowClick}
            searchPlaceholder="Search SOPs by name, number, or status..."
        />
    )
}
