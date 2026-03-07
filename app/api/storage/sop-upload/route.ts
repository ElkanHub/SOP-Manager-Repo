import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple in-memory rate limiter (Token Bucket)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>()
const MAX_UPLOADS = 5
const WINDOW_MS = 60 * 1000 // 1 minute

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()

    if (authErr || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const now = Date.now()
    const limit = rateLimitMap.get(ip)

    if (limit && now < limit.resetAt) {
        if (limit.count >= MAX_UPLOADS) {
            return NextResponse.json({ error: 'Too many uploads. Please wait a minute.' }, { status: 429 })
        }
        limit.count++
    } else {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    }

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate MIME type
        const validMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        if (file.type !== validMimeType && !file.name.endsWith('.docx')) {
            // checking both type and extension just in case formData drops type, but enforcing docx
            return NextResponse.json({ error: 'Invalid file type. Only .docx files are allowed' }, { status: 400 })
        }

        // Validate size (25MB)
        const MAX_SIZE = 25 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 25MB' }, { status: 413 })
        }

        const fileBuffer = await file.arrayBuffer()
        const crypto = await import('crypto')
        const fileId = crypto.randomUUID()
        const filePath = `${user.id}/${fileId}.docx`

        const { error: uploadErr } = await supabase.storage
            .from('sop-uploads')
            .upload(filePath, fileBuffer, {
                contentType: validMimeType,
                upsert: false
            })

        if (uploadErr) throw uploadErr

        return NextResponse.json({ filePath })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
