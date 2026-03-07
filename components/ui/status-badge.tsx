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
        classes: 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20',
    },
    draft: {
        label: 'Draft',
        classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
    },
    pending_qa: {
        label: 'Pending QA',
        classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20',
    },
    superseded: {
        label: 'Superseded',
        classes: 'bg-muted text-muted-foreground border-border',
    },
    overdue: {
        label: 'Overdue',
        classes: 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20',
    },
    pending: {
        label: 'Pending',
        classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20',
    },
    approved: {
        label: 'Approved',
        classes: 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20',
    },
    rejected: {
        label: 'Rejected',
        classes: 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20',
    },
    needs_revision: {
        label: 'Needs Revision',
        classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
    },
    changes_requested: {
        label: 'Needs Revision',
        classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
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
        classes: 'bg-muted text-muted-foreground border-border',
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
