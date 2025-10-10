# Implementation Plan: Login Page and Post-Login Layout

**Branch**: `001-login-and-layout` | **Date**: 2025-10-09 | **Spec**: [001-login-and-layout.md](.specify/specs/001-login-and-layout.md)
**Input**: Feature specification for Login Page and Post-Login Layout with role-based navigation

## Summary

Implement a secure, multi-tenant authentication system with role-based layout for the Village Management Platform. The solution includes a modern login page with Supabase authentication, tenant detection via subdomain, and a responsive post-login layout featuring dynamic sidebar navigation based on user roles. The implementation follows Next.js 14+ App Router architecture with TypeScript, TailwindCSS, and Docker containerization.

## Technical Context

**Language/Version**: TypeScript 5+ with Next.js 14+ (App Router)
**Primary Dependencies**: React 18+, Supabase Auth, React Hook Form, Zod, TailwindCSS, lucide-react
**Storage**: Supabase (PostgreSQL) with Row Level Security for multi-tenancy
**Testing**: Jest/Vitest for unit tests, Playwright for E2E testing
**Target Platform**: Web application (responsive: mobile, tablet, desktop)
**Project Type**: Web application with server-side rendering and client-side interactivity
**Performance Goals**: <2s login page load, <1s dashboard transition, <100ms navigation response
**Constraints**: Multi-tenant data isolation, role-based access control, mobile-first responsive design
**Scale/Scope**: Multiple villages (tenants), 8 user roles, extensible navigation system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Technology Stack Compliance**
- Next.js 14+ App Router: ✅ Required
- TypeScript: ✅ Required
- Supabase Backend: ✅ Required
- TailwindCSS: ✅ Required
- React Hook Form: ✅ Required

✅ **Multi-Tenancy Requirements**
- Tenant isolation: ✅ Implemented via subdomain detection
- Data separation: ✅ Enforced through Supabase RLS

✅ **Security Standards**
- Role-based access control: ✅ 8 defined roles with navigation mapping
- Input validation: ✅ Zod schemas for form validation
- Route protection: ✅ Next.js middleware implementation

