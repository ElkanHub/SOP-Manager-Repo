'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { UploadCloud, FileText, Loader2, X, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function ResubmitDraftPage() {
    const params = useParams()
    const router = useRouter()
    const requestId = params.id as string

    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [requestData, setRequestData] = useState<any>(null)
    const [notes, setNotes] = useState('')

    const [file, setFile] = useState<File | null>(null)
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        async function fetchRequest() {
            setLoading(true)
            const { data, error } = await supabase
                .from('sop_approval_requests')
                .select('id, sop_id, type, status, notes_to_qa, sops(sop_number, title, file_url)')
                .eq('id', requestId)
                .single()

            if (error || !data) {
                toast.error('Draft not found', { description: 'Could not load the revision request.' })
                router.push('/dashboard')
                return
            }

            if (data.status !== 'needs_revision') {
                toast.info('Request is not in revision state', { description: 'This item is either already pending or approved.' })
                router.push('/dashboard')
                return
            }

            setRequestData(data)
            setLoading(false)
        }
        fetchRequest()
    }, [requestId, router])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped?.name.endsWith('.docx')) {
            setFile(dropped)
        } else {
            toast.error('Invalid file type', { description: 'Only .docx files are accepted.' })
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected?.name.endsWith('.docx')) {
            setFile(selected)
        } else {
            toast.error('Invalid file type', { description: 'Only .docx files are accepted.' })
        }
    }

    const handleSubmit = async () => {
        if (!file) {
            toast.error('No file selected', { description: 'Please upload the corrected .docx file.' })
            return
        }

        setSubmitting(true)
        try {
            // 1. Upload via secure API route to overwrite the existing file
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await fetch('/api/storage/sop-upload', {
                method: 'POST',
                body: formData
            })
            if (!uploadRes.ok) {
                const errData = await uploadRes.json()
                throw new Error(errData.error || 'File upload failed')
            }
            const { filePath } = await uploadRes.json()

            // 2. Update SOP record with new file
            await supabase
                .from('sops')
                .update({ file_url: filePath, updated_at: new Date().toISOString() })
                .eq('id', requestData.sop_id)

            // 3. Update the approval request back to pending
            const { error: reqErr } = await supabase
                .from('sop_approval_requests')
                .update({
                    status: 'pending',
                    notes_to_qa: notes || requestData.notes_to_qa,
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)

            if (reqErr) throw reqErr

            toast.success('Resubmitted for QA review!', {
                description: `${requestData.sops.sop_number} has been sent back to QA.`,
            })

            // Wait briefly to let Pulse catch the database update, then redirect
            setTimeout(() => {
                router.push('/dashboard')
            }, 1000)

        } catch (err: any) {
            toast.error('Submission failed', { description: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-lg font-bold text-foreground">Resolve QA Revisions</h1>
                    <p className="text-xs text-muted-foreground">{requestData?.sops?.sop_number} — {requestData?.sops?.title}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card className="border-amber-200 bg-amber-50 shadow-sm dark:bg-amber-950/20 dark:border-amber-900/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                <AlertTriangle className="h-5 w-5" />
                                <CardTitle className="text-base">Revisions Required</CardTitle>
                            </div>
                            <CardDescription className="text-amber-700/80 dark:text-amber-600/80">
                                This SOP was sent back by QA. Please upload the corrected document and provide any relevant notes for the QA reviewer before resubmitting.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-base text-brand-navy">Upload Corrected Document</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* File Upload Area */}
                            {!file ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all bg-card text-center",
                                        dragging ? "border-brand-teal bg-teal-50/50" : "border-border hover:border-brand-teal/50 hover:bg-slate-50"
                                    )}
                                >
                                    <input
                                        type="file"
                                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileInput}
                                    />
                                    <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                                        <UploadCloud className="h-6 w-6 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">Click to upload or drag & drop</p>
                                        <p className="text-sm text-slate-500 mt-1">Accepts strictly .docx format</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between rounded-xl border border-brand-teal/30 bg-teal-50/50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                                            <FileText className="h-5 w-5 text-brand-teal" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-brand-navy dark:text-teal-400">{file.name}</p>
                                            <p className="text-xs text-slate-500">Ready for submission</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-slate-500 hover:text-red-500">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Author Notes */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Notes to QA Reviewer (Optional)
                                </label>
                                <Textarea
                                    placeholder="Briefly explain what you fixed..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[100px] bg-background"
                                />
                                {requestData?.notes_to_qa && !notes && (
                                    <p className="text-xs text-muted-foreground mt-1">Previous notes: "{requestData.notes_to_qa}"</p>
                                )}
                            </div>

                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-2 gap-3">
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!file || submitting}
                            className="bg-brand-teal hover:bg-teal-700 text-white min-w-[140px]"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resubmit for QA'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
