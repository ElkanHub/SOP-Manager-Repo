import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PulseApproval {
    id: string
    sop_id: string
    type: 'new' | 'update'
    created_at: string
    sops?: { sop_number: string; title: string } | null
    profiles?: { full_name: string } | null
}

export function usePulse() {
    const [connected, setConnected] = useState(false)
    const [priorityApprovals, setPriorityApprovals] = useState<PulseApproval[]>([])
    const [isQaOrAdmin, setIsQaOrAdmin] = useState(false)
    const supabase = createClient()

    const fetchApprovals = useCallback(async () => {
        const { data } = await supabase
            .from('sop_approval_requests')
            .select('id, sop_id, type, created_at, sops(sop_number, title), profiles!submitted_by(full_name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(10)
        setPriorityApprovals((data ?? []) as PulseApproval[])
    }, [])

    const checkQaStatus = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, departments(is_qa)')
            .eq('id', user.id)
            .single()
        const isQA = profile?.role === 'admin' || (profile?.departments as any)?.is_qa === true
        setIsQaOrAdmin(isQA)
        if (isQA) fetchApprovals()
    }, [fetchApprovals])

    useEffect(() => {
        checkQaStatus()

        const channel = supabase.channel('pulse-global')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, (payload) => {
                console.log('Pulse: Notice change received!', payload)
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_tasks' }, (payload) => {
                console.log('Pulse: PM Task change received!', payload)
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'sop_approval_requests',
            }, () => {
                fetchApprovals()
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'sop_approval_requests',
            }, () => {
                fetchApprovals()
            })
            .subscribe((status) => {
                setConnected(status === 'SUBSCRIBED')
            })

        return () => { supabase.removeChannel(channel) }
    }, [supabase, fetchApprovals, checkQaStatus])

    return { connected, priorityApprovals, isQaOrAdmin }
}
