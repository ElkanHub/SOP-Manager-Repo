'use client'

import { useRouter } from 'next/navigation'
import { FileText, ShieldCheck, Zap, AlertOctagon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function OnboardingWelcome() {
    const router = useRouter()
    const supabase = createClient()
    const [isFirstUser, setIsFirstUser] = useState(false)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)

    useEffect(() => {
        async function checkFirstUser() {
            const { data: adminExists, error } = await supabase.rpc('check_admin_exists')
            if (error) {
                console.error('Error checking admin status:', error)
            }
            if (!adminExists) {
                setIsFirstUser(true)
            }
            setLoading(false)
        }
        checkFirstUser()
    }, [])

    const handleAdminProceed = async () => {
        setApplying(true)
        const { error } = await supabase.rpc('claim_admin_role')
        if (error) {
            console.error('Failed to claim admin role:', error)
            setApplying(false)
            return // Prevent fast navigation if it fails
        }
        router.push('/onboarding/department')
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent" />
            </div>
        )
    }

    if (isFirstUser) {
        return (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50 dark:bg-red-500/20 dark:ring-red-500/10">
                    <AlertOctagon className="h-10 w-10 text-red-600 dark:text-red-500" />
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <h1 className="text-display font-bold text-foreground">
                        Critical Notice: Initial Setup
                    </h1>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-left space-y-3">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            You are the very first user to sign in to this application workspace.
                        </p>
                        <p className="text-sm text-foreground">
                            As the first user, you will be automatically assigned the <strong>Administrator</strong> role. This grants you complete and unrestricted access to determine the system structure, override capabilities, and all matters of setup.
                        </p>
                        <p className="text-sm text-foreground font-medium underline decoration-red-500/30 underline-offset-4">
                            If you are not the designated Quality Assurance Manager or System Administrator, DO NOT PROCEED.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Unauthorised setup of the system architecture can lead to compliance issues and administrative penalties. Please contact your manager to complete the setup first before returning to configure your profile.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="h-12 w-full sm:w-auto min-w-[200px]"
                        disabled={applying}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        I am not the Administrator
                    </Button>
                    <Button
                        onClick={handleAdminProceed}
                        className="h-12 w-full sm:w-auto min-w-[200px] text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                        disabled={applying}
                    >
                        {applying ? "Applying Role..." : "I understand, configure space"}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 ring-8 ring-slate-50 dark:bg-muted dark:ring-muted/50">
                <ShieldCheck className="h-10 w-10 text-brand-teal" />
            </div>

            <div className="space-y-4">
                <h1 className="text-display font-bold text-foreground">
                    Welcome to SOP-Guard Pro
                </h1>
                <p className="text-body-lg text-muted-foreground max-w-md mx-auto">
                    We just need a few details to get your workspace ready and securely bind your digital signature.
                </p>
            </div>

            <div className="grid gap-4 w-full text-left bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Fast Setup</h3>
                        <p className="text-sm text-muted-foreground">Takes less than 2 minutes to complete your profile.</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-teal">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">FDA Compliant</h3>
                        <p className="text-sm text-muted-foreground">Your digital signature will be securely encrypted and audit-logged.</p>
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
