'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import type { SopRecordWithDept } from '@/types/app.types'
import { format } from 'date-fns'
import { CheckCircle2, FileText, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import DOMPurify from 'dompurify'

interface SopViewerProps {
    sopId: string
}

export function SopViewer({ sopId }: SopViewerProps) {
    const [sop, setSop] = useState<SopRecordWithDept | null>(null)
    const [htmlContent, setHtmlContent] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [docLoading, setDocLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasAcknowledged, setHasAcknowledged] = useState(false)
    const [acknowledging, setAcknowledging] = useState(false)
    const [userRole, setUserRole] = useState<string>('')
    const [userId, setUserId] = useState<string>('')
    const supabase = createClient()

    const loadSop = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')
            setUserId(user.id)

            // Fetch SOP with department + approver info
            const { data, error: sopError } = await supabase
                .from('sops')
                .select('*, departments(name, color), profiles!approved_by(full_name)')
                .eq('id', sopId)
                .single()

            if (sopError) throw sopError
            setSop(data as SopRecordWithDept)

            // Get user role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            if (profile) setUserRole(profile.role)

            // Check if this user has acknowledged this version
            const { data: ack } = await supabase
                .from('sop_acknowledgements')
                .select('id')
                .eq('sop_id', sopId)
                .eq('user_id', user.id)
                .eq('version', data.version)
                .single()
            setHasAcknowledged(!!ack)

            // Fetch and render docx if file_url exists
            if (data.file_url) {
                // Determine path or extract from legacy absolute URL
                let path = data.file_url
                if (path.includes('http')) {
                    try {
                        const url = new URL(path)
                        const parts = url.pathname.split('/sop-uploads/')
                        if (parts.length > 1) path = parts[1]
                    } catch (e) { }
                }

                // Get signed URL
                const { data: signData } = await supabase.storage.from('sop-uploads').createSignedUrl(path, 3600)
                const finalUrl = signData?.signedUrl || data.file_url

                // Keep the signed url for the download button
                setSop({ ...data, file_url: finalUrl } as SopRecordWithDept)

                await renderDocx(finalUrl)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load SOP')
        } finally {
            setLoading(false)
        }
    }, [sopId])

    const renderDocx = async (fileUrl: string) => {
        setDocLoading(true)
        try {
            // Fetch file as ArrayBuffer
            const response = await fetch(fileUrl)
            if (!response.ok) throw new Error('Failed to fetch document file')
            const arrayBuffer = await response.arrayBuffer()

            // Dynamically import mammoth to keep bundle lean
            const mammoth = await import('mammoth')
            const result = await mammoth.convertToHtml({ arrayBuffer })
            const cleanHtml = DOMPurify.sanitize(result.value, {
                ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'table', 'tr', 'td', 'th', 'br'],
                ALLOWED_ATTR: []
            })
            setHtmlContent(cleanHtml)
        } catch (err) {
            // Non-critical — show message but don't block the whole viewer
            setHtmlContent('<p class="text-muted-foreground text-sm italic">Could not render document. Download the file to view it.</p>')
        } finally {
            setDocLoading(false)
        }
    }

    const handleAcknowledge = async () => {
        if (!sop) return
        setAcknowledging(true)
        try {
            const { error } = await supabase
                .from('sop_acknowledgements')
                .insert({
                    sop_id: sop.id,
                    user_id: userId,
                    version: sop.version,
                })
            if (error) throw error
            setHasAcknowledged(true)
            toast.success('SOP Acknowledged', {
                description: `You have acknowledged ${sop.sop_number} v${sop.version}.`,
            })
        } catch (err: any) {
            toast.error('Acknowledgement failed', { description: err.message })
        } finally {
            setAcknowledging(false)
        }
    }

    useEffect(() => {
        loadSop()
    }, [loadSop])

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading SOP...</span>
            </div>
        )
    }

    if (error || !sop) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-red-500">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm">{error ?? 'SOP not found'}</p>
            </div>
        )
    }

    const dept = sop.departments
    const deptColorMap: Record<string, string> = {
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
        green: 'bg-green-500/10 text-green-700 dark:text-green-400',
        amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    }
    const deptClass = deptColorMap[dept?.color ?? 'blue'] ?? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'

    return (
        <div className="flex flex-col gap-0 h-full">
            {/* Viewer Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-card px-6 py-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-foreground">{sop.sop_number}</span>
                        <StatusBadge status={sop.status} />
                        <span className="text-xs text-muted-foreground font-mono">{sop.version}</span>
                        {dept && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${deptClass}`}>
                                {dept.name}
                            </span>
                        )}
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{sop.title}</h2>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {sop.date_listed && (
                            <span>Listed: {format(new Date(sop.date_listed), 'MMM d, yyyy')}</span>
                        )}
                        {sop.date_revised && (
                            <span>Revised: {format(new Date(sop.date_revised), 'MMM d, yyyy')}</span>
                        )}
                        {sop.profiles && (
                            <span>Approved by: {(sop.profiles as any).full_name}</span>
                        )}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {sop.status === 'active' && !hasAcknowledged && userRole === 'worker' && (
                        <Button
                            size="sm"
                            className="bg-brand-teal hover:bg-teal-700 text-white"
                            onClick={handleAcknowledge}
                            disabled={acknowledging}
                        >
                            {acknowledging ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Acknowledge
                        </Button>
                    )}
                    {hasAcknowledged && (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Acknowledged
                        </span>
                    )}
                    {sop.file_url && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={sop.file_url} download target="_blank" rel="noopener noreferrer">
                                <FileText className="mr-2 h-4 w-4" />
                                Download .docx
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto bg-card px-8 py-6">
                {!sop.file_url ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                        <FileText className="h-10 w-10" />
                        <p className="text-sm">No document file attached to this SOP.</p>
                    </div>
                ) : docLoading ? (
                    <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Rendering document...</span>
                    </div>
                ) : (
                    <div
                        className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-brand-blue prose-strong:text-foreground text-foreground"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                )}
            </div>
        </div>
    )
}
