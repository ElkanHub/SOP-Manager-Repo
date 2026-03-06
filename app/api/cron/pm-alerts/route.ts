import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called daily by Vercel Cron at 07:00
// Add to vercel.json: { "crons": [{ "path": "/api/cron/pm-alerts", "schedule": "0 7 * * *" }] }
export async function GET(req: NextRequest) {
    // Verify cron secret in production
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // 1. Mark overdue tasks
    await supabase
        .from('pm_tasks')
        .update({ status: 'overdue' })
        .lt('due_date', today)
        .eq('status', 'pending')

    // 2. Fetch tasks due today
    const { data: dueTasks } = await supabase
        .from('pm_tasks')
        .select('id, equipment_id, assigned_dept, equipment(name)')
        .eq('due_date', today)
        .eq('status', 'pending')

    if (!dueTasks || dueTasks.length === 0) {
        return NextResponse.json({ processed: 0 })
    }

    // 3. For each due task, notify workers in the assigned dept via notices
    let notified = 0
    for (const task of dueTasks) {
        const eqName = (task.equipment as { name: string } | null)?.name ?? 'Unknown Equipment'

        // Insert a notice that The Pulse can display to workers in this dept
        const { error } = await supabase
            .from('notices')
            .insert({
                author_id: '00000000-0000-0000-0000-000000000000', // system notice sentinel
                subject: `PM Due Today: ${eqName}`,
                message: `Preventive Maintenance for ${eqName} is due today. Please log your completion after servicing.`,
                audience: 'department',
                dept_id: task.assigned_dept,
            })

        if (!error) notified++
    }

    return NextResponse.json({ processed: dueTasks.length, notified })
}
