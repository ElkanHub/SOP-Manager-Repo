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
    slate: { bg: 'bg-slate-50', icon: 'text-slate-500' },
}

export function KpiCard({ title, value, suffix = '', icon: Icon, colorScheme, href }: KpiCardProps) {
    const CardContent = (
        <div className={cn(
            "flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all",
            href && "hover:border-slate-300 hover:shadow-md cursor-pointer"
        )}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorMap[colorScheme].bg)}>
                    <Icon className={cn("h-5 w-5", colorMap[colorScheme].icon)} />
                </div>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-brand-navy">
                    <NumberTicker value={value} duration={0.6} decimalPlaces={suffix === '%' && value % 1 !== 0 ? 1 : 0} />
                </span>
                {suffix && <span className="text-base font-semibold text-slate-400">{suffix}</span>}
            </div>
        </div>
    )

    if (href) {
        return <Link href={href} className="flex-1 min-w-[200px]">{CardContent}</Link>
    }
    return <div className="flex-1 min-w-[200px]">{CardContent}</div>
}
