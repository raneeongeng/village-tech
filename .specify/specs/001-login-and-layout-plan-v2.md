# Implementation Plan: Login Page and Post-Login Layout (with Design Reference)

**Branch**: `001-login-and-layout` | **Date**: 2025-10-09 | **Spec**: [001-login-and-layout-v2.md](.specify/specs/001-login-and-layout-v2.md)
**Input**: Feature specification with design reference integration from `design/login.html`

## Summary

Implement a secure, multi-tenant authentication system with role-based layout for the Village Management Platform, following the visual design structure from `design/login.html`. The solution includes a modern login page with Supabase authentication, tenant detection via subdomain, and a responsive post-login layout featuring dynamic sidebar navigation based on user roles. The implementation follows Next.js 14+ App Router architecture with TypeScript, TailwindCSS, and Docker containerization while maintaining visual consistency with the provided design reference.

## Technical Context

**Language/Version**: TypeScript 5+ with Next.js 14+ (App Router)
**Primary Dependencies**: React 18+, Supabase Auth, React Hook Form, Zod, TailwindCSS, lucide-react
**Storage**: Supabase (PostgreSQL) with Row Level Security for multi-tenancy
**Testing**: Jest/Vitest for unit tests, Playwright for E2E testing
**Target Platform**: Web application (responsive: mobile, tablet, desktop)
**Project Type**: Web application with server-side rendering and client-side interactivity
**Performance Goals**: <2s login page load, <1s dashboard transition, <100ms navigation response
**Constraints**: Multi-tenant data isolation, role-based access control, mobile-first responsive design, visual consistency with design reference
**Scale/Scope**: Multiple villages (tenants), 8 user roles, extensible navigation system, design reference compliance

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
- Design reference: ✅ Visual structure from design/login.html

## Project Structure

### Documentation (this feature)

```
.specify/specs/001-login-and-layout/
├── 001-login-and-layout-v2.md      # Updated feature specification with design reference
├── 001-login-and-layout-plan-v2.md # This updated implementation plan
├── research.md                      # Phase 0: Technology research and design analysis
├── data-model.md                    # Phase 1: Database schema and auth flow
├── quickstart.md                    # Phase 1: Development setup guide
├── contracts/                       # Phase 1: API contracts and interfaces
│   ├── auth-api.md
│   ├── user-session.md
│   └── navigation-config.md
└── tasks.md                         # Phase 2: Detailed implementation tasks
```

### Source Code (repository root)

