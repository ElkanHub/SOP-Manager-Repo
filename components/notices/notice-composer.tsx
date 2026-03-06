'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Loader2, Send, Users, Building2, User } from 'lucide-react'

type Audience = 'everyone' | 'department' | 'individuals'

interface NoticeComposerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NoticeComposer({ open, onOpenChange }: NoticeComposerProps) {
    const [audience, setAudience] = useState<Audience>('everyone')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()

    const reset = () => { setAudience('everyone'); setSubject(''); setMessage('') }

    const handleSend = async () => {
        if (!subject.trim()) { toast.error('Subject is required'); return }
        if (!message.trim()) { toast.error('Message is required'); return }

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get dept if scoped
            let deptId: string | null = null
            if (audience === 'department') {
                const { data: profile } = await supabase
                    .from('profiles').select('dept_id').eq('id', user.id).single()
                deptId = profile?.dept_id ?? null
            }

            const { data: notice, error } = await supabase
                .from('notices')
                .insert({
                    author_id: user.id,
                    subject: subject.trim().slice(0, 80),
                    message: message.trim().slice(0, 500),
                    audience,
                    dept_id: deptId,
                })
                .select()
                .single()

            if (error || !notice) throw error ?? new Error('Failed to create notice')

            // Broadcast via Supabase Realtime
            await supabase.channel('notices').send({
                type: 'broadcast',
                event: 'new-notice',
                payload: {
                    id: notice.id,
                    subject: notice.subject,
                    message: notice.message,
                    audience: notice.audience,
                    dept_id: deptId,
                    author_id: user.id,
                    created_at: notice.created_at,
                },
            })

            toast.success('Notice sent!', { description: `Delivered to ${audience === 'everyone' ? 'all staff' : audience === 'department' ? 'your department' : 'selected recipients'}.` })
            reset()
            onOpenChange(false)
        } catch (err: unknown) {
            toast.error('Failed to send notice', { description: err instanceof Error ? err.message : 'Unknown error' })
        } finally {
            setSubmitting(false)
        }
    }

    const audienceOptions: { value: Audience; label: string; icon: React.ReactNode }[] = [
        { value: 'everyone', label: 'Everyone', icon: <Users className="h-4 w-4" /> },
        { value: 'department', label: 'My Department', icon: <Building2 className="h-4 w-4" /> },
        { value: 'individuals', label: 'Individuals', icon: <User className="h-4 w-4" /> },
    ]

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-brand-navy">
                        <Send className="h-5 w-5 text-brand-teal" />
                        Send Notice
                    </DialogTitle>
                    <DialogDescription>Broadcast a message to staff. It will appear in The Pulse in real-time.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    {/* Audience */}
                    <div className="space-y-1.5">
                        <Label>To</Label>
                        <div className="flex gap-2">
                            {audienceOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setAudience(opt.value)}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all',
                                        audience === opt.value
                                            ? 'border-brand-teal bg-teal-50 text-brand-navy'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                    )}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notice-subject">Subject *</Label>
                            <span className={cn('text-[10px]', subject.length > 70 ? 'text-amber-500' : 'text-slate-400')}>
                                {subject.length}/80
                            </span>
                        </div>
                        <Input
                            id="notice-subject"
                            placeholder="e.g. Lab closure tomorrow"
                            value={subject}
                            maxLength={80}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notice-message">Message *</Label>
                            <span className={cn('text-[10px]', message.length > 450 ? 'text-amber-500' : 'text-slate-400')}>
                                {message.length}/500
                            </span>
                        </div>
                        <Textarea
                            id="notice-message"
                            placeholder="Write your notice here..."
                            value={message}
                            maxLength={500}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }} disabled={submitting}>Cancel</Button>
                    <Button
                        onClick={handleSend}
                        disabled={submitting || !subject || !message}
                        className="bg-brand-teal text-white hover:bg-teal-700 min-w-[120px]"
                    >
                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <>
                            <Send className="mr-2 h-4 w-4" /> Send Notice
                        </>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
