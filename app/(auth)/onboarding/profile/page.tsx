'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UploadCloud, UserCircle2, ArrowRight } from 'lucide-react'

export default function OnboardingProfile() {
    const [jobTitle, setJobTitle] = useState('')
    const [employeeId, setEmployeeId] = useState('')
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)

        } catch (error) {
            console.error('Error uploading avatar:', error)
            alert('Error uploading avatar. Did you create the public "avatars" bucket?')
        } finally {
            setUploading(false)
        }
    }

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const updates: any = {}
            if (jobTitle) updates.job_title = jobTitle
            if (employeeId) updates.employee_id = employeeId
            if (avatarUrl) updates.avatar_url = avatarUrl

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id)

                if (error) throw error
            }

            router.push('/onboarding/signature')
        } catch (err) {
            console.error(err)
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-h2 font-bold text-brand-navy">Profile Details</h2>
                <p className="text-slate-500">
                    Almost done. Add your specific job details and an optional photo.
                </p>
            </div>

            <form onSubmit={handleNext} className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4 py-4 sm:flex-row sm:items-start sm:gap-6">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
                        ) : (
                            <UserCircle2 className="h-10 w-10 text-slate-400" />
                        )}
                    </div>

                    <div className="space-y-2 text-center sm:text-left">
                        <h3 className="font-semibold text-brand-navy">Profile Picture</h3>
                        <p className="text-sm text-slate-500 max-w-xs">
                            Upload a recognizable photo. It will appear on your digital signatures.
                        </p>
                        <div className="pt-2">
                            <Label
                                htmlFor="avatar-upload"
                                className="inline-flex cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-navy shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Upload Photo
                            </Label>
                            <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title (Optional)</Label>
                        <Input
                            id="jobTitle"
                            placeholder="e.g. Senior Quality Specialist"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID (Optional)</Label>
                        <Input
                            id="employeeId"
                            placeholder="e.g. EMP-12345"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push('/onboarding/role')}
                        disabled={saving || uploading}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving || uploading}
                        className="bg-brand-navy hover:bg-slate-800 text-white min-w-[140px]"
                    >
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
