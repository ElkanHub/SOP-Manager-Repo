import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
    const headersList = await headers()
    // Vercel injects x-forwarded-for with the actual client IP
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
    return NextResponse.json({ ip })
}
