'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import QRCode from 'react-qr-code'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, PenTool, RotateCcw, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function OnboardingSignature() {
    const sigCanvas = useRef<SignatureCanvas>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mobileDialogOpen, setMobileDialogOpen] = useState(false)
    const [mobileToken, setMobileToken] = useState<string | null>(null)
    const [awaitingMobile, setAwaitingMobile] = useState(false)
    const [mobileUrl, setMobileUrl] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const clearCanvas = () => {
        sigCanvas.current?.clear()
    }

    // Set up the base URL when component mounts
    useEffect(() => {
        setMobileUrl(window.location.origin)
    }, [])

    // Listen for mobile signature completion via Realtime
    useEffect(() => {
        if (!mobileToken) return

        const channel = supabase.channel(`mobile_sign_${mobileToken}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'mobile_signatures',
                    filter: `id=eq.${mobileToken}`,
                },
                async (payload) => {
                    if (payload.new.status === 'completed' && payload.new.signature_base64) {
                        setAwaitingMobile(false)
                        setMobileDialogOpen(false)

                        // Once mobile is completed, upload it directly as if signed on PC
                        await processAndUploadSignature(payload.new.signature_base64)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [mobileToken])

    const requestMobileSign = async () => {
        setAwaitingMobile(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const { data, error } = await supabase
                .from('mobile_signatures')
                .insert({ user_id: user.id })
                .select()
                .single()

            if (error) throw error

            setMobileToken(data.id)
            setMobileDialogOpen(true)
        } catch (err: any) {
            console.error(err)
            setError('Failed to generate mobile link.')
            setAwaitingMobile(false)
        }
    }

    const processAndUploadSignature = async (dataURL: string) => {
        setSaving(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const res = await fetch(dataURL)
            const blob = await res.blob()

            const filePath = `${user.id}/signature.png`

            // 1. Upload signature to Storage
            const { error: uploadError } = await supabase.storage
                .from('signatures')
                .upload(filePath, blob, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('signatures').getPublicUrl(filePath)

            // 2. Update profile with signature URL and complete onboarding
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    signature_url: data.publicUrl,
                    onboarding_complete: true
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            // 3. Force refresh the session cookie
            await supabase.auth.refreshSession()

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            console.error('Signature error:', err)
            setError(err.message || 'Failed to finish saving. Please try again.')
            setSaving(false)
        }
    }

    const handleFinish = async () => {
        if (sigCanvas.current?.isEmpty()) {
            setError('Please provide your signature to continue.')
            return
        }
        const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')
        if (dataURL) await processAndUploadSignature(dataURL)
    }

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-h2 font-bold text-brand-navy">Digital Signature</h2>
                <p className="text-slate-500">
                    This will be legally binding for all SOP acknowledgements and workflows.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-1">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex flex-wrap items-center gap-4 w-full">
                        <div className="flex items-center gap-2 text-brand-navy font-medium">
                            <PenTool className="h-4 w-4 text-brand-teal" />
                            Draw your signature
                        </div>

                        <div className="ml-auto flex shrink-0 items-center justify-end gap-2 text-right">
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs border-brand-teal text-brand-teal hover:bg-teal-50"
                                            onClick={requestMobileSign}
                                            disabled={awaitingMobile || saving}
                                        >
                                            {awaitingMobile && !mobileDialogOpen ? (
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            ) : (
                                                <Smartphone className="mr-2 h-3 w-3" />
                                            )}
                                            Sign with Mobile
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="w-[200px] text-xs">
                                            It can be hard to draw fluidly with a mouse. Scan the QR code to seamlessly draw your signature on your phone's touch screen instead.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-slate-500"
                                onClick={clearCanvas}
                                disabled={saving || awaitingMobile}
                            >
                                <RotateCcw className="mr-2 h-3 w-3" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-white relative">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="#0D2B55"
                        canvasProps={{
                            className: "w-full h-64 sm:h-80 cursor-crosshair rounded-b-lg",
                            style: { touchAction: 'none' }
                        }}
                    />
                    <div className="absolute bottom-[20%] left-[10%] right-[10%] h-px bg-slate-200 pointer-events-none" />
                    <div className="absolute bottom-[20%] left-[10%] transform translate-y-4 text-xs font-mono text-slate-400 pointer-events-none">
                        Sign on the line
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-sm rounded-md bg-red-50 text-red-600 p-3">
                    {error}
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/onboarding/profile')}
                    disabled={saving || (awaitingMobile && !mobileDialogOpen)}
                >
                    Back
                </Button>
                <Button
                    onClick={handleFinish}
                    disabled={saving || (awaitingMobile && !mobileDialogOpen)}
                    className="bg-brand-teal hover:bg-teal-700 text-white min-w-[160px]"
                >
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>Complete Setup <CheckCircle2 className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </div>

            {/* Mobile Signing Dialog */}
            <Dialog
                open={mobileDialogOpen}
                onOpenChange={(open: boolean) => {
                    setMobileDialogOpen(open)
                    if (!open) setAwaitingMobile(false) // Cancel on close
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-brand-navy">
                            <Smartphone className="h-5 w-5 text-brand-teal" />
                            Sign on your Phone
                        </DialogTitle>
                        <DialogDescription>
                            Scan this QR code with your phone's camera. Draw your signature on your phone, and it will magically appear here.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center space-y-6 py-6 border rounded-xl border-dashed border-slate-200 bg-slate-50 mt-4">
                        {mobileToken && mobileUrl ? (
                            <>
                                <div className="rounded-lg bg-white p-4 shadow-sm">
                                    <QRCode
                                        value={`${mobileUrl}/m/${mobileToken}`}
                                        size={200}
                                        fgColor="#0D2B55"
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
                                    <Loader2 className="h-5 w-5 animate-spin text-brand-teal" />
                                    <span>Waiting for you to sign on your phone...</span>
                                </div>
                            </>
                        ) : (
                            <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
