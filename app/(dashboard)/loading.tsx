import { Loader2 } from 'lucide-react'

// Global suspense boundary fallback for dashboard routes
export default function DashboardLoading() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-background/50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    {/* Outer spinning ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-brand-teal border-t-transparent animate-spin" />
                    {/* Inner pulsing logo placeholder */}
                    <Loader2 className="h-6 w-6 text-brand-navy animate-pulse" />
                </div>
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading dashboard data...</p>
            </div>
        </div>
    )
}
