import { createClient } from '@/lib/supabase/server'
import { SopViewer } from '@/components/sops/sop-viewer'
import { SopTabStrip } from '@/components/sops/sop-tab-strip'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Params {
    params: Promise<{ id: string }>
}

export default async function SopDetailPage({ params }: Params) {
    const { id } = await params
    const supabase = await createClient()

    const { data: sop, error } = await supabase
        .from('sops')
        .select('id, sop_number, title, status')
        .eq('id', id)
        .single()

    if (error || !sop) {
        notFound()
    }

    return (
        <div className="flex flex-col h-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-3 shrink-0">
                <Link
                    href="/sops"
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-navy transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    SOP Library
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-semibold text-brand-navy">{sop.sop_number}</span>
            </div>

            <SopTabStrip />

            <div className="flex-1 overflow-hidden">
                <SopViewer sopId={id} />
            </div>
        </div>
    )
}