```
src/
├── app/
│   ├── (auth)/                      # Authentication routes group
│   │   ├── login/
│   │   │   ├── page.tsx             # Login page (converted from design/login.html)
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx    # Left column form section
│   │   │   │   ├── BrandingArea.tsx # Right column branding section
│   │   │   │   ├── SocialAuth.tsx   # Social authentication buttons
│   │   │   │   └── TenantSelector.tsx # Tenant selection dropdown
│   │   │   └── loading.tsx          # Login loading state
│   │   └── layout.tsx               # Auth layout (minimal, centered)
│   │
│   ├── (protected)/                 # Protected routes group
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # Dashboard "Coming Soon" page
│   │   │   └── loading.tsx          # Dashboard loading state
│   │   └── layout.tsx               # Protected layout (Sidebar + Header)
│   │
│   ├── layout.tsx                   # Root layout with providers
│   ├── globals.css                  # TailwindCSS base styles + design reference styles
│   ├── loading.tsx                  # Global loading component
│   ├── error.tsx                    # Global error boundary
│   └── not-found.tsx                # 404 page
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx            # Login form with validation (from design reference)
│   │   ├── TenantSelector.tsx       # Tenant selection dropdown
│   │   └── AuthProvider.tsx         # Authentication context provider
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx              # Dynamic sidebar with role-based nav
│   │   ├── Header.tsx               # Header with user menu and notifications
│   │   ├── UserMenu.tsx             # User avatar dropdown component
│   │   ├── MobileNavigation.tsx     # Mobile hamburger menu
│   │   └── LayoutProvider.tsx       # Layout state management
│   │
│   ├── ui/                          # Reusable UI components (design reference styled)
│   │   ├── Button.tsx               # Button variants matching design reference
│   │   ├── Input.tsx                # Form input matching design reference styling
│   │   ├── Card.tsx                 # Card container component
│   │   ├── Toast.tsx                # Toast notification system
│   │   ├── Avatar.tsx               # User avatar component
│   │   ├── Badge.tsx                # Status and role badges
│   │   ├── Spinner.tsx              # Loading spinner component
│   │   ├── Modal.tsx                # Modal dialog component
│   │   └── Logo.tsx                 # Village Manager logo component
│   │
│   └── forms/
│       ├── FormField.tsx            # Form field wrapper with validation
│       ├── FormError.tsx            # Error message display
│       └── FormProvider.tsx         # Form context and validation
│
├── hooks/
│   ├── useAuth.tsx                  # Authentication state and methods
│   ├── useUser.tsx                  # User profile and role data
│   ├── useTenant.tsx                # Tenant context and detection
│   ├── useNavigation.tsx            # Navigation state and role filtering
│   └── useLocalStorage.tsx          # Client-side storage utilities
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Supabase client configuration
│   │   ├── auth.ts                  # Authentication utilities
│   │   ├── database.ts              # Database query helpers
│   │   └── types.ts                 # Generated Supabase types
│   │
│   ├── validations/
│   │   ├── auth.ts                  # Login/signup validation schemas
│   │   ├── user.ts                  # User profile validation
│   │   └── common.ts                # Shared validation utilities
│   │
│   ├── config/
│   │   ├── navigation.ts            # Role-based navigation configuration
│   │   ├── roles.ts                 # User role definitions and permissions
│   │   ├── tenants.ts               # Tenant configuration
│   │   └── app.ts                   # Application constants
│   │
│   └── utils/
│       ├── cn.ts                    # Tailwind class name utility
│       ├── format.ts                # String and date formatting
│       ├── permissions.ts           # Role permission checking
│       ├── tenant.ts                # Tenant detection and utilities
│       └── design.ts                # Design reference conversion utilities
│
├── middleware.ts                    # Route protection and authentication
├── types/
│   ├── auth.ts                      # Authentication type definitions
│   ├── user.ts                      # User and role type definitions
│   ├── navigation.ts                # Navigation and menu type definitions
│   └── global.ts                    # Global type definitions
│
└── styles/
    ├── globals.css                  # Global styles and Tailwind imports
    ├── components.css               # Component-specific styles
    └── design-reference.css         # Styles converted from design/login.html

config/
├── tailwind.config.ts               # TailwindCSS configuration with VMP theme + design reference
├── next.config.mjs                 # Next.js configuration
├── jest.config.js                  # Jest testing configuration
├── playwright.config.ts            # Playwright E2E configuration
├── eslint.config.js                # ESLint configuration
├── prettier.config.js              # Prettier configuration
└── tsconfig.json                   # TypeScript configuration

design/
└── login.html                      # Design reference file (source)

docker/
├── Dockerfile                      # Production Docker image
├── Dockerfile.dev                  # Development Docker image
├── docker-compose.yml              # Development environment
├── docker-compose.prod.yml         # Production environment
└── .dockerignore                   # Docker ignore patterns
```

**Structure Decision**: Enhanced web application structure optimized for Next.js 14+ App Router with design reference integration. The login page components are organized to match the design reference structure while maintaining clear separation of concerns. Design reference specific utilities and styles are isolated for maintainability.

## Implementation Phases

### Phase 0: Research and Foundation Setup (Enhanced)
**Duration**: 1-2 days
**Deliverable**: `research.md`

**Tasks**:
1. **Environment Setup**
   - Initialize Next.js 14+ project with TypeScript
   - Configure TailwindCSS with VMP color palette and design reference integration
   - Set up ESLint, Prettier, and pre-commit hooks
   - Create Docker development environment

2. **Design Reference Analysis**
   - Analyze `design/login.html` structure and components
   - Map HTML elements to React component architecture
   - Extract reusable design patterns and utilities
   - Plan color migration strategy from design to VMP palette

3. **Supabase Configuration**
   - Set up Supabase project and database
   - Configure authentication settings (email/password)
   - Set up Row Level Security (RLS) policies for multi-tenancy
   - Generate TypeScript types from database schema

4. **Development Tools**
   - Configure Jest for unit testing
   - Set up Playwright for E2E testing
   - Set up visual regression testing for design compliance
   - Create development scripts and workflows

5. **Research Deliverables**
   - Document design reference conversion strategy
   - Create component mapping from HTML to React
   - Document Supabase setup process
   - Create environment variable template
   - Document Docker development workflow

### Phase 1: Core Architecture and Design Integration
**Duration**: 2-3 days
**Deliverable**: `data-model.md`, `quickstart.md`, `contracts/`

**Tasks**:
1. **Design System Integration**
   - Convert design reference colors to VMP color palette
   - Set up TailwindCSS configuration with design tokens
   - Create base UI components matching design reference styling
   - Establish typography system (Inter/Poppins integration)

