'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            toast.error('Login Failed', {
                description: 'Invalid credentials.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh w-full lg:grid lg:grid-cols-2 bg-background">
            {/* Left Panel: Branding */}
            <div className="hidden bg-brand-navy lg:block">
                <div className="flex h-full flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-brand-teal" />
                        <span className="text-xl font-bold">SOP-Guard Pro</span>
                    </div>

                    <div className="max-w-md space-y-6">
                        <h1 className="text-display font-bold leading-tight">
                            SOP-Guard Pro
                        </h1>
                        <p className="text-lg text-slate-300">
                            The compliance platform that never misses.
                        </p>
                        <div className="space-y-4 pt-4 text-slate-200">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-brand-teal" />
                                <span>Zero unapproved changes hit the floor</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-brand-teal" />
                                <span>Multi-signature QA consensus workflows</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-brand-teal" />
                                <span>Automated preventive maintenance tracking</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-slate-400 dark:text-slate-500">
                        © {new Date().getFullYear()} SOP-Guard Pro. Enterprise Edition.
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="flex flex-col items-center justify-center bg-muted/30 p-6 md:p-10">
                <div className="w-full max-w-[420px] rounded-lg bg-card border border-border p-8 shadow-md">
                    <div className="mb-8 flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="text-sm text-brand-blue hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-brand-teal hover:bg-teal-700 text-white font-semibold h-11"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-brand-blue font-medium hover:underline dark:text-blue-400">
                            Create your account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
