import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  console.log('🧪 Test Groq API called');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key starts with gsk_:', apiKey?.startsWith('gsk_') || false);

  if (!apiKey) {
    return NextResponse.json({ 
      error: 'GROQ_API_KEY not set',
      status: 'FAILED'
    }, { status: 500 });
  }

  try {
    console.log('🔄 Testing Groq API connection...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'user', content: 'Say "Hello World" in one word.' }
        ],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    console.log('📡 Groq API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ Groq API error:', error);
      return NextResponse.json({ 
        error: error.error?.message || 'Groq API error',
        status: 'FAILED',
        details: error
      }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log('✅ Groq API test successful:', content);
    
    return NextResponse.json({ 
      message: 'Groq API is working!',
      response: content,
      status: 'SUCCESS'
    });

  } catch (err) {
    console.log('❌ Unexpected error:', err);
    return NextResponse.json({ 
      error: 'Failed to test Groq API',
      status: 'FAILED',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
} 