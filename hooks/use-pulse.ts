import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePulse() {
    const [connected, setConnected] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // Phase 3 static implementation of the architecture
        // We listen to changes on notices and pm_tasks for The Pulse to react real-time.
        const channel = supabase.channel('pulse-global')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notices' },
                (payload) => {
                    console.log('Pulse: Notice change received!', payload)
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pm_tasks' },
                (payload) => {
                    console.log('Pulse: PM Task change received!', payload)
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setConnected(true)
                } else {
                    setConnected(false)
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    return { connected }
}
