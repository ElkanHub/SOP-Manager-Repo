'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRowClick?: (row: TData) => void
    searchPlaceholder?: string
    searchColumn?: string
    className?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onRowClick,
    searchPlaceholder = 'Search...',
    searchColumn,
    className,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: { sorting, columnFilters, globalFilter },
    })

    return (
        <div className={cn('space-y-4', className)}>
            {/* Global search */}
            <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm text-sm"
            />

            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="border-slate-200">
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        'border-slate-100 transition-colors',
                                        onRowClick && 'cursor-pointer hover:bg-blue-50/50'
                                    )}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-sm text-slate-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 text-sm">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-slate-400">
                {table.getFilteredRowModel().rows.length} result{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
            </p>
        </div>
    )
}
