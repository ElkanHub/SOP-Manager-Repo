'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Wrench, UploadCloud, X } from 'lucide-react'
import { format } from 'date-fns'

interface PmTask {
    id: string
    due_date: string
}

interface PmCompletionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: PmTask
    equipmentName: string
    onComplete: () => void
}

export function PmCompletionModal({
    open,
    onOpenChange,
    task,
    equipmentName,
    onComplete,
}: PmCompletionModalProps) {
    const [notes, setNotes] = useState('')
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()

    const reset = () => { setNotes(''); setPhotoFile(null) }

    const handleConfirm = async () => {
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            let photoUrl: string | null = null
            if (photoFile) {
                const path = `${user.id}/${Date.now()}-${photoFile.name}`
                const { error: upErr } = await supabase.storage
                    .from('pm-photos')
                    .upload(path, photoFile)
                if (!upErr) {
                    const { data: urlData } = supabase.storage.from('pm-photos').getPublicUrl(path)
                    photoUrl = urlData.publicUrl
                }
            }

            const { error } = await supabase
                .from('pm_tasks')
                .update({
                    status: 'complete',
                    completed_by: user.id,
                    completed_at: new Date().toISOString(),
                    notes: notes || null,
                    photo_url: photoUrl,
                })
                .eq('id', task.id)

            if (error) throw error

            toast.success('PM completion logged!', {
                description: `Next task has been scheduled automatically.`,
            })
            reset()
            onComplete()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            toast.error('Failed to log completion', { description: message })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-brand-navy">
                        <Wrench className="h-5 w-5 text-brand-teal" />
                        Log PM Completion
                    </DialogTitle>
                    <DialogDescription>
                        Confirm and log preventive maintenance for {equipmentName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs text-muted-foreground space-y-1">
                    <p><span className="font-semibold text-foreground">Equipment:</span> {equipmentName}</p>
                    <p><span className="font-semibold text-foreground">Due Date:</span> {format(new Date(task.due_date), 'MMMM d, yyyy')}</p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="pm-notes">Completion Notes (optional)</Label>
                    <Textarea
                        id="pm-notes"
                        placeholder="Describe any observations or actions taken..."
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Photo upload */}
                <div className="space-y-1.5">
                    <Label>Photo Evidence (optional)</Label>
                    <div
                        onClick={() => document.getElementById('pm-photo-input')?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 p-5 cursor-pointer hover:border-brand-teal/50 transition-colors"
                    >
                        <input
                            id="pm-photo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                        />
                        {photoFile ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-brand-navy font-medium dark:text-foreground">{photoFile.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setPhotoFile(null) }} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="h-5 w-5 text-muted-foreground/30" />
                                <p className="text-xs text-muted-foreground">Click to attach photo</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }} disabled={submitting}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="bg-brand-teal text-white hover:bg-teal-700 min-w-[130px]"
                    >
                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <>
                            <Wrench className="mr-2 h-4 w-4" /> Confirm Completion
                        </>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
