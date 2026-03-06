import { cn } from "@/lib/utils"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { LucideIcon } from "lucide-react"
import Link from "next/link"

export type KpiColorScheme = 'blue' | 'red' | 'green' | 'amber' | 'slate'

interface KpiCardProps {
    title: string
    value: number
    suffix?: string
    icon: LucideIcon
    colorScheme: KpiColorScheme
    href?: string
}

const colorMap: Record<KpiColorScheme, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    red: { bg: 'bg-red-50', icon: 'text-red-500' },
    green: { bg: 'bg-green-50', icon: 'text-green-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-500' },
    slate: { bg: 'bg-muted/50 dark:bg-muted', icon: 'text-muted-foreground' },
}

export function KpiCard({ title, value, suffix = '', icon: Icon, colorScheme, href }: KpiCardProps) {
    const CardContent = (
        <div className={cn(
            "flex h-full flex-col justify-between rounded-t-none rounded-b-lg border border-border bg-card p-4 shadow-none transition-all",
            href && "hover:border-primary/50 hover:shadow-md cursor-pointer"
        )}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">{title}</p>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colorMap[colorScheme].bg)}>
                    <Icon className={cn("h-4 w-4", colorMap[colorScheme].icon)} />
                </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                    <NumberTicker value={value} duration={0.6} decimalPlaces={suffix === '%' && value % 1 !== 0 ? 1 : 0} />
                </span>
                {suffix && <span className="text-sm font-semibold text-muted-foreground">{suffix}</span>}
            </div>
        </div>
    )

    if (href) {
        return <Link href={href} className="flex-1 min-w-[150px]">{CardContent}</Link>
    }
    return <div className="flex-1 min-w-[150px]">{CardContent}</div>
}
