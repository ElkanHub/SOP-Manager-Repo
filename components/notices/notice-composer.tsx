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
import { Loader2, Send, Users, Building2, User, Search, X, Check } from 'lucide-react'

type Audience = 'everyone' | 'department' | 'individuals'

interface Profile {
    id: string
    full_name: string
    job_title?: string
    departments?: { name: string } | null
}

interface NoticeComposerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface Department {
    id: string
    name: string
}

export function NoticeComposer({ open, onOpenChange }: NoticeComposerProps) {
    const [audience, setAudience] = useState<Audience>('everyone')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Department state
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectedDeptId, setSelectedDeptId] = useState<string>('')
    const [loadingDepts, setLoadingDepts] = useState(false)

    // Individuals state
    const [allUsers, setAllUsers] = useState<Profile[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')
    const [loadingUsers, setLoadingUsers] = useState(false)

    const supabase = createClient()

    const reset = () => {
        setAudience('everyone')
        setSubject('')
        setMessage('')
        setSelectedIds(new Set())
        setSelectedDeptId('')
        setSearch('')
    }

    const loadDepartments = useCallback(async () => {
        if (departments.length > 0) return
        setLoadingDepts(true)
        const { data } = await supabase.from('departments').select('id, name').order('name')
        setDepartments((data ?? []) as Department[])
        setLoadingDepts(false)
    }, [departments.length])

    // Load users when Individuals is selected
    const loadUsers = useCallback(async () => {
        if (allUsers.length > 0) return
        setLoadingUsers(true)
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, job_title, departments(name)')
            .order('full_name', { ascending: true })
        setAllUsers((data ?? []) as Profile[])
        setLoadingUsers(false)
    }, [allUsers.length])

    useEffect(() => {
        if (audience === 'individuals') loadUsers()
        if (audience === 'department') loadDepartments()
    }, [audience, loadUsers, loadDepartments])

    const toggleUser = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const filteredUsers = allUsers.filter((u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.job_title?.toLowerCase().includes(search.toLowerCase()) ||
        (u.departments as { name: string } | null)?.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleSend = async () => {
        if (!subject.trim()) { toast.error('Subject is required'); return }
        if (!message.trim()) { toast.error('Message is required'); return }
        if (audience === 'individuals' && selectedIds.size === 0) {
            toast.error('Please select at least one recipient')
            return
        }
        if (audience === 'department' && !selectedDeptId) {
            toast.error('Please select a department')
            return
        }

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            let deptId: string | null = null
            if (audience === 'department') {
                deptId = selectedDeptId || null
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

            // Insert individual recipients
            if (audience === 'individuals' && selectedIds.size > 0) {
                const rows = [...selectedIds].map((uid) => ({
                    notice_id: notice.id,
                    user_id: uid,
                }))
                await supabase.from('notice_recipients').insert(rows)
            }

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

            const recipientLabel =
                audience === 'everyone' ? 'all staff' :
                    audience === 'department' ? 'your department' :
                        `${selectedIds.size} individual${selectedIds.size > 1 ? 's' : ''}`

            toast.success('Notice sent!', { description: `Delivered to ${recipientLabel}.` })
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
        { value: 'department', label: 'Department', icon: <Building2 className="h-4 w-4" /> },
        { value: 'individuals', label: 'Individuals', icon: <User className="h-4 w-4" /> },
    ]

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
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

                    {/* Department picker */}
                    {audience === 'department' && (
                        <div className="space-y-1.5">
                            <Label>Select Department</Label>
                            {loadingDepts ? (
                                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading departments...
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {departments.map((d) => (
                                        <button
                                            key={d.id}
                                            onClick={() => setSelectedDeptId(d.id)}
                                            className={cn(
                                                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-all',
                                                selectedDeptId === d.id
                                                    ? 'border-brand-teal bg-teal-50 text-brand-navy'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            )}
                                        >
                                            <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                            <span className="truncate">{d.name}</span>
                                            {selectedDeptId === d.id && <Check className="ml-auto h-3.5 w-3.5 text-brand-teal shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Individuals people-picker */}
                    {audience === 'individuals' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Select Recipients</Label>
                                {selectedIds.size > 0 && (
                                    <span className="text-[10px] font-semibold text-brand-teal bg-teal-50 rounded-full px-2 py-0.5">
                                        {selectedIds.size} selected
                                    </span>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <Input
                                    placeholder="Search by name, role, or department..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-8 text-xs"
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            {/* Selected chips */}
                            {selectedIds.size > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {[...selectedIds].map((id) => {
                                        const u = allUsers.find((p) => p.id === id)
                                        if (!u) return null
                                        return (
                                            <span
                                                key={id}
                                                className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-medium rounded-full px-2 py-0.5"
                                            >
                                                {u.full_name}
                                                <button onClick={() => toggleUser(id)} className="hover:text-red-500">
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        )
                                    })}
                                </div>
                            )}

                            {/* User list */}
                            <div className="rounded-lg border border-slate-200 max-h-[200px] overflow-y-auto">
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-slate-400 italic">No users found.</div>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const selected = selectedIds.has(u.id)
                                        const dept = u.departments as { name: string } | null
                                        return (
                                            <button
                                                key={u.id}
                                                onClick={() => toggleUser(u.id)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-100 last:border-0',
                                                    selected ? 'bg-teal-50' : 'hover:bg-slate-50'
                                                )}
                                            >
                                                <div className={cn(
                                                    'h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold uppercase',
                                                    selected ? 'bg-brand-teal text-white' : 'bg-brand-navy text-white'
                                                )}>
                                                    {u.full_name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 truncate">{u.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">
                                                        {u.job_title ?? ''}
                                                        {u.job_title && dept ? ' · ' : ''}
                                                        {dept?.name ?? ''}
                                                    </p>
                                                </div>
                                                {selected && <Check className="h-4 w-4 text-brand-teal shrink-0" />}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

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
                        disabled={submitting || !subject || !message || (audience === 'individuals' && selectedIds.size === 0) || (audience === 'department' && !selectedDeptId)}
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
