'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Optionally log the error to an error reporting service
        console.error('Dashboard Error Boundary caught:', error)
    }, [error])

    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-background">
            <div className="rounded-full bg-red-100 p-4 mb-6">
                <AlertOctagon className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">Something went wrong!</h2>
            <p className="text-slate-500 max-w-md mb-8">
                We encountered an unexpected error while loading this page. This could be due to a temporary network issue or a missing resource.
            </p>

            <div className="flex items-center gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-brand-teal hover:bg-teal-700 text-white min-w-[140px]"
                >
                    <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
                <Link href="/dashboard">
                    <Button variant="outline" className="min-w-[140px]">
                        <Home className="mr-2 h-4 w-4" /> Go Home
                    </Button>
                </Link>
            </div>

            {/* Optional: Show technically detailed error message in dev mode only */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 text-left max-w-2xl w-full p-4 rounded-md bg-slate-800 text-slate-300 text-xs font-mono overflow-auto max-h-48 shadow-inner">
                    <p className="font-bold text-red-400 mb-2">Developer Details:</p>
                    {error.message}
                    {error.stack && <pre className="mt-2 text-[10px] text-slate-500">{error.stack}</pre>}
                </div>
            )}
        </div>
    )
}
