'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SopRecord } from '@/types/app.types'

interface AddEquipmentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'
const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'custom']

export function AddEquipmentModal({ open, onOpenChange, onSuccess }: AddEquipmentModalProps) {
    const supabase = createClient()
    const [submitting, setSubmitting] = useState(false)

    const [assetId, setAssetId] = useState('')
    const [name, setName] = useState('')
    const [deptId, setDeptId] = useState('')
    const [serial, setSerial] = useState('')
    const [model, setModel] = useState('')
    const [frequency, setFrequency] = useState<Frequency>('monthly')
    const [customDays, setCustomDays] = useState('')
    const [lastServiced, setLastServiced] = useState('')
    const [linkedSopId, setLinkedSopId] = useState('')
    const [photoFile, setPhotoFile] = useState<File | null>(null)

    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
    const [sops, setSops] = useState<SopRecord[]>([])
    const [loaded, setLoaded] = useState(false)

    const loadMetadata = useCallback(async () => {
        if (loaded) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            const [
                { data: depts, error: deptsErr },
                { data: sopData, error: sopErr },
                { data: profile, error: profErr }
            ] = await Promise.all([
                supabase.from('departments').select('id, name').order('name'),
                supabase.from('sops').select('id, sop_number, title, dept_id, version, status').eq('status', 'active').order('sop_number'),
                supabase.from('profiles').select('dept_id').eq('id', user.id).single(),
            ])

            if (deptsErr) console.error('Error loading depts:', deptsErr)
            if (sopErr) console.error('Error loading sops:', sopErr)

            setDepartments(depts ?? [])
            setSops((sopData ?? []) as SopRecord[])
            if (profile?.dept_id) {
                setDeptId(profile.dept_id)
            } else if (depts && depts.length > 0) {
                setDeptId(depts[0].id)
            }
            setLoaded(true)
        } catch (err) {
            console.error('Failed to load modal metadata:', err)
        }
    }, [loaded, supabase])

    useEffect(() => {
        if (open) {
            loadMetadata()
        }
    }, [open, loadMetadata])

    const reset = () => {
        setAssetId(''); setName(''); setSerial(''); setModel('')
        setFrequency('monthly'); setCustomDays(''); setLastServiced('')
        setLinkedSopId(''); setPhotoFile(null); setLoaded(false)
    }

    const handleSubmit = async () => {
        if (!assetId.trim()) { toast.error('Asset ID is required'); return }
        if (!name.trim()) { toast.error('Asset Name is required'); return }
        if (!deptId) { toast.error('Department is required'); return }
        if (frequency === 'custom' && !customDays) { toast.error('Custom interval days is required'); return }

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            let photoUrl: string | null = null
            if (photoFile) {
                const photoPath = `${user.id}/${Date.now()}-${photoFile.name}`
                const { error: upErr } = await supabase.storage
                    .from('equipment-photos')
                    .upload(photoPath, photoFile)
                if (!upErr) {
                    const { data: urlData } = supabase.storage.from('equipment-photos').getPublicUrl(photoPath)
                    photoUrl = urlData.publicUrl
                }
            }

            const { error } = await supabase.from('equipment').insert({
                asset_id: assetId.trim(),
                name: name.trim(),
                dept_id: deptId,
                serial_number: serial || null,
                model: model || null,
                photo_url: photoUrl,
                linked_sop_id: linkedSopId || null,
                frequency,
                custom_interval_days: frequency === 'custom' ? parseInt(customDays) : null,
                last_serviced: lastServiced || null,
                submitted_by: user.id,
                status: 'pending_qa',
            })

            if (error) throw error

            toast.success('Equipment submitted for QA approval', {
                description: `${name} (${assetId}) is pending review.`,
            })
            reset()
            onSuccess()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            toast.error('Submission failed', { description: message })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary">Add Equipment</DialogTitle>
                    <DialogDescription>Register a new asset for QA review and PM scheduling.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="eq-asset-id">Asset ID *</Label>
                        <Input id="eq-asset-id" placeholder="e.g. EQ-0042" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="eq-name">Asset Name *</Label>
                        <Input id="eq-name" placeholder="e.g. Centrifuge 4500X" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Department *</Label>
                    <Select value={deptId} onValueChange={setDeptId}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="eq-serial">Serial Number</Label>
                        <Input id="eq-serial" placeholder="Optional" value={serial} onChange={(e) => setSerial(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="eq-model">Model</Label>
                        <Input id="eq-model" placeholder="Optional" value={model} onChange={(e) => setModel(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Linked SOP</Label>
                    <Select value={linkedSopId} onValueChange={setLinkedSopId}>
                        <SelectTrigger><SelectValue placeholder="Search SOPs (optional)" /></SelectTrigger>
                        <SelectContent>
                            {sops.map((s) => <SelectItem key={s.id} value={s.id}>{s.sop_number} — {s.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Maintenance Frequency *</Label>
                    <div className="flex gap-2 flex-wrap">
                        {FREQUENCIES.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFrequency(f)}
                                className={cn(
                                    'flex-1 min-w-[70px] rounded-lg border py-2 text-sm font-medium capitalize transition-all',
                                    frequency === f
                                        ? 'border-brand-teal bg-teal-50 text-brand-navy dark:bg-teal-900/30 dark:text-teal-400'
                                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    {frequency === 'custom' && (
                        <div className="flex items-center gap-2 mt-2">
                            <Input
                                type="number"
                                min={1}
                                placeholder="Interval (days)"
                                value={customDays}
                                onChange={(e) => setCustomDays(e.target.value)}
                                className="max-w-[180px]"
                            />
                            <span className="text-sm text-muted-foreground">days between services</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="eq-last-serviced">Last Service Date</Label>
                    <Input id="eq-last-serviced" type="date" value={lastServiced} onChange={(e) => setLastServiced(e.target.value)} />
                </div>

                {/* Photo upload */}
                <div className="space-y-1.5 pb-2">
                    <Label>Equipment Photo</Label>
                    <div
                        onClick={() => document.getElementById('eq-photo-input')?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 p-6 cursor-pointer hover:border-brand-teal/50 transition-colors"
                    >
                        <input
                            id="eq-photo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                        />
                        {photoFile ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-brand-navy font-medium dark:text-foreground">{photoFile.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setPhotoFile(null) }} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="h-6 w-6 text-muted-foreground/30" />
                                <p className="text-xs text-muted-foreground">Click to upload photo</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-brand-teal text-white hover:bg-teal-700 min-w-[120px]"
                    >
                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Submit for Review'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
