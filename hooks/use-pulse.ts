import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PulseApproval {
    id: string
    sop_id: string
    type: 'new' | 'update'
    status: 'pending' | 'needs_revision'
    created_at: string
    sops?: { sop_number: string; title: string } | null
    profiles?: { full_name: string } | null
}

export interface PulseNotice {
    id: string
    subject: string
    message: string
    audience: 'everyone' | 'department' | 'individuals'
    created_at: string
    author_id: string
    author_name?: string
    author_initials?: string
}

export function usePulse() {
    const [connected, setConnected] = useState(false)
    const [priorityApprovals, setPriorityApprovals] = useState<PulseApproval[]>([])
    const [isQaOrAdmin, setIsQaOrAdmin] = useState(false)
    const [notices, setNotices] = useState<PulseNotice[]>([])
    const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const supabase = createClient()

    const fetchApprovals = useCallback(async () => {
        const { data } = await supabase
            .from('sop_approval_requests')
            .select('id, sop_id, type, status, created_at, sops(sop_number, title), profiles!submitted_by(full_name)')
            .in('status', ['pending', 'needs_revision'])
            .order('created_at', { ascending: false })
            .limit(10)
        setPriorityApprovals((data ?? []) as PulseApproval[])
    }, [])

    const fetchNotices = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('notices')
            .select('id, subject, message, audience, created_at, author_id, profiles!author_id(full_name)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(15)

        const noticeList: PulseNotice[] = ((data ?? []) as any[]).map((n) => ({
            id: n.id,
            subject: n.subject,
            message: n.message,
            audience: n.audience,
            created_at: n.created_at,
            author_id: n.author_id,
            author_name: n.profiles?.full_name ?? 'System',
            author_initials: (n.profiles?.full_name as string | undefined)
                ?.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() ?? '?',
        }))
        setNotices(noticeList)

        if (userId) {
            const { data: acks } = await supabase
                .from('notice_acknowledgements')
                .select('notice_id')
                .eq('user_id', userId)
            setAcknowledgedIds(new Set(((acks ?? []) as { notice_id: string }[]).map((a) => a.notice_id)))
        }
    }, [])

    const checkQaStatus = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setCurrentUserId(user.id)

        const { data: profile } = await supabase
            .from('profiles')
            .select('role, dept_id, departments(is_qa)')
            .eq('id', user.id)
            .single()

        const isQA = profile?.role === 'admin' || (profile?.departments as any)?.is_qa === true
        setIsQaOrAdmin(isQA)
        fetchApprovals()

        fetchNotices(user.id)
    }, [fetchApprovals, fetchNotices])

    useEffect(() => {
        checkQaStatus()

        const channel = supabase.channel('pulse-global')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_tasks' }, () => { })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sop_approval_requests' }, () => { fetchApprovals() })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sop_approval_requests' }, () => { fetchApprovals() })
            .subscribe((status) => { setConnected(status === 'SUBSCRIBED') })

        // Realtime broadcast channel for notices (instant delivery, no RLS delay)
        const noticeChannel = supabase.channel('notices')
            .on('broadcast', { event: 'new-notice' }, ({ payload }: { payload: PulseNotice }) => {
                setNotices((prev) => [{ ...payload }, ...prev])
            })
            .on('broadcast', { event: 'notice-deleted' }, ({ payload }: { payload: { id: string } }) => {
                setNotices((prev) => prev.filter((n) => n.id !== payload.id))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            supabase.removeChannel(noticeChannel)
        }
    }, [supabase, fetchApprovals, checkQaStatus])

    return { connected, priorityApprovals, isQaOrAdmin, notices, acknowledgedIds, currentUserId }
}