✅ **Design System Compliance**
- Color palette: ✅ VMP defined colors (#22574A, #E8DCCA, #D96E49, #FCFBF9, #555555)
- Typography: ✅ Inter (body), Poppins (headings)
- Responsive design: ✅ Mobile-first approach

## Project Structure

### Documentation (this feature)

```
.specify/specs/001-login-and-layout/
├── 001-login-and-layout.md      # Feature specification
├── 001-login-and-layout-plan.md # This implementation plan
├── research.md                  # Phase 0: Technology research and setup
├── data-model.md               # Phase 1: Database schema and auth flow
├── quickstart.md               # Phase 1: Development setup guide
├── contracts/                  # Phase 1: API contracts and interfaces
│   ├── auth-api.md
│   ├── user-session.md
│   └── navigation-config.md
└── tasks.md                    # Phase 2: Detailed implementation tasks
```

### Source Code (repository root)

```
src/
├── app/
│   ├── (auth)/                 # Authentication routes group
│   │   ├── login/
│   │   │   ├── page.tsx        # Login page component
│   │   │   └── loading.tsx     # Login loading state
│   │   └── layout.tsx          # Auth layout (minimal, centered)
│   │
│   ├── (protected)/            # Protected routes group
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Dashboard "Coming Soon" page
│   │   │   └── loading.tsx     # Dashboard loading state
│   │   └── layout.tsx          # Protected layout (Sidebar + Header)
│   │
│   ├── layout.tsx              # Root layout with providers
│   ├── globals.css             # TailwindCSS base styles + custom CSS
│   ├── loading.tsx             # Global loading component
│   ├── error.tsx               # Global error boundary
│   └── not-found.tsx           # 404 page
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx       # Login form with validation
│   │   ├── TenantSelector.tsx  # Tenant selection dropdown
│   │   └── AuthProvider.tsx    # Authentication context provider
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx         # Dynamic sidebar with role-based nav
│   │   ├── Header.tsx          # Header with user menu and notifications
│   │   ├── UserMenu.tsx        # User avatar dropdown component
│   │   ├── MobileNavigation.tsx # Mobile hamburger menu
│   │   └── LayoutProvider.tsx  # Layout state management
│   │
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx          # Button variants and states
│   │   ├── Input.tsx           # Form input with validation styling
│   │   ├── Card.tsx            # Card container component
│   │   ├── Toast.tsx           # Toast notification system
│   │   ├── Avatar.tsx          # User avatar component
│   │   ├── Badge.tsx           # Status and role badges
│   │   ├── Spinner.tsx         # Loading spinner component
│   │   └── Modal.tsx           # Modal dialog component
│   │
│   └── forms/
│       ├── FormField.tsx       # Form field wrapper with validation
│       ├── FormError.tsx       # Error message display
│       └── FormProvider.tsx    # Form context and validation
│
├── hooks/
│   ├── useAuth.tsx             # Authentication state and methods
│   ├── useUser.tsx             # User profile and role data
│   ├── useTenant.tsx           # Tenant context and detection
│   ├── useNavigation.tsx       # Navigation state and role filtering
│   └── useLocalStorage.tsx     # Client-side storage utilities
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase client configuration
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── database.ts         # Database query helpers
│   │   └── types.ts            # Generated Supabase types
│   │
│   ├── validations/
│   │   ├── auth.ts             # Login/signup validation schemas
│   │   ├── user.ts             # User profile validation
│   │   └── common.ts           # Shared validation utilities
│   │
│   ├── config/
│   │   ├── navigation.ts       # Role-based navigation configuration
│   │   ├── roles.ts            # User role definitions and permissions
│   │   ├── tenants.ts          # Tenant configuration
│   │   └── app.ts              # Application constants
│   │
│   └── utils/
│       ├── cn.ts               # Tailwind class name utility
│       ├── format.ts           # String and date formatting
│       ├── permissions.ts      # Role permission checking
│       └── tenant.ts           # Tenant detection and utilities
│
├── middleware.ts               # Route protection and authentication
├── types/
│   ├── auth.ts                 # Authentication type definitions
│   ├── user.ts                 # User and role type definitions
│   ├── navigation.ts           # Navigation and menu type definitions
│   └── global.ts               # Global type definitions
│
└── styles/
    ├── globals.css             # Global styles and Tailwind imports
    └── components.css          # Component-specific styles

tests/
├── __mocks__/                  # Test mocks and fixtures
│   ├── supabase.ts
│   └── next-router.ts
│
├── components/                 # Component unit tests
│   ├── auth/
│   ├── layout/
│   └── ui/
│
├── hooks/                      # Hook unit tests
├── lib/                        # Utility function tests
├── integration/                # Integration tests
│   ├── auth-flow.test.ts
│   ├── navigation.test.ts
│   └── layout.test.ts
│
└── e2e/                        # End-to-end tests
    ├── login.spec.ts
    ├── dashboard.spec.ts
    └── navigation.spec.ts

config/
├── tailwind.config.ts          # TailwindCSS configuration with VMP theme
├── next.config.mjs             # Next.js configuration
├── jest.config.js              # Jest testing configuration
├── playwright.config.ts        # Playwright E2E configuration
├── eslint.config.js            # ESLint configuration
├── prettier.config.js          # Prettier configuration
└── tsconfig.json               # TypeScript configuration

docker/
├── Dockerfile                  # Production Docker image
├── Dockerfile.dev              # Development Docker image
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
└── .dockerignore               # Docker ignore patterns
```

**Structure Decision**: Selected web application structure optimized for Next.js 14+ App Router with clear separation of concerns. The `(auth)` and `(protected)` route groups enable different layouts for authentication and protected areas. Component organization follows atomic design principles with separation of business logic (hooks), data access (lib), and presentation (components).

## Implementation Phases

### Phase 0: Research and Foundation Setup
**Duration**: 1-2 days
**Deliverable**: `research.md`

**Tasks**:
1. **Environment Setup**
   - Initialize Next.js 14+ project with TypeScript
   - Configure TailwindCSS with VMP color palette and typography
   - Set up ESLint, Prettier, and pre-commit hooks
   - Create Docker development environment

2. **Supabase Configuration**
   - Set up Supabase project and database
   - Configure authentication settings (email/password)
   - Set up Row Level Security (RLS) policies for multi-tenancy
   - Generate TypeScript types from database schema

3. **Development Tools**
   - Configure Jest for unit testing
   - Set up Playwright for E2E testing
   - Create development scripts and workflows
   - Set up hot reloading and development server

4. **Research Deliverables**
   - Document Supabase setup process
   - Create environment variable template
   - Document Docker development workflow
   - Create initial project structure

### Phase 1: Core Architecture and Design
**Duration**: 2-3 days
**Deliverable**: `data-model.md`, `quickstart.md`, `contracts/`

**Tasks**:
1. **Authentication Architecture**
   - Design Supabase auth flow with tenant context
   - Create authentication state management strategy
   - Design session persistence and refresh logic
   - Plan route protection middleware implementation

2. **Data Model Design**
   - Map existing database schema to TypeScript types
   - Design user session and role data structures
   - Plan tenant detection and context management
   - Design navigation configuration schema

3. **Component Architecture**
   - Design component hierarchy and data flow
   - Plan state management for layout components
   - Design responsive behavior and mobile interactions
   - Plan accessibility features and keyboard navigation

4. **API Contracts**
   - Document authentication API endpoints
   - Define user session data structure
   - Specify navigation configuration interface
   - Plan error handling and loading states

### Phase 2: Core Implementation
**Duration**: 4-5 days
**Deliverable**: Working login and layout system

**Tasks**:
1. **Authentication System**
   - Implement Supabase client configuration
   - Create authentication hooks and context
   - Build login form with validation
   - Implement tenant detection logic

2. **Layout Components**
   - Build responsive Sidebar component
   - Create Header with user menu
   - Implement role-based navigation logic
   - Add mobile navigation support

3. **Route Protection**
   - Implement Next.js middleware for authentication
   - Create protected route layout
   - Add loading and error states
   - Implement automatic redirects

4. **UI Components**
   - Build form components with validation
   - Create button and input variants
   - Implement toast notification system
   - Add responsive design utilities

### Phase 3: Integration and Testing
**Duration**: 2-3 days
**Deliverable**: Tested and deployed system

**Tasks**:
1. **Testing Implementation**
   - Write unit tests for components and hooks
   - Create integration tests for auth flow
   - Implement E2E tests for user journeys
   - Add accessibility testing

2. **Performance Optimization**
   - Optimize bundle size and loading performance
   - Implement lazy loading for components
   - Add image optimization and caching
   - Monitor and optimize rendering performance

3. **Security Hardening**
   - Implement CSRF protection
   - Add input sanitization
   - Configure security headers
   - Test multi-tenant data isolation

4. **Documentation and Deployment**
   - Create developer setup guide
   - Document component API and usage
   - Set up CI/CD pipeline
   - Deploy to staging environment

## Complexity Tracking

*No constitutional violations identified - all requirements align with established project principles.*

## Dependencies and Integration Points

### External Dependencies
- **Supabase**: Authentication, database, and real-time subscriptions
- **Next.js 14+**: App Router, middleware, and server components
- **TailwindCSS**: Styling framework with custom theme configuration
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference
- **lucide-react**: Icon library for consistent iconography

### Integration Points
- **Existing Database Schema**: Must align with current migration files
- **Multi-Tenant Architecture**: Integration with tenant detection and data isolation
- **Role-Based Access Control**: Integration with user role system
- **Future Features**: Extensible navigation system for upcoming modules

### Risk Mitigation
- **Database Schema Changes**: Use existing migrations as source of truth
- **Authentication Flow**: Implement comprehensive error handling and fallbacks
- **Mobile Responsiveness**: Progressive enhancement approach for complex interactions
- **Performance**: Implement lazy loading and code splitting from the start

## Success Metrics

### Technical Metrics
- Login page loads in <2 seconds
- Dashboard transition completes in <1 second
- Navigation responds within 100ms
- Bundle size remains under 500KB for initial load
- 100% test coverage for authentication flows

### User Experience Metrics
- 95% successful login rate for valid credentials
- Zero navigation confusion in user testing
- Responsive design works on all target devices
- Accessibility score of 95+ on automated testing

### Business Metrics
- Multi-tenant data isolation verified through security testing
- Role-based navigation accurately reflects user permissions
- System supports concurrent users without authentication conflicts
- Setup process completed in under 30 minutes for new developers