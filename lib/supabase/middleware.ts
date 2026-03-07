import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export const updateSession = async (request: NextRequest) => {
    // Create an unmodified response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // protected routes logic
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup') || request.nextUrl.pathname.startsWith('/auth')
    const isMobileSignPage = request.nextUrl.pathname.startsWith('/m/')

    // 1. If not logged in, not on an auth page, and not on the mobile signed out page, redirect to login
    if (!user && !isAuthPage && !isMobileSignPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. If logged in, check profile for onboarding status
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single()

        const isOnboardingComplete = profile?.onboarding_complete === true
        const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')

        // 2a. Logged in, auth page -> redirect to dashboard (or onboarding if incomplete)
        if (isAuthPage) {
            const url = request.nextUrl.clone()
            url.pathname = isOnboardingComplete ? '/dashboard' : '/onboarding'
            return NextResponse.redirect(url)
        }

        // 2b. Logged in, not on auth page, onboarding INCOMPLETE, NOT on onboarding page -> redirect to onboarding
        if (!isOnboardingComplete && !isOnboardingPage && !isAuthPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }

        // 2c. Logged in, onboarding COMPLETE, trying to access onboarding -> redirect to dashboard
        if (isOnboardingComplete && isOnboardingPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return response
}