2. **Authentication Architecture**
   - Design Supabase auth flow with tenant context
   - Create authentication state management strategy
   - Design session persistence and refresh logic
   - Plan route protection middleware implementation

3. **Component Architecture (Design-Driven)**
   - Design login page component hierarchy based on design reference
   - Plan responsive behavior following design patterns
   - Design layout components for post-login structure
   - Plan accessibility features and keyboard navigation

4. **Data Model Design**
   - Map existing database schema to TypeScript types
   - Design user session and role data structures
   - Plan tenant detection and context management
   - Design navigation configuration schema

5. **API Contracts**
   - Document authentication API endpoints
   - Define user session data structure
   - Specify navigation configuration interface
   - Plan error handling and loading states

### Phase 2: Login Page Implementation (Design Reference)
**Duration**: 3-4 days
**Deliverable**: Working login page matching design reference

**Tasks**:
1. **Design Reference Conversion**
   - Convert HTML structure to React components
   - Implement two-column layout (form + branding)
   - Create form components with design reference styling
   - Convert static elements to interactive React components

2. **Authentication Integration**
   - Implement Supabase client configuration
   - Create authentication hooks and context
   - Build login form with React Hook Form integration
   - Implement tenant detection logic

3. **Visual Consistency**
   - Apply VMP color palette to design reference structure
   - Implement responsive behavior matching design patterns
   - Add loading states and transitions
   - Ensure accessibility compliance

4. **Branding Customization**
   - Replace "Tenant Management" with "Village Manager"
   - Update icons and messaging for village context
   - Customize branding area with VMP identity
   - Prepare for future OAuth integration

### Phase 3: Post-Login Layout Implementation
**Duration**: 3-4 days
**Deliverable**: Working role-based layout system

**Tasks**:
1. **Layout Components**
   - Build responsive Sidebar component
   - Create Header with user menu
   - Implement role-based navigation logic
   - Add mobile navigation support

2. **Route Protection**
   - Implement Next.js middleware for authentication
   - Create protected route layout
   - Add loading and error states
   - Implement automatic redirects

3. **Navigation System**
   - Build role-based navigation configuration
   - Implement dynamic menu rendering
   - Add active route highlighting
   - Create user context display

4. **Responsive Design**
   - Implement mobile-first responsive behavior
   - Add sidebar collapse functionality
   - Optimize touch interactions
   - Test across device breakpoints

### Phase 4: Integration and Testing (Enhanced)
**Duration**: 2-3 days
**Deliverable**: Tested and deployed system

**Tasks**:
1. **Testing Implementation**
   - Write unit tests for components and hooks
   - Create integration tests for auth flow
   - Implement E2E tests for user journeys
   - Add visual regression tests for design compliance

2. **Design Reference Validation**
   - Compare implementation with design reference
   - Validate responsive behavior consistency
   - Test cross-browser compatibility
   - Verify accessibility compliance

3. **Performance Optimization**
   - Optimize bundle size and loading performance
   - Implement lazy loading for components
   - Add image optimization and caching
   - Monitor and optimize rendering performance

4. **Security Hardening**
   - Implement CSRF protection
   - Add input sanitization
   - Configure security headers
   - Test multi-tenant data isolation

5. **Documentation and Deployment**
   - Create developer setup guide
   - Document component API and usage
   - Set up CI/CD pipeline
   - Deploy to staging environment

## Design Reference Integration Strategy

### HTML to React Conversion Plan

**1. Structure Mapping**
```html
<!-- design/login.html structure -->
<div class="flex flex-col md:flex-row min-h-screen">
  <div class="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 order-2 md:order-1">
    <!-- Form Section → LoginForm.tsx -->
  </div>
  <div class="w-full md:w-1/2 flex items-center justify-center bg-primary/10 order-1 md:order-2 p-8 lg:p-12">
    <!-- Branding Section → BrandingArea.tsx -->
  </div>
</div>
```

**2. Component Breakdown**
- **Main Container** → `page.tsx` (login route)
- **Form Column** → `LoginForm.tsx` component
- **Branding Column** → `BrandingArea.tsx` component
- **Input Fields** → `Input.tsx` UI component
- **Submit Button** → `Button.tsx` UI component
- **Social Auth** → `SocialAuth.tsx` component (future OAuth)

**3. Color Migration Strategy**
```typescript
// design/login.html colors → VMP colors
const colorMigration = {
  'primary': '#1173d4' → '#22574A',     // Blue to Forest Green
  'background-light': '#f6f7f8' → '#FCFBF9',  // Light gray to off-white
  // Add secondary and accent colors
  'secondary': '#E8DCCA',               // New: Warm Beige
  'accent': '#D96E49',                  // New: Terracotta Orange
  'text': '#555555'                     // Charcoal Gray
}
```

