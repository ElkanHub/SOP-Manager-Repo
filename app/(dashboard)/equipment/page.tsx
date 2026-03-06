'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EquipmentTable } from '@/components/equipment/equipment-table'
import type { Equipment } from '@/types/app.types'
import { Wrench } from 'lucide-react'

interface EquipmentWithDept extends Equipment {
    departments?: { name: string; color?: string } | null
    sops?: { sop_number: string; title: string } | null
}

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<EquipmentWithDept[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchEquipment = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('equipment')
            .select('*, departments(name, color), sops(sop_number, title)')
            .order('name', { ascending: true })
        setEquipment((data ?? []) as EquipmentWithDept[])
        setLoading(false)
    }, [])

    useEffect(() => { fetchEquipment() }, [fetchEquipment])

    return (
        <div className="flex flex-col h-full">
            {/* Page Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <Wrench className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-brand-navy">Equipment Registry</h1>
                    <p className="text-xs text-slate-500">Assets & Preventive Maintenance Schedule</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <EquipmentTable
                    equipment={equipment}
                    isLoading={loading}
                    onRefresh={fetchEquipment}
                />
            </div>
        </div>
    )
}
