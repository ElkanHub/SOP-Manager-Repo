'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Check, Building2, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Department {
    id: string
    name: string
    color: string | null
}

export default function OnboardingDepartment() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchDepartments() {
            const { data, error } = await supabase
                .from('departments')
                .select('id, name, color')
                .order('name')

            if (!error && data) {
                setDepartments(data)
            }
            setLoading(false)
        }
        fetchDepartments()
    }, [supabase])

    const handleNext = async () => {
        if (!selectedId) return

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            // Save the selected dept_id to the profile
            const { error } = await supabase
                .from('profiles')
                .update({ dept_id: selectedId })
                .eq('id', user.id)

            if (error) throw error

            router.push('/onboarding/role')
        } catch (err) {
            console.error(err)
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-h2 font-bold text-foreground">Select your department</h2>
                <p className="text-muted-foreground">
                    This determines which SOPs are relevant to you and your approval workflows.
                </p>
            </div>

            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {departments.map((dept) => {
                            const isSelected = selectedId === dept.id
                            return (
                                <button
                                    key={dept.id}
                                    onClick={() => setSelectedId(dept.id)}
                                    className={cn(
                                        "flex flex-col items-start gap-4 rounded-xl border-2 p-4 text-left transition-all hover:bg-muted/50",
                                        isSelected
                                            ? "border-brand-teal bg-brand-teal/10 shadow-sm ring-1 ring-brand-teal"
                                            : "border-border bg-card"
                                    )}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor: dept.color ? `var(--${dept.color}-100, #e0f2fe)` : '#e0f2fe',
                                                color: dept.color ? `var(--${dept.color}-700, #0369a1)` : '#0369a1'
                                            }}
                                        >
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        {isSelected && (
                                            <Check className="h-5 w-5 text-brand-teal" />
                                        )}
                                    </div>
                                    <span className="font-semibold text-foreground">{dept.name}</span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleNext}
                    disabled={!selectedId || saving}
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
