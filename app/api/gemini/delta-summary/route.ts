import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const { changeControlId } = await req.json() as { changeControlId: string }

        const supabase = await createClient()

        // 1. Fetch the change control record
        const { data: cc, error: ccErr } = await supabase
            .from('change_controls')
            .select('id, old_file_url, new_file_url, sop_id')
            .eq('id', changeControlId)
            .single()

        if (ccErr || !cc) {
            return NextResponse.json({ error: 'Change control not found' }, { status: 404 })
        }

        // 2. Download both docx files
        const [oldResp, newResp] = await Promise.all([
            fetch(cc.old_file_url),
            fetch(cc.new_file_url),
        ])

        if (!oldResp.ok || !newResp.ok) {
            return NextResponse.json({ error: 'Failed to download document files' }, { status: 502 })
        }

        // 3. Convert to plain text using mammoth
        const mammoth = await import('mammoth')
        const [oldBuf, newBuf] = await Promise.all([
            oldResp.arrayBuffer(),
            newResp.arrayBuffer(),
        ])

        const [oldResult, newResult] = await Promise.all([
            mammoth.extractRawText({ arrayBuffer: oldBuf }),
            mammoth.extractRawText({ arrayBuffer: newBuf }),
        ])

        const oldText = oldResult.value.slice(0, 8000) // trim for token limits
        const newText = newResult.value.slice(0, 8000)

        // 4. Call Gemini API
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
        }

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a regulatory compliance analyst reviewing Standard Operating Procedure changes.

Compare these two versions of a Standard Operating Procedure and summarise in 3-5 bullet points what has substantively changed. Be specific. Focus on procedural changes, safety changes, and regulatory updates — not formatting changes.

Format your response as bullet points only, each starting with "•".

OLD VERSION:
${oldText}

NEW VERSION:
${newText}`
                        }]
                    }]
                }),
            }
        )

        if (!geminiRes.ok) {
            const errText = await geminiRes.text()
            return NextResponse.json({ error: `Gemini API error: ${errText}` }, { status: 502 })
        }

        const geminiData = await geminiRes.json() as {
            candidates: Array<{ content: { parts: Array<{ text: string }> } }>
        }
        const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

        // 5. Save to change_controls
        await supabase
            .from('change_controls')
            .update({ delta_summary: summary })
            .eq('id', changeControlId)

        return NextResponse.json({ summary })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
