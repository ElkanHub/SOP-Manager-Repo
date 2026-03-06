'use client'

import { usePathname } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
    { id: '1', name: 'Welcome', path: '/onboarding' },
    { id: '2', name: 'Department', path: '/onboarding/department' },
    { id: '3', name: 'Role', path: '/onboarding/role' },
    { id: '4', name: 'Profile', path: '/onboarding/profile' },
    { id: '5', name: 'Signature', path: '/onboarding/signature' },
]

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Determine current step index (0-4) based on pathname
    const currentStepIndex = STEPS.findIndex(step => {
        if (step.path === '/onboarding') {
            return pathname === '/onboarding' || pathname === '/onboarding/'
        }
        return pathname.startsWith(step.path)
    })

    // Fallback if not found
    const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0

    return (
        <div className="flex min-h-svh flex-col bg-slate-50">
            {/* Top Progress Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-brand-navy">SOP-Guard Pro</div>
                        <div className="text-sm font-medium text-slate-500">
                            Step {activeIndex + 1} of {STEPS.length}
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="mt-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 bg-slate-200" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-brand-teal transition-all duration-300"
                            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                        />

                        <ul className="relative flex justify-between z-10 w-full">
                            {STEPS.map((step, idx) => {
                                const isCompleted = idx < activeIndex
                                const isCurrent = idx === activeIndex
                                const isPending = idx > activeIndex

                                return (
                                    <li key={step.id} className="flex flex-col items-center group">
                                        <div className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-colors",
                                            isCompleted ? "border-brand-teal bg-brand-teal text-white" : "",
                                            isCurrent ? "border-brand-blue text-brand-blue ring-4 ring-blue-100" : "",
                                            isPending ? "border-slate-300 text-slate-400" : ""
                                        )}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <span className="text-sm font-semibold">{step.id}</span>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "absolute -bottom-6 text-xs font-medium whitespace-nowrap",
                                            isCurrent ? "text-brand-navy" : "text-slate-500",
                                            isPending ? "text-slate-400" : "",
                                            // Adjust alignment for first and last items so texts don't overflow screen
                                            idx === 0 ? "left-0 translate-x-0" : "",
                                            idx === STEPS.length - 1 ? "right-0 translate-x-0" : "",
                                            (idx > 0 && idx < STEPS.length - 1) ? "-translate-x-1/4" : ""
                                        )}>
                                            {step.name}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex justify-center py-12 px-6">
                <div className="w-full max-w-xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
