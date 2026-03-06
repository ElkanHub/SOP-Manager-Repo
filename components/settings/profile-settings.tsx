'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SignaturePad } from '@/components/settings/signature-pad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, User, Briefcase, Hash, Phone, FileSignature } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export function ProfileSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isRedrawingSig, setIsRedrawingSig] = useState(false)

    // Profile State
    const [profile, setProfile] = useState({
        full_name: '',
        job_title: '',
        employee_id: '',
        phone: '',
        signature_url: '',
    })

    const supabase = createClient()

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('profiles')
                .select('full_name, job_title, employee_id, phone, signature_url')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    job_title: data.job_title || '',
                    employee_id: data.employee_id || '',
                    phone: data.phone || '',
                    signature_url: data.signature_url || '',
                })
            }
            setLoading(false)
        }
        loadProfile()
    }, [supabase])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    job_title: profile.job_title,
                    employee_id: profile.employee_id,
                    phone: profile.phone
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success('Profile updated successfully.')
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || 'Failed to update profile.')
        } finally {
            setSaving(false)
        }
    }

    const handleSignatureSaved = (newUrl: string) => {
        setProfile(prev => ({ ...prev, signature_url: newUrl }))
        setIsRedrawingSig(false)
        toast.success("New signature saved successfully.")
    }

    if (loading) return (
        <div className="flex h-64 items-center justify-center bg-card rounded-xl border border-border">
            <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
        </div>
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Identity Form */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="border-b border-border bg-muted/50 px-6 py-4">
                    <h2 className="text-lg font-bold text-foreground">Personal Details</h2>
                    <p className="text-sm text-muted-foreground">Update your identity information.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> Full Name
                            </Label>
                            <Input
                                id="full_name"
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="job_title" className="text-slate-500 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Job Title
                            </Label>
                            <Input
                                id="job_title"
                                value={profile.job_title}
                                onChange={e => setProfile({ ...profile, job_title: e.target.value })}
                                placeholder="e.g. Quality Technician"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employee_id" className="text-slate-500 flex items-center gap-2">
                                <Hash className="h-4 w-4" /> Employee ID
                            </Label>
                            <Input
                                id="employee_id"
                                value={profile.employee_id}
                                onChange={e => setProfile({ ...profile, employee_id: e.target.value })}
                                placeholder="e.g. EMP-0102"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-500 flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                        <Button type="submit" disabled={saving} className="bg-brand-navy hover:bg-brand-navy/90 text-white min-w-[120px]">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>

            {/* Signature Management */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">E-Signature</h2>
                        <p className="text-sm text-muted-foreground">Manage your legally binding signature.</p>
                    </div>
                    {!isRedrawingSig && (
                        <Button variant="outline" size="sm" onClick={() => setIsRedrawingSig(true)} className="border-brand-teal text-brand-teal hover:bg-teal-50">
                            Re-draw Signature
                        </Button>
                    )}
                </div>

                <div className="p-6 bg-muted/30">
                    {isRedrawingSig ? (
                        <div className="max-w-xl mx-auto">
                            <SignaturePad
                                onSave={handleSignatureSaved}
                                onCancel={() => setIsRedrawingSig(false)}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-card max-w-xl mx-auto">
                            {profile.signature_url ? (
                                <div className="space-y-4 w-full text-center">
                                    <div className="relative h-24 w-full mix-blend-multiply opacity-80">
                                        <Image
                                            src={profile.signature_url}
                                            alt="Current Signature"
                                            fill
                                            className="object-contain"
                                            unoptimized // necessary for supabase storage URLs to avoid complex next/image config
                                        />
                                    </div>
                                    <p className="text-xs font-mono text-slate-400 block pb-2 border-b border-slate-100">Verified identity bound to your account</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FileSignature className="h-5 w-5 text-muted-foreground/70" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">No signature found</p>
                                    <p className="text-xs text-muted-foreground mt-1">You need to draw a signature to approve documents.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
