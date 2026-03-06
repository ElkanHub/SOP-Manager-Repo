'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, PenTool, RotateCcw, CheckCircle2 } from 'lucide-react'

export default function OnboardingSignature() {
    const sigCanvas = useRef<SignatureCanvas>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const clearCanvas = () => {
        sigCanvas.current?.clear()
    }

    const handleFinish = async () => {
        if (sigCanvas.current?.isEmpty()) {
            setError('Please provide your signature to continue.')
            return
        }

        setSaving(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            // Get the image data URI and convert it to a Blob
            const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')
            if (!dataURL) throw new Error('Failed to generate signature image')

            const res = await fetch(dataURL)
            const blob = await res.blob()

            const filePath = `${user.id}.png`

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

            // 3. Force refresh the session cookie so the middleware catches the change
            await supabase.auth.refreshSession()

            // Navigate to dashboard
            router.push('/dashboard')
            router.refresh()

        } catch (err: any) {
            console.error('Signature error:', err)
            setError(err.message || 'Failed to save signature. Did you create the public "signatures" bucket?')
            setSaving(false)
        }
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
                    <div className="flex items-center gap-2 text-brand-navy font-medium">
                        <PenTool className="h-4 w-4 text-brand-teal" />
                        Draw your signature
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-slate-500"
                        onClick={clearCanvas}
                    >
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Reset
                    </Button>
                </div>

                <div className="w-full bg-white relative">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="#0D2B55" // brand-navy
                        canvasProps={{
                            className: "w-full h-64 sm:h-80 cursor-crosshair rounded-b-lg",
                            style: { touchAction: 'none' } // Prevents scrolling on mobile while drawing
                        }}
                    />
                    {/* Subtle baseline */}
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
                    disabled={saving}
                >
                    Back
                </Button>
                <Button
                    onClick={handleFinish}
                    disabled={saving}
                    className="bg-brand-teal hover:bg-teal-700 text-white min-w-[160px]"
                >
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>Complete Setup <CheckCircle2 className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </div>
        </div>
    )
}
