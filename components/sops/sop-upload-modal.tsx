'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { UploadCloud, FileText, CheckCircle2, ChevronRight, Loader2, X } from 'lucide-react'
import type { SopRecord } from '@/types/app.types'

interface SopUploadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultType?: 'new' | 'update'
    defaultSopId?: string
}

type Step = 1 | 2 | 3

export function SopUploadModal({ open, onOpenChange, defaultType = 'new', defaultSopId }: SopUploadModalProps) {
    const supabase = createClient()
    const [step, setStep] = useState<Step>(1)
    const [submitting, setSubmitting] = useState(false)

    // Step 1 state
    const [file, setFile] = useState<File | null>(null)
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Step 2 state
    const [sopNumber, setSopNumber] = useState('')
    const [title, setTitle] = useState('')
    const [deptId, setDeptId] = useState('')
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
    const [type, setType] = useState<'new' | 'update'>(defaultType)
    const [existingSops, setExistingSops] = useState<SopRecord[]>([])
    const [updateTargetId, setUpdateTargetId] = useState(defaultSopId ?? '')

    // Step 3 state
    const [notes, setNotes] = useState('')

    const resetForm = () => {
        setStep(1)
        setFile(null)
        setSopNumber('')
        setTitle('')
        setDeptId('')
        setType('new')
        setUpdateTargetId('')
        setNotes('')
    }

    const handleClose = () => {
        resetForm()
        onOpenChange(false)
    }

    const loadMetadata = useCallback(async () => {
        const [{ data: depts }, { data: sops }, { data: profile }] = await Promise.all([
            supabase.from('departments').select('id, name').order('name'),
            supabase.from('sops').select('id, sop_number, title').neq('status', 'superseded').order('sop_number'),
            supabase.from('profiles').select('dept_id').eq('id', (await supabase.auth.getUser()).data.user!.id).single(),
        ])
        setDepartments(depts ?? [])
        setExistingSops(sops as SopRecord[] ?? [])
        setDeptId(profile?.dept_id ?? '')
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped?.name.endsWith('.docx')) {
            setFile(dropped)
        } else {
            toast.error('Invalid file type', { description: 'Only .docx files are accepted.' })
        }
    }, [])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected?.name.endsWith('.docx')) {
            setFile(selected)
        } else {
            toast.error('Invalid file type', { description: 'Only .docx files are accepted.' })
        }
    }

    const goToStep2 = () => {
        if (!file) {
            toast.error('No file selected', { description: 'Please upload a .docx file first.' })
            return
        }
        loadMetadata()
        setStep(2)
    }

    const goToStep3 = () => {
        if (!sopNumber.trim()) { toast.error('SOP Number is required'); return }
        if (!title.trim()) { toast.error('Title is required'); return }
        if (!deptId) { toast.error('Department is required'); return }
        if (type === 'update' && !updateTargetId) { toast.error('Select the existing SOP to update'); return }
        setStep(3)
    }

    const handleSubmit = async () => {
        if (!file) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 1. Upload file to sop-uploads/{user_id}/{uuid}.docx
            const fileId = crypto.randomUUID()
            const filePath = `${user.id}/${fileId}.docx`
            const { error: uploadErr } = await supabase.storage
                .from('sop-uploads')
                .upload(filePath, file, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
            if (uploadErr) throw uploadErr

            const { data: urlData } = supabase.storage.from('sop-uploads').getPublicUrl(filePath)
            const fileUrl = urlData.publicUrl

            // 2. Upsert sops row (for 'new') or use existing sop_id (for 'update')
            let sopId: string
            if (type === 'new') {
                const { data: newSop, error: sopErr } = await supabase
                    .from('sops')
                    .insert({
                        sop_number: sopNumber,
                        title,
                        dept_id: deptId,
                        file_url: fileUrl,
                        status: 'pending_qa',
                        submitted_by: user.id,
                    })
                    .select('id')
                    .single()
                if (sopErr) throw sopErr
                sopId = newSop.id
            } else {
                sopId = updateTargetId
                await supabase.from('sops').update({ file_url: fileUrl }).eq('id', sopId)
            }

            // 3. Create approval request
            const { error: reqErr } = await supabase
                .from('sop_approval_requests')
                .insert({
                    sop_id: sopId,
                    submitted_by: user.id,
                    type,
                    notes_to_qa: notes || null,
                    status: 'pending',
                })
            if (reqErr) throw reqErr

            toast.success('Submitted for QA review!', {
                description: `${sopNumber} has been submitted and is awaiting QA approval.`,
            })
            handleClose()
        } catch (err: any) {
            toast.error('Submission failed', { description: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    const stepLabels = ['Upload File', 'Metadata', 'Notes to QA']

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-brand-navy">
                        <UploadCloud className="h-5 w-5 text-brand-teal" />
                        Submit SOP for Review
                    </DialogTitle>
                    <DialogDescription>
                        Upload a .docx file and submit it for QA approval.
                    </DialogDescription>
                </DialogHeader>

                {/* Step Progress */}
                <div className="flex items-center gap-2 pt-2">
                    {stepLabels.map((label, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                            <div className={cn(
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border transition-colors',
                                step > i + 1 ? 'bg-brand-teal border-brand-teal text-white' :
                                    step === i + 1 ? 'border-brand-navy bg-brand-navy text-white' :
                                        'border-slate-300 text-slate-400'
                            )}>
                                {step > i + 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <span className={cn('text-xs', step === i + 1 ? 'font-semibold text-brand-navy' : 'text-slate-400')}>
                                {label}
                            </span>
                            {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: File Upload */}
                {step === 1 && (
                    <div className="space-y-4 pt-2">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all',
                                dragging ? 'border-brand-teal bg-teal-50' : 'border-slate-200 bg-slate-50 hover:border-brand-teal/50 hover:bg-slate-100'
                            )}
                        >
                            <input ref={fileInputRef} type="file" accept=".docx" className="hidden" onChange={handleFileInput} />
                            {file ? (
                                <>
                                    <FileText className="h-10 w-10 text-brand-teal" />
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-brand-navy">{file.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-slate-400"
                                        onClick={(e) => { e.stopPropagation(); setFile(null) }}
                                    >
                                        <X className="mr-1 h-3 w-3" /> Remove
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-10 w-10 text-slate-300" />
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-brand-navy">Drag & drop your .docx file</p>
                                        <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={goToStep2} className="bg-brand-navy text-white hover:bg-slate-800">
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Metadata */}
                {step === 2 && (
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sop-number">SOP Number *</Label>
                                <Input id="sop-number" placeholder="e.g. SOP-084" value={sopNumber} onChange={(e) => setSopNumber(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Type *</Label>
                                <div className="flex gap-2">
                                    {(['new', 'update'] as const).map((t) => (
                                        <button key={t} onClick={() => setType(t)} className={cn(
                                            'flex-1 rounded-lg border py-2 text-sm font-medium transition-all capitalize',
                                            type === t ? 'border-brand-teal bg-teal-50 text-brand-navy' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        )}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="sop-title">Title *</Label>
                            <Input id="sop-title" placeholder="e.g. Centrifuge Maintenance Procedure" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Department *</Label>
                            <Select value={deptId} onValueChange={setDeptId}>
                                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {type === 'update' && (
                            <div className="space-y-1.5">
                                <Label>Existing SOP to Update *</Label>
                                <Select value={updateTargetId} onValueChange={setUpdateTargetId}>
                                    <SelectTrigger><SelectValue placeholder="Search and select SOP" /></SelectTrigger>
                                    <SelectContent>
                                        {existingSops.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.sop_number} — {s.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={goToStep3} className="bg-brand-navy text-white hover:bg-slate-800">
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Notes */}
                {step === 3 && (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="notes">Notes to QA (optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Describe the changes, context, or any specific QA instructions..."
                                value={notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value.slice(0, 500))}
                                rows={5}
                                className="resize-none"
                            />
                            <p className="text-xs text-slate-400 text-right">{notes.length}/500</p>
                        </div>

                        {/* Summary card */}
                        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs space-y-1 text-slate-600">
                            <div><span className="font-semibold">File:</span> {file?.name}</div>
                            <div><span className="font-semibold">SOP:</span> {sopNumber} — {title}</div>
                            <div><span className="font-semibold">Type:</span> {type === 'new' ? 'New SOP' : 'Update to existing'}</div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-brand-teal text-white hover:bg-teal-700 min-w-[140px]"
                            >
                                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Submit for Review'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
