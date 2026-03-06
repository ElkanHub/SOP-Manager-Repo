'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SopLibraryTable } from '@/components/sops/sop-library-table'
import { SopTabStrip } from '@/components/sops/sop-tab-strip'
import { SopViewer } from '@/components/sops/sop-viewer'
import { SopUploadModal } from '@/components/sops/sop-upload-modal'
import { useSopTabStore } from '@/stores/useSopTabStore'
import type { SopRecordWithDept } from '@/types/app.types'
import { BookOpen, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SopsPage() {
    const [sops, setSops] = useState<SopRecordWithDept[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const { activeTabId, openTabs } = useSopTabStore()
    const supabase = createClient()

    useEffect(() => {
        async function fetchSops() {
            setLoading(true)
            setError(null)
            try {
                const { data, error: fetchError } = await supabase
                    .from('sops')
                    .select('*, departments(name, color)')
                    .order('sop_number', { ascending: true })

                if (fetchError) throw fetchError
                setSops((data ?? []) as SopRecordWithDept[])
            } catch (err: any) {
                setError(err.message || 'Failed to fetch SOPs')
            } finally {
                setLoading(false)
            }
        }
        fetchSops()
    }, [])

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <BookOpen className="h-4 w-4" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-brand-navy">SOP Library</h1>
                    <p className="text-xs text-slate-500">Standard Operating Procedures</p>
                </div>
                <Button
                    size="sm"
                    className="ml-auto bg-brand-teal hover:bg-teal-700 text-white"
                    onClick={() => setUploadModalOpen(true)}
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload SOP
                </Button>
            </div>

            {/* Tab Strip (visible when tabs open) */}
            {openTabs.length > 0 && <SopTabStrip />}

            {/* Main Content: Viewer or Table */}
            {activeTabId ? (
                <div className="flex-1 overflow-hidden">
                    <SopViewer sopId={activeTabId} />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6">
                    <SopLibraryTable
                        sops={sops}
                        isLoading={loading}
                        error={error}
                    />
                </div>
            )}

            <SopUploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
        </div>
    )
}
