import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('AI recommendations API called')
  
  let body
  try {
    body = await req.json()
    console.log('Request body received:', {
      hasBody: !!body,
      bodyKeys: body ? Object.keys(body) : 'No body',
      bodyType: typeof body
    })
  } catch (error) {
    console.error('Error parsing request body:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not set.' }, { status: 500 })
  }

  // --- Trends Feature ---
  if (body.prompt && body.industry) {
    // Compose a prompt for the LLM
    const trendPrompt = `List the latest top 5 trends in the ${body.industry} industry. Respond as a JSON array of strings.`
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'You are an industry analyst. Respond only with a JSON array of the latest top 5 trends.' },
            { role: 'user', content: trendPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const error = await response.json()
        return NextResponse.json({ error: error.error?.message || 'Groq API error.' }, { status: 500 })
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content?.trim() || ''

      // Try to parse JSON array
      try {
        const trends = JSON.parse(content)
        if (Array.isArray(trends)) {
          return NextResponse.json({ trends })
        }
      } catch {}

      // Try to extract JSON array from string
      const match = content.match(/\[[\s\S]*?\]/)
      if (match) {
        try {
          const extracted = JSON.parse(match[0])
          if (Array.isArray(extracted)) {
            return NextResponse.json({ trends: extracted })
          }
        } catch {}
      }

      // Fallback: return raw content as a single trend
      return NextResponse.json({ trends: [content] })
    } catch (err) {
      return NextResponse.json({ error: 'Failed to generate AI trends.' }, { status: 500 })
    }
  }

  // --- Existing Recommendations Logic ---
  const { answers, assessmentType, readinessLevel } = body

  // Debug: Log the received data
  console.log('AI recommendations API received:', {
    answers: answers ? 'Present' : 'Missing',
    assessmentType: assessmentType || 'Missing',
    readinessLevel: readinessLevel || 'Missing',
    bodyKeys: Object.keys(body)
  })

  if (!answers || !assessmentType || !readinessLevel) {
    return NextResponse.json({ 
      error: 'Missing required data.',
      received: {
        answers: !!answers,
        assessmentType: !!assessmentType,
        readinessLevel: !!readinessLevel
      }
    }, { status: 400 })
  }

  // Analyze answers to find lowest scoring areas
  const questionScores = Object.entries(answers).map(([questionId, score]) => ({
    questionId: parseInt(questionId),
    score: score as number
  }))

  // Sort by score to find lowest scoring areas
  const sortedScores = questionScores.sort((a, b) => a.score - b.score)
  const lowestScoringAreas = sortedScores.slice(0, 3) // Top 3 lowest scores

  // Get question details for context
  const { cLevelQuestions, shopfloorQuestions } = await import('@/data/assessments')
  const questions = assessmentType === 'c_level' ? cLevelQuestions : shopfloorQuestions

  const lowestScoringDetails = lowestScoringAreas.map(item => {
    const question = questions.find(q => q.id === item.questionId)
    return {
      question: question?.question || `Question ${item.questionId}`,
      category: question?.category || 'Unknown',
      score: item.score
    }
  })

  const prompt = `You are an expert digital transformation consultant specializing in Industry 4.0 and manufacturing optimization.

Based on the following assessment results, provide 5-7 customized, actionable recommendations to improve the organization's digital readiness:

ASSESSMENT CONTEXT:
- Assessment Type: ${assessmentType === 'c_level' ? 'C-Level Management' : 'Shopfloor Operators'}
- Current Readiness Level: ${readinessLevel}

LOWEST SCORING AREAS (need immediate attention):
${lowestScoringDetails.map((area, index) => 
  `${index + 1}. ${area.question} (Category: ${area.category}) - Score: ${area.score}/5`
).join('\n')}

Please provide:
1. 5-7 specific, actionable recommendations tailored to address these lowest scoring areas
2. Each recommendation should be practical and achievable
3. Focus on quick wins and foundational improvements
4. Consider the current readiness level when suggesting complexity
5. Include estimated timeline and priority level for each recommendation
6. Keep descriptions concise and action-oriented (2-3 sentences max)

Format your response as a JSON object with this structure:
{
  "recommendations": [
    {
      "title": "Short, actionable title (3-5 words)",
      "description": "Concise, action-oriented explanation (2-3 sentences max)",
      "priority": "High/Medium/Low",
      "timeline": "1-3 months/3-6 months/6+ months",
      "impact": "Brief expected impact (1 sentence)"
    }
  ]
}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are an expert digital transformation consultant. Provide practical, actionable recommendations in JSON format.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error?.message || 'Groq API error.' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim() || ''
    
    // Try to parse JSON response
    try {
      const recommendations = JSON.parse(content)
      return NextResponse.json({ recommendations: recommendations.recommendations || [] })
    } catch (parseError) {
      // Try to extract JSON from inside a string (if the model returned a JSON string inside the description)
      const match = content.match(/\{[\s\S]*?\}/)
      if (match) {
        try {
          const extracted = JSON.parse(match[0])
          if (extracted.recommendations) {
            return NextResponse.json({ recommendations: extracted.recommendations })
          }
        } catch {}
      }
      // If JSON parsing fails, return the raw content
      return NextResponse.json({ 
        recommendations: [{
          title: "AI Analysis Complete",
          description: content,
          priority: "High",
          timeline: "Immediate",
          impact: "Customized recommendations based on your assessment"
        }]
      })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate AI recommendations.' }, { status: 500 })
  }
} 