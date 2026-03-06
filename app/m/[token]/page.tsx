'use client'

import { useEffect, useRef, useState, use } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, RotateCcw, XCircle, ShieldCheck } from 'lucide-react'

// Next.js 15 requires awaiting params
export default function MobileSigningPage({ params }: { params: Promise<{ token: string }> }) {
    const resolvedParams = use(params)
    const token = resolvedParams.token

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<'pending' | 'completed' | 'expired' | 'not_found'>('pending')
    const sigCanvas = useRef<SignatureCanvas>(null)
    const supabase = createClient()

    useEffect(() => {
        async function checkToken() {
            if (!token) return

            const { data, error } = await supabase
                .from('mobile_signatures')
                .select('status, expires_at')
                .eq('id', token)
                .single()

            if (error || !data) {
                setStatus('not_found')
            } else if (data.status === 'completed') {
                setStatus('completed')
            } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
                setStatus('expired')
            } else {
                setStatus('pending')
            }
            setLoading(false)
        }

        checkToken()
    }, [token, supabase])

    const handleClear = () => {
        sigCanvas.current?.clear()
    }

    const handleSave = async () => {
        if (sigCanvas.current?.isEmpty()) {
            alert('Please provide your signature.')
            return
        }

        setSaving(true)

        try {
            const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')

            const { error } = await supabase
                .from('mobile_signatures')
                .update({
                    signature_base64: dataURL,
                    status: 'completed'
                })
                .eq('id', token)

            if (error) throw error

            setStatus('completed')
        } catch (err) {
            console.error(err)
            alert('Failed to save signature. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    // Handle mobile viewport height correctly to prevent scrolling issues
    useEffect(() => {
        const setViewportHeight = () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        };
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        return () => window.removeEventListener('resize', setViewportHeight);
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-svh items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
        )
    }

    if (status !== 'pending') {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 p-6 text-center">
                {status === 'completed' ? (
                    <>
                        <CheckCircle2 className="mb-4 h-16 w-16 text-brand-teal" />
                        <h1 className="mb-2 text-2xl font-bold text-brand-navy">Signature Captured!</h1>
                        <p className="text-slate-500">
                            Your signature has been securely synced to your computer. You can close this window and return to your PC.
                        </p>
                    </>
                ) : (
                    <>
                        <XCircle className="mb-4 h-16 w-16 text-red-500" />
                        <h1 className="mb-2 text-2xl font-bold text-brand-navy">Link Expired</h1>
                        <p className="text-slate-500">
                            This signature request is no longer valid or has already been completed. Please request a new link on your PC.
                        </p>
                    </>
                )}
            </div>
        )
    }

    return (
        <div
            className="flex flex-col bg-slate-50 overflow-hidden"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        >
            <header className="flex h-16 items-center justify-center border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-brand-teal" />
                    <span className="text-lg font-bold text-brand-navy">SOP-Guard Pro</span>
                </div>
            </header>

            <main className="flex flex-1 flex-col p-4 relative">
                <div className="mb-4 text-center">
                    <h2 className="text-xl font-bold text-brand-navy">Sign below</h2>
                    <p className="text-sm text-slate-500">Please draw your signature smoothly.</p>
                </div>

                <div className="flex-1 rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden relative">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="#0D2B55"
                        canvasProps={{
                            className: "w-full h-full cursor-crosshair touch-none absolute inset-0",
                        }}
                    />
                    {/* Baseline guide */}
                    <div className="absolute bottom-[20%] left-[10%] right-[10%] h-px bg-slate-200 pointer-events-none" />
                </div>

                <div className="mt-4 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleClear}
                        disabled={saving}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                    <Button
                        className="flex-1 bg-brand-teal hover:bg-teal-700 text-white"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </div>
            </main>
        </div>
    )
}
