import { cn } from '@/lib/utils'

type SopStatus = 'draft' | 'pending_qa' | 'active' | 'superseded'

interface StatusBadgeProps {
    status: SopStatus | string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
    active: {
        label: 'Active',
        classes: 'bg-green-100 text-green-800 border-green-200',
    },
    draft: {
        label: 'Draft',
        classes: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    pending_qa: {
        label: 'Pending QA',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    superseded: {
        label: 'Superseded',
        classes: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    overdue: {
        label: 'Overdue',
        classes: 'bg-red-100 text-red-800 border-red-200',
    },
    pending: {
        label: 'Pending',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    approved: {
        label: 'Approved',
        classes: 'bg-green-100 text-green-800 border-green-200',
    },
    rejected: {
        label: 'Rejected',
        classes: 'bg-red-100 text-red-800 border-red-200',
    },
}

const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
    const config = statusConfig[status] ?? {
        label: status,
        classes: 'bg-slate-100 text-slate-600 border-slate-200',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-medium',
                sizeClasses[size],
                config.classes,
                className
            )}
        >
            {config.label}
        </span>
    )
}
