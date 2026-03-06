'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (error) throw error

            // On successful signup, redirect to the onboarding flow
            router.push('/onboarding')
        } catch (err: any) {
            setError(err.message || 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center bg-slate-50 p-6 md:p-10">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <div className="mb-8 flex flex-col items-center gap-2 text-center">
                    <div className="mb-2 flex items-center justify-center rounded-full bg-brand-navy p-3 text-brand-teal">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-navy">Create your account</h1>
                    <p className="text-sm text-slate-500">
                        Join your team on SOP-Guard Pro
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-100 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className={error ? 'border-red-500 ring-red-200' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={error ? 'border-red-500 ring-red-200' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className={error ? 'border-red-500 ring-red-200' : ''}
                        />
                        <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-brand-teal hover:bg-teal-700 text-white font-semibold h-11"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-brand-blue font-medium hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
