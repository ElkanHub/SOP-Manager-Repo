'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, PenLine, ShieldCheck } from 'lucide-react'

interface SignatureConfirmModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    changeControlId: string
    sopTitle: string
    sopVersion: string
    onSigned: () => void
}

export function SignatureConfirmModal({
    open,
    onOpenChange,
    changeControlId,
    sopTitle,
    sopVersion,
    onSigned,
}: SignatureConfirmModalProps) {
    const [signing, setSigning] = useState(false)
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
    const [loaded, setLoaded] = useState(false)
    const supabase = createClient()

    const loadSignature = async () => {
        if (loaded) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
            .from('profiles')
            .select('signature_url')
            .eq('id', user.id)
            .single()
        setSignatureUrl(data?.signature_url ?? null)
        setLoaded(true)
    }

    const handleSign = async () => {
        setSigning(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')
            if (!signatureUrl) throw new Error('No signature on file. Please complete onboarding first.')

            // Get IP from our API route
            let ip = 'unknown'
            try {
                const ipRes = await fetch('/api/user/ip')
                const ipData = await ipRes.json() as { ip: string }
                ip = ipData.ip
            } catch {
                // non-fatal — proceed without IP
            }

            const { error } = await supabase
                .from('signature_certificates')
                .insert({
                    change_control_id: changeControlId,
                    user_id: user.id,
                    signature_url: signatureUrl,
                    ip_address: ip,
                })

            if (error) throw error

            toast.success('Signature confirmed', {
                description: `You have signed off on ${sopTitle} v${sopVersion}.`,
            })
            onSigned()
            onOpenChange(false)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            toast.error('Signing failed', { description: message })
        } finally {
            setSigning(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (o) loadSignature(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-brand-navy">
                        <ShieldCheck className="h-5 w-5 text-brand-teal" />
                        Confirm Signature
                    </DialogTitle>
                    <DialogDescription>
                        You are signing off on the following document update.
                    </DialogDescription>
                </DialogHeader>

                {/* SOP info */}
                <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-1 text-sm">
                    <p className="font-semibold text-foreground">{sopTitle}</p>
                    <p className="text-muted-foreground text-xs">Version: {sopVersion}</p>
                </div>

                {/* Signature preview */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Stored Signature</p>
                    {signatureUrl ? (
                        <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-center min-h-[100px]">
                            <img
                                src={signatureUrl}
                                alt="Your signature"
                                className="max-h-24 object-contain"
                            />
                        </div>
                    ) : (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400 text-center">
                            No signature on file. Please complete your onboarding profile before signing.
                        </div>
                    )}
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    By clicking &quot;Confirm &amp; Sign&quot; you are electronically signing this document. Your IP address and timestamp will be recorded.
                </p>

                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={signing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSign}
                        disabled={signing || !signatureUrl}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                    >
                        {signing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenLine className="mr-2 h-4 w-4" />}
                        Confirm &amp; Sign
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
