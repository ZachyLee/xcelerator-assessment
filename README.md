# Xcelerator Readiness & ROI Assessment

A modern web application built with Next.js, TypeScript, and Supabase for manufacturing clients and consultants to assess Industry 4.0 digital readiness and calculate ROI potential.

## Features

### 🔐 Authentication
- Email/password authentication with Supabase Auth
- Secure session management
- User registration and login

### 📊 Assessments
- **C-Level Management Assessment**: 12 questions covering leadership awareness, strategy, and organizational readiness
- **Shopfloor Operators Assessment**: 12 questions covering operational readiness and digital literacy
- Likert scale (1-5) scoring system
- Real-time progress tracking
- Automatic readiness level calculation
- **AI-Powered Best-in-Class Examples**: Get contextual examples of industry best practices for each question using Groq AI

### 📈 Results & Analytics
- Immediate score calculation and readiness level display
- Historical assessment tracking
- Visual progress indicators
- Readiness level categorization (Beginner, Developing, Advanced, Leader)

### 🎨 Modern UI/UX
- Clean, responsive design with Tailwind CSS
- Interactive Likert scale components
- Progress bars and visual feedback
- Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI Integration**: Groq API for best-in-class examples
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xcelerator-assessment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Set up the database**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL to create the necessary tables and policies

5. **Set up Groq API (for best-in-class examples)**
   - Sign up for a free account at [groq.com](https://groq.com)
   - Get your API key from the dashboard
   - Add it to your `.env.local` file as `GROQ_API_KEY`

6. **Configure Email Confirmation (Required for Production)**
   - For production deployment, set up email confirmation redirects:
   - Add `NEXT_PUBLIC_SITE_URL=https://xcelerator-assessment.vercel.app` to your Vercel environment variables
   - Update Supabase Auth Provider Redirect URLs in your Supabase dashboard:
     - Go to Authentication → URL Configuration
     - Add: `https://xcelerator-assessment.vercel.app/auth/callback`
   - This ensures email confirmation redirects work properly in production

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
xcelerator-assessment/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── best-in-class-example/ # AI example generation
│   │   ├── assessment/         # Assessment routes
│   │   │   ├── c-level/       # C-Level assessment
│   │   │   └── shopfloor/     # Shopfloor assessment
│   │   ├── dashboard/         # Dashboard route
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page with auth
│   ├── components/            # Reusable components
│   │   ├── AuthForm.tsx       # Authentication form
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── AssessmentForm.tsx # Assessment form
│   │   └── LikertScale.tsx    # Likert scale component with AI examples
│   ├── data/                  # Static data
│   │   └── assessments.ts     # Assessment questions
│   └── lib/                   # Utilities
│       └── supabase.ts        # Supabase client
├── supabase-schema.sql        # Database schema
└── README.md                  # This file
```

## Assessment Questions

### C-Level Management Assessment
1. Our company has a clear digital transformation roadmap
2. Our leadership team understands emerging technologies (e.g., IoT, AI, data analytics)
3. We see digitalization as a long-term competitive advantage
4. We have successfully piloted new digital solutions before scaling
5. We have budget allocated specifically for digitalization initiatives
6. We have KPIs in place to measure the impact of digital investments
7. Our investment decisions consider ROI and long-term impact equally
8. We have vertical integration between IT and Operation Technology (OT) systems
9. We have strong data governance and cybersecurity policies
10. We have a dedicated team or champion for digital transformation
11. Employees are encouraged to develop new digital skills
12. We are willing to change legacy processes that hold us back
13. We are prepared to invest in culture change and training programs
14. We involve operators and mid-level managers in planning digital initiatives
15. Our supply chain partners are aligned with our digital goals

### Shopfloor Operators Assessment
1. How familiar are your operators with digital tools and technologies?
2. What is the current state of your production line automation?
3. How well do your operators understand Industry 4.0 concepts?
4. What is your current level of real-time data visibility on the shop floor?
5. How mature is your predictive maintenance program?
6. What is your current level of digital work instructions and training?
7. How well integrated are your quality control systems?
8. What is your current level of mobile device usage on the shop floor?
9. How mature is your energy management and sustainability tracking?
10. What is your current level of cross-functional collaboration on digital initiatives?
11. How well do you track and measure operator performance digitally?
12. What is your shop floor's overall readiness for Industry 4.0 implementation?

## Scoring System

- **C-Level Assessment**: 12-60 points (1-5 per question)
- **Shopfloor Assessment**: 12-60 points (1-5 per question)
- **Readiness Levels**:
  - **Beginner** (12-24): Basic understanding, needs foundational work
  - **Developing** (25-36): Growing awareness, some initiatives in place
  - **Advanced** (37-48): Strong foundation, actively implementing
  - **Leader** (49-60): Industry leader, driving innovation

## AI-Powered Features

### Best-in-Class Examples
- **Contextual Examples**: Get AI-generated examples of industry best practices for each assessment question
- **Real-time Generation**: Examples are generated on-demand using Groq's fast LLM API
- **Copy to Clipboard**: Easy copying of examples for reference or documentation
- **Auto-reset**: Example boxes automatically clear when navigating between questions
- **Loading States**: Visual feedback during example generation

## Database Schema

### Tables

1. **assessment_responses**
   - Stores individual question responses
   - Links to user and assessment type
   - Includes question ID and answer value

2. **assessment_scores**
   - Stores overall assessment results
   - Includes total score and readiness level
   - Tracks completion timestamp

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Secure authentication with Supabase Auth

## Deployment

### Vercel (Recommended)

1. **Connect your repository**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Configure environment variables**
   - Add your Supabase environment variables in Vercel dashboard

3. **Deploy**
   - Vercel will automatically deploy on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@xcelerator-assessment.com or create an issue in the repository.

## Roadmap

- [x] AI-powered best-in-class examples
- [x] Auto-reset example boxes between questions
- [ ] ROI calculation features
- [ ] Custom assessment creation
- [ ] Advanced analytics dashboard
- [ ] Export functionality
- [ ] Multi-language support
- [ ] API endpoints for external integrations
- [ ] Mobile app version
