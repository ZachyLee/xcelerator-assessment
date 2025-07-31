import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { question } = await req.json()
  const apiKey = process.env.GROQ_API_KEY

  // Debug logging for production
  console.log('Best-in-class example API called');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('Question:', question);

  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not set in environment variables');
    return NextResponse.json({ error: 'Groq API key not set.' }, { status: 500 })
  }

  if (!question) {
    console.log('❌ Question parameter missing');
    return NextResponse.json({ error: 'Missing question.' }, { status: 400 })
  }

  const prompt = `You are an expert in digital transformation for C-level executives. For the following assessment question, provide a concise (1-2 sentences), practical, and relevant example of what "best-in-class" looks like for a leading organization.

Question: ${question}

Best-in-class example:`

  try {
    console.log('🔄 Making request to Groq API...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are an expert in digital transformation for C-level executives.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120,
        temperature: 0.7
      })
    })

    console.log('📡 Groq API response status:', response.status);

    if (!response.ok) {
      const error = await response.json()
      console.log('❌ Groq API error:', error);
      return NextResponse.json({ error: error.error?.message || 'Groq API error.' }, { status: 500 })
    }

    const data = await response.json()
    const example = data.choices?.[0]?.message?.content?.trim() || ''
    console.log('✅ Groq API response received, example length:', example.length);
    return NextResponse.json({ example })
  } catch (err) {
    console.log('❌ Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Groq.' }, { status: 500 })
  }
} 