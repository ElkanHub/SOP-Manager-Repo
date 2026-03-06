'use client'

import { useRouter } from 'next/navigation'
import { FileText, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingWelcome() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 ring-8 ring-slate-50">
                <ShieldCheck className="h-10 w-10 text-brand-teal" />
            </div>

            <div className="space-y-4">
                <h1 className="text-display font-bold text-brand-navy">
                    Welcome to SOP-Guard Pro
                </h1>
                <p className="text-body-lg text-slate-600 max-w-md mx-auto">
                    We just need a few details to get your workspace ready and securely bind your digital signature.
                </p>
            </div>

            <div className="grid gap-4 w-full text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-brand-navy">Fast Setup</h3>
                        <p className="text-sm text-slate-500">Takes less than 2 minutes to complete your profile.</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-teal">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-brand-navy">FDA Compliant</h3>
                        <p className="text-sm text-slate-500">Your digital signature will be securely encrypted and audit-logged.</p>
                    </div>
                </div>
            </div>

            <Button
                onClick={() => router.push('/onboarding/department')}
                className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-semibold bg-brand-teal hover:bg-teal-700"
            >
                Get Started
            </Button>
        </div>
    )
}
