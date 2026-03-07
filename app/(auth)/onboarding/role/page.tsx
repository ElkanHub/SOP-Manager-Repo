'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Check, Users, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OnboardingRole() {
    const [selectedRole, setSelectedRole] = useState<'worker' | 'manager' | null>(null)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleNext = async () => {
        if (!selectedRole) return

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const { error } = await supabase
                .from('profiles')
                .update({ role: selectedRole })
                .eq('id', user.id)

            if (error) throw error

            router.push('/onboarding/profile')
        } catch (err) {
            console.error(err)
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-h2 font-bold text-foreground">What is your role?</h2>
                <p className="text-muted-foreground">
                    This controls your permission level within your department.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 py-4">
                {/* Worker Card */}
                <button
                    onClick={() => setSelectedRole('worker')}
                    className={cn(
                        "relative flex flex-col items-center gap-4 rounded-2xl border-2 p-8 text-center transition-all hover:border-brand-blue hover:bg-brand-blue/10",
                        selectedRole === 'worker'
                            ? "border-brand-blue bg-brand-blue/5 shadow-md ring-1 ring-brand-blue"
                            : "border-border bg-card"
                    )}
                >
                    {selectedRole === 'worker' && (
                        <div className="absolute top-4 right-4">
                            <Check className="h-5 w-5 text-brand-blue" />
                        </div>
                    )}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-brand-blue">
                        <Users className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Employee</h3>
                        <p className="text-sm text-muted-foreground">
                            I need to read active SOPs, acknowledge updates, and perform assigned tasks.
                        </p>
                    </div>
                </button>

                {/* Manager Card */}
                <button
                    onClick={() => setSelectedRole('manager')}
                    className={cn(
                        "relative flex flex-col items-center gap-4 rounded-2xl border-2 p-8 text-center transition-all hover:border-brand-teal hover:bg-brand-teal/10",
                        selectedRole === 'manager'
                            ? "border-brand-teal bg-brand-teal/5 shadow-md ring-1 ring-brand-teal"
                            : "border-border bg-card"
                    )}
                >
                    {selectedRole === 'manager' && (
                        <div className="absolute top-4 right-4">
                            <Check className="h-5 w-5 text-brand-teal" />
                        </div>
                    )}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-brand-teal">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Manager</h3>
                        <p className="text-sm text-muted-foreground">
                            I need to create draft SOPs, manage department equipment, and view reporting.
                        </p>
                    </div>
                </button>
            </div>

            <div className="flex justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/onboarding/department')}
                    disabled={saving}
                >
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!selectedRole || saving}
                    className="bg-brand-navy hover:bg-slate-800 text-white min-w-[140px]"
                >
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </div>
        </div>
    )
}
