import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { deptName, activeSops, overdueSops, missedPms, activeNotices } = body

        // Construct the prompt
        const prompt = `
        You are an expert AI Operational Risk Analyst for an industrial company.
        Analyze the following real-time compliance metrics for the ${deptName} department.

        Metrics:
        - Total Active SOPs: ${activeSops}
        - SOPs Past Revision Date: ${overdueSops}
        - Missed / Overdue Maintenance (PMs): ${missedPms}
        - Unacknowledged Active Notices: ${activeNotices}

        Your task:
        1. Determine the overall Risk Level (strictly one of: "Low", "Medium", "High").
        2. Provide exactly 3 concise, actionable bullet points (max 15 words each) explaining the biggest risks or what to do next. Do not use markdown bolding in the bullet points.
        
        Return ONLY valid JSON with this exact schema:
        {
          "riskLevel": "Low" | "Medium" | "High",
          "insights": ["point 1", "point 2", "point 3"]
        }
        `

        if (!GEMINI_API_KEY) {
            // Mock response if no key is present in environment
            return NextResponse.json({
                riskLevel: missedPms > 0 || overdueSops > 2 ? 'High' : overdueSops > 0 ? 'Medium' : 'Low',
                insights: [
                    "Gemini API key is not configured.",
                    "Please add GEMINI_API_KEY to your .env.local file.",
                    "This is a fallback generated response."
                ]
            })
        }

        const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2, // Low temp for more deterministic, analytical responses
                }
            })
        })

        if (!res.ok) {
            throw new Error(`Gemini API error: ${res.statusText}`)
        }

        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Try to parse the markdown block wrapper if Gemini adds one like ```json
        let cleanText = text.trim()
        if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7)
        if (cleanText.startsWith('```')) cleanText = cleanText.substring(3)
        if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3)

        const parsed = JSON.parse(cleanText.trim())

        return NextResponse.json(parsed)

    } catch (err: any) {
        console.error('Risk Insights Error:', err)
        return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
    }
}
