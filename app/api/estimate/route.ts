import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert construction cost estimator for a New England general contracting company.
Analyze the provided project photo and description to generate a detailed, realistic cost estimate.

Return ONLY valid JSON with this exact structure:
{
  "summary": "Brief description of what you see and the scope of work",
  "confidence": 0.85,
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "description": "Item description",
          "unit": "sq ft",
          "qty": 100,
          "unit_price": 8.50,
          "category": "Category Name"
        }
      ]
    }
  ],
  "notes": "Any special considerations, assumptions, or warnings"
}

Guidelines:
- Use realistic New England market pricing (2025-2026)
- Include all materials, hardware, and consumables as separate line items
- Be specific with quantities and units (sq ft, ln ft, ea, hr, ton, bag, sheet, etc.)
- Confidence should reflect photo clarity and description completeness (0.5-0.98)
- Include 4-12 line items minimum for a thorough estimate
- Unit prices should be material cost only (labor is calculated separately)
- If exact field measurements are provided, use them as ground truth for all quantity calculations — do NOT override them with photo estimates
- When exact area is given, calculate material quantities directly from it (e.g. shingles = area × 1.1 waste factor / 100 sq)
- Reflect higher confidence (0.90-0.98) when exact measurements are provided`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image_base64, description, trade, region, media_type, measurements, measured_area, measured_perimeter } = body

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const userContent: Anthropic.MessageParam['content'] = []

    if (image_base64) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: (media_type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: image_base64,
        },
      })
    }

    const measurementLines: string[] = []
    if (measurements) {
      if (measurements.length) measurementLines.push(`  Length: ${measurements.length} ft`)
      if (measurements.width)  measurementLines.push(`  Width: ${measurements.width} ft`)
      if (measurements.height) measurementLines.push(`  Height: ${measurements.height} ft`)
      if (measurements.pitch)  measurementLines.push(`  Pitch/Slope: ${measurements.pitch}`)
    }
    if (measured_area)      measurementLines.push(`  Calculated Area: ${measured_area} sq ft`)
    if (measured_perimeter) measurementLines.push(`  Calculated Perimeter: ${measured_perimeter} ln ft`)

    const measurementBlock = measurementLines.length > 0
      ? `\nExact Field Measurements (LiDAR/tape — use these for precise quantities, do NOT estimate from photo):\n${measurementLines.join('\n')}\n`
      : ''

    userContent.push({
      type: 'text',
      text: `Trade: ${trade || 'general'}
Region: ${region || 'Boston, MA'}
Project Description: ${description || 'No additional description provided'}
${measurementBlock}
Please analyze this project and provide a detailed cost estimate for materials only.`,
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const estimateData = JSON.parse(jsonMatch[0])
    return NextResponse.json(estimateData)
  } catch (error: any) {
    console.error('Estimate API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate estimate' },
      { status: 500 }
    )
  }
}
