'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { SignatureConfirmModal } from './signature-confirm-modal'
import { PenLine, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

interface Signatory {
    id: string
    full_name: string
    role: string
    job_title?: string
    departments?: { name: string } | null
}

interface SignatureCert {
    user_id: string
    signed_at: string
}

interface SignatureGridProps {
    changeControlId: string
    sopTitle: string
    sopVersion: string
    deptId: string
}

export function SignatureGrid({ changeControlId, sopTitle, sopVersion, deptId }: SignatureGridProps) {
    const [signatories, setSignatories] = useState<Signatory[]>([])
    const [certs, setCerts] = useState<SignatureCert[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const supabase = createClient()

    const load = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)

        // Required signatories: managers/admins in this dept
        const { data: people } = await supabase
            .from('profiles')
            .select('id, full_name, role, job_title, departments(name)')
            .eq('dept_id', deptId)
            .in('role', ['manager', 'admin'])

        setSignatories((people ?? []) as Signatory[])

        // Existing signatures
        const { data: sigs } = await supabase
            .from('signature_certificates')
            .select('user_id, signed_at')
            .eq('change_control_id', changeControlId)

        setCerts((sigs ?? []).map(s => ({ user_id: s.user_id, signed_at: s.signed_at ?? '' })))
    }, [changeControlId, deptId])

    useEffect(() => { load() }, [load])

    const handleSigned = () => {
        load()
        setConfirmModalOpen(false)
    }

    const certMap = new Map(certs.map((c) => [c.user_id, c]))
    const currentUserIsSig = signatories.some((s) => s.id === currentUserId)
    const currentUserSigned = certMap.has(currentUserId)

    return (
        <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Required Signatures</span>
                </div>
                {currentUserIsSig && !currentUserSigned && (
                    <Button
                        size="sm"
                        className="h-7 bg-brand-navy hover:bg-slate-800 text-white text-xs"
                        onClick={() => setConfirmModalOpen(true)}
                    >
                        <PenLine className="mr-1.5 h-3 w-3" />
                        Sign
                    </Button>
                )}
            </div>

            <div className="divide-y divide-border">
                {signatories.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                        No required signatories found for this department.
                    </div>
                ) : (
                    signatories.map((s) => {
                        const cert = certMap.get(s.id)
                        const signed = !!cert
                        return (
                            <div key={s.id} className="flex items-center gap-4 px-4 py-3">
                                <div className="h-9 w-9 shrink-0 rounded-full bg-brand-navy text-white text-sm font-bold flex items-center justify-center uppercase">
                                    {s.full_name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-foreground">{s.full_name}</span>
                                        <span className="text-xs capitalize text-muted-foreground bg-muted rounded-full px-2 py-0.5">{s.role}</span>
                                        {s.departments && (
                                            <span className="text-xs text-muted-foreground">{(s.departments as any).name}</span>
                                        )}
                                    </div>
                                    {s.job_title && <p className="text-xs text-muted-foreground mt-0.5">{s.job_title}</p>}
                                </div>
                                <div className="shrink-0">
                                    {signed ? (
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-green-700 dark:text-green-500">Signed</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {format(new Date(cert!.signed_at), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <StatusBadge status="pending_qa" size="sm" />
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <SignatureConfirmModal
                open={confirmModalOpen}
                onOpenChange={setConfirmModalOpen}
                changeControlId={changeControlId}
                sopTitle={sopTitle}
                sopVersion={sopVersion}
                onSigned={handleSigned}
            />
        </div>
    )
}
