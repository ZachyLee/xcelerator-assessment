import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect') || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Create a page that will redirect back to the original tab
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Email Confirmed</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
                        <h2>Email Confirmed! ✅</h2>
                <p>Your email has been successfully confirmed.</p>
                <p>Redirecting you to the dashboard...</p>
        <div style="margin-top: 20px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 5px; font-size: 12px;">
          <p style="margin: 0;">💡 <strong>If automatic redirect doesn't work:</strong> <a href="${redirectTo}" style="color: #60a5fa; text-decoration: underline;">Click here to go to dashboard</a></p>
        </div>
        
        <script>
          // Enhanced automatic redirect and tab closing
          setTimeout(() => {
            try {
              // Method 1: Try to redirect opener and close this tab
              if (window.opener && !window.opener.closed) {
                window.opener.location.href = '${redirectTo}';
                window.close();
              } else if (window.parent && window.parent !== window) {
                // Method 2: If in a frame, redirect parent
                window.parent.location.href = '${redirectTo}';
              } else {
                // Method 3: Fallback - redirect this tab
                window.location.href = '${redirectTo}';
              }
            } catch (e) {
              // Method 4: Final fallback - just redirect this tab
              console.log('Automatic redirect failed, using fallback');
              window.location.href = '${redirectTo}';
            }
          }, 1500); // 1.5 second delay to show confirmation message
        </script>
      </div>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
} 