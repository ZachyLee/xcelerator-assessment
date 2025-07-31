# Setup Guide

## Quick Start

Follow these steps to get the Xcelerator Assessment app running locally:

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lhvuahsyrrafcdvuzorp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration (for future enhancements)
# OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Create a new project
   - Wait for the project to be ready

2. **Get Your API Keys**
   - In your Supabase dashboard, go to Settings > API
   - Copy the "Project URL" and "anon public" key
   - Add them to your `.env.local` file

3. **Set Up the Database**
   - In your Supabase dashboard, go to SQL Editor
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and execute the SQL
   - This creates the necessary tables and security policies

### 3. Run the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 4. Test the Application

1. **Register a new account**
   - Click "Sign up" on the login page
   - Enter your email and password
   - Check your email for the confirmation link

2. **Take an assessment**
   - Choose either C-Level or Shopfloor assessment
   - Answer all 12 questions using the Likert scale
   - View your results and readiness level

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your Supabase URL and anon key in `.env.local`
   - Make sure there are no extra spaces or characters

2. **Database connection errors**
   - Verify your Supabase project is active
   - Check that you've run the SQL schema
   - Ensure Row Level Security is enabled

3. **Authentication not working**
   - Check that email confirmation is enabled in Supabase Auth settings
   - Verify your email and try the confirmation link again

4. **Assessment not saving**
   - Check the browser console for errors
   - Verify the database tables were created correctly
   - Ensure you're logged in

### Getting Help

- Check the browser console for error messages
- Verify all environment variables are set correctly
- Ensure the Supabase schema has been executed
- Check that your Supabase project is in the same region as your deployment

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your service role key secure
- Use Row Level Security (already configured in the schema)
- Regularly update dependencies for security patches 