# Village Management Platform (VMP)

A multi-tenant digital governance and community operations system for villages, subdivisions, and community associations.

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Supabase account and project
- Docker (optional)

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Setup (Alternative)

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Features Implemented

### Phase 1: Authentication System ✅

- **Login Page**: Modern, responsive design matching the design reference
- **Design Compliance**: Two-column layout with Village Manager branding
- **Form Validation**: React Hook Form with Zod validation
- **Error Handling**: User-friendly error messages
- **Route Protection**: Middleware-based authentication guards

### Current Status

- ✅ Project setup and configuration
- ✅ Authentication infrastructure
- ✅ Login page with design reference compliance
- ✅ Protected dashboard placeholder
- ✅ Route protection middleware
- 🚧 Multi-tenant functionality (planned)
- 🚧 Role-based navigation (planned)
- 🚧 Responsive sidebar/header layout (planned)

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/           # Authentication pages
│   ├── (protected)/
│   │   └── dashboard/       # Protected application pages
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── auth/               # Authentication components
│   └── layout/             # Layout components (future)
├── lib/
│   ├── supabase/           # Supabase client configuration
│   ├── config/             # Application configuration
│   ├── validations/        # Form validation schemas
│   └── utils/              # Utility functions
└── types/                  # TypeScript type definitions
```

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Forms**: React Hook Form + Zod
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Testing**: Jest, Playwright

## Design System

### Colors
- Primary: #22574A (Deep Forest Green)
- Secondary: #E8DCCA (Warm Beige)
- Accent: #D96E49 (Terracotta Orange)
- Background: #FCFBF9 (Off White)
- Text: #555555 (Charcoal Gray)

### Typography
- Body: Inter font family
- Headings: Poppins font family

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests

## Next Steps

1. Set up Supabase database with proper schema
2. Implement multi-tenant functionality
3. Add role-based navigation and sidebar
4. Implement responsive header and layout
5. Add comprehensive testing

## Contributing

This project follows the VMP Constitution principles:
- Multi-tenant architecture with data isolation
- Role-based access control
- Modern, responsive design
- TypeScript for type safety
- Comprehensive testing"# village-tech" 
