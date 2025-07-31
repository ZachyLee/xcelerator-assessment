import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { industry } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  // Debug logging for production
  console.log('Industry trends API called');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('Industry:', industry);

  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not set in environment variables');
    return NextResponse.json({ error: 'Groq API key not set.' }, { status: 500 });
  }

  if (!industry) {
    console.log('❌ Industry parameter missing');
    return NextResponse.json({ error: 'Industry is required.' }, { status: 400 });
  }

  const trendPrompt = `List the latest top 5 trends in the ${industry} industry. For each trend, provide a brief implication for businesses in this industry. Respond as a JSON array of objects with this format:\n[\n  { \"trend\": \"Trend name\", \"implication\": \"Brief implication for businesses\" }\n]`;

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
          { role: 'system', content: 'You are an industry analyst. Respond only with a JSON array of objects, each with a trend and its implication.' },
          { role: 'user', content: trendPrompt }
        ],
        max_tokens: 700,
        temperature: 0.7
      })
    });

    console.log('📡 Groq API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ Groq API error:', error);
      return NextResponse.json({ error: error.error?.message || 'Groq API error.' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    console.log('✅ Groq API response received, content length:', content.length);

    // Try to parse JSON array of objects
    try {
      const trends = JSON.parse(content);
      if (Array.isArray(trends) && trends[0]?.trend && trends[0]?.implication) {
        console.log('✅ Parsed trends successfully:', trends.length);
        return NextResponse.json({ trends });
      }
    } catch (parseError) {
      console.log('⚠️ JSON parse error:', parseError);
    }

    // Try to extract JSON array from string
    const match = content.match(/\[[\s\S]*?\]/);
    if (match) {
      try {
        const extracted = JSON.parse(match[0]);
        if (Array.isArray(extracted) && extracted[0]?.trend && extracted[0]?.implication) {
          console.log('✅ Extracted trends from string:', extracted.length);
          return NextResponse.json({ trends: extracted });
        }
      } catch (extractError) {
        console.log('⚠️ String extraction error:', extractError);
      }
    }

    // Fallback: return raw content as a single trend/implication
    console.log('⚠️ Using fallback response');
    return NextResponse.json({ trends: [{ trend: content, implication: '' }] });
  } catch (err) {
    console.log('❌ Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to generate AI trends.' }, { status: 500 });
  }
} 