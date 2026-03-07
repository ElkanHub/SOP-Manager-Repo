import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()

    if (authErr || !user || !user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { changeControlId, password, signatureUrl } = await req.json()
        if (!password) {
            return NextResponse.json({ error: 'Password is required to sign.' }, { status: 400 })
        }

        // 1. Verify password (re-authenticate) to prevent CSRF / session hijacking for signatures
        const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: user.email,
            password
        })
        if (signInErr) {
            return NextResponse.json({ error: 'Invalid password. Cannot verify identity.' }, { status: 401 })
        }

        // 2. Fetch the SOP file URL to generate a cryptographic hash
        const { data: cc } = await supabase
            .from('change_controls')
            .select('new_file_url')
            .eq('id', changeControlId)
            .single()

        let documentHash = 'none'
        if (cc?.new_file_url) {
            let path = cc.new_file_url
            if (path.includes('http')) {
                const parts = new URL(path).pathname.split('/sop-uploads/')
                if (parts.length > 1) path = parts[1]
            }
            const { data: fileBlob } = await supabase.storage.from('sop-uploads').download(path)
            if (fileBlob) {
                const buffer = await fileBlob.arrayBuffer()
                documentHash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex')
            }
        }

        // 3. Get IP Address
        const ip = req.headers.get('x-forwarded-for') || 'unknown'

        // 4. Insert signature via the authenticated client (RLS enforces user_id matching)
        const { error: insertErr } = await supabase
            .from('signature_certificates')
            .insert({
                change_control_id: changeControlId,
                user_id: user.id,
                signature_url: signatureUrl,
                document_hash: documentHash,
                ip_address: ip
            })

        if (insertErr) {
            // Check for uniqueness constraint violation (already signed)
            if (insertErr.code === '23505') {
                return NextResponse.json({ error: 'You have already signed this document.' }, { status: 400 })
            }
            throw insertErr
        }

        return NextResponse.json({ success: true, documentHash })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Signature failed due to a server error' }, { status: 500 })
    }
}
