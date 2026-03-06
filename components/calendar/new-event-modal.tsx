'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface NewEventModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultDate?: string
    onSuccess: () => void
}

export function NewEventModal({ open, onOpenChange, defaultDate, onSuccess }: NewEventModalProps) {
    const [title, setTitle] = useState('')
    const [startDate, setStartDate] = useState(defaultDate ?? '')
    const [startTime, setStartTime] = useState('')
    const [description, setDescription] = useState('')
    const [visibility, setVisibility] = useState<'public' | 'dept'>('public')
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()

    const reset = () => {
        setTitle(''); setStartDate(defaultDate ?? ''); setStartTime('')
        setDescription(''); setVisibility('public')
    }

    const handleSubmit = async () => {
        if (!title.trim()) { toast.error('Title is required'); return }
        if (!startDate) { toast.error('Date is required'); return }

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            let deptId: string | null = null
            if (visibility === 'dept') {
                const { data: profile } = await supabase.from('profiles').select('dept_id').eq('id', user.id).single()
                deptId = profile?.dept_id ?? null
            }

            const { error } = await supabase.from('events').insert({
                title: title.trim(),
                start_date: startDate,
                start_time: startTime || null,
                description: description || null,
                visibility,
                dept_id: deptId,
                event_type: 'manual',
                created_by: user.id,
            })

            if (error) throw error

            toast.success('Event created!')
            reset()
            onSuccess()
        } catch (err: unknown) {
            toast.error('Failed to create event', { description: err instanceof Error ? err.message : 'Unknown error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="text-brand-navy">New Event</DialogTitle>
                    <DialogDescription>Add an event to the company calendar.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="ev-title">Title *</Label>
                        <Input id="ev-title" placeholder="e.g. Safety Briefing" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ev-date">Date *</Label>
                            <Input id="ev-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ev-time">Time</Label>
                            <Input id="ev-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ev-desc">Description</Label>
                        <Textarea
                            id="ev-desc"
                            placeholder="Optional details..."
                            value={description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Visibility</Label>
                        <div className="flex rounded-lg border border-border overflow-hidden">
                            {(['public', 'dept'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setVisibility(v)}
                                    className={cn(
                                        'flex-1 py-2 text-sm font-medium capitalize transition-colors',
                                        visibility === v
                                            ? 'bg-brand-navy text-white'
                                            : 'text-muted-foreground hover:bg-muted/50'
                                    )}
                                >
                                    {v === 'public' ? 'Public (Everyone)' : 'My Department'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-brand-teal text-white hover:bg-teal-700 min-w-[110px]">
                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Create Event'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