**4. Typography Integration**
- **Maintain Inter font** from design reference
- **Add Poppins** for headings per VMP requirements
- **Preserve font weights** and hierarchy from design

**5. Responsive Behavior**
- **Mobile-first approach** following design reference
- **Order switching** on mobile (form first, branding second)
- **Flexible padding** and spacing adjustments

### TailwindCSS Configuration Enhancement

```typescript
// tailwind.config.ts (enhanced for design reference)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#22574A',      // VMP Forest Green
        secondary: '#E8DCCA',    // VMP Warm Beige
        accent: '#D96E49',       // VMP Terracotta Orange
        background: '#FCFBF9',   // VMP Off White
        text: '#555555',         // VMP Charcoal Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],      // Body text
        heading: ['Poppins', 'sans-serif'], // Headings
      },
      spacing: {
        // Match design reference spacing
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'lg': '0.5rem',     // Match design reference
        'xl': '0.75rem',
      }
    },
  },
}
```

## Complexity Tracking

*No constitutional violations identified - all requirements align with established project principles while enhancing with design reference integration.*

## Dependencies and Integration Points

### External Dependencies (Enhanced)
- **Supabase**: Authentication, database, and real-time subscriptions
- **Next.js 14+**: App Router, middleware, and server components
- **TailwindCSS**: Styling framework with custom theme configuration
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference
- **lucide-react**: Icon library for consistent iconography
- **Design Reference**: HTML structure and styling patterns

### Integration Points (Enhanced)
- **Existing Database Schema**: Must align with current migration files
- **Multi-Tenant Architecture**: Integration with tenant detection and data isolation
- **Role-Based Access Control**: Integration with user role system
- **Design Reference**: Visual consistency with provided HTML design
- **Future Features**: Extensible navigation system for upcoming modules

### Risk Mitigation (Enhanced)
- **Database Schema Changes**: Use existing migrations as source of truth
- **Authentication Flow**: Implement comprehensive error handling and fallbacks
- **Design Consistency**: Regular visual comparison with design reference
- **Mobile Responsiveness**: Progressive enhancement approach for complex interactions
- **Performance**: Implement lazy loading and code splitting from the start

## Success Metrics (Enhanced)

### Technical Metrics
- Login page loads in <2 seconds
- Dashboard transition completes in <1 second
- Navigation responds within 100ms
- Bundle size remains under 500KB for initial load
- 100% test coverage for authentication flows
- 95% visual similarity to design reference

### User Experience Metrics
- 95% successful login rate for valid credentials
- Zero navigation confusion in user testing
- Responsive design works on all target devices
- Accessibility score of 95+ on automated testing
- Visual design approval from stakeholders

### Business Metrics
- Multi-tenant data isolation verified through security testing
- Role-based navigation accurately reflects user permissions
- System supports concurrent users without authentication conflicts
- Setup process completed in under 30 minutes for new developers
- Design reference compliance validated through visual testing

## Design Reference Compliance Checklist

### Visual Structure
- [ ] Two-column layout preserved (form left, branding right)
- [ ] Mobile order switching implemented (form first on mobile)
- [ ] Form container max-width and centering maintained
- [ ] Branding area icon and messaging structure preserved

### Component Styling
- [ ] Input field styling matches design reference (padding, border radius, focus states)
- [ ] Button styling matches design reference (full width, padding, hover states)
- [ ] Form labels and error states styled consistently
- [ ] Social authentication placeholder buttons implemented

### Color Integration
- [ ] Primary color migrated from blue (#1173d4) to forest green (#22574A)
- [ ] Background color updated to VMP off-white (#FCFBF9)
- [ ] Contrast ratios maintained for accessibility
- [ ] New VMP colors (secondary, accent) integrated appropriately

### Typography
- [ ] Inter font family maintained from design reference
- [ ] Poppins font added for headings per VMP requirements
- [ ] Font weights and sizing hierarchy preserved
- [ ] Line heights and letter spacing maintained

### Responsive Behavior
- [ ] Mobile breakpoints match design reference behavior
- [ ] Padding and spacing adjust appropriately across screen sizes
- [ ] Touch targets optimized for mobile devices
- [ ] Cross-browser compatibility verified

### Branding Adaptation
- [ ] "Tenant Management" replaced with "Village Manager"
- [ ] Icon updated to village/community theme
- [ ] Messaging adapted for village management context
- [ ] Logo integration prepared for VMP branding

This enhanced implementation plan ensures both technical excellence and visual consistency with the provided design reference while meeting all VMP business requirements.