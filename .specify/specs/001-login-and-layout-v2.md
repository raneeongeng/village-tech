# Feature Specification: Login Page and Post-Login Layout (with Design Reference)

**Feature Branch**: `001-login-and-layout`
**Created**: 2025-10-09
**Updated**: 2025-10-09 (Added design reference integration)
**Status**: Draft
**Input**: User description with design reference: "Create the Login Page and Post-Login Layout (sidebar + header) for the Village Management Platform (VMP) with design/login.html visual reference"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Login Authentication (Priority: P1)

A user visits the login page that matches the provided design reference, enters valid credentials, and successfully logs into their village's management system, being redirected to the dashboard.

**Why this priority**: Core authentication is the foundation requirement - without it, no other features can be accessed. The design reference ensures visual consistency and professional appearance.

**Independent Test**: Can be fully tested by navigating to login page, verifying it matches the design reference visual layout, entering valid email/password, and verifying successful redirect to dashboard with "Coming Soon" message.

**Acceptance Scenarios**:

1. **Given** user visits login page, **When** page loads, **Then** layout matches design/login.html visual structure with VMP branding
2. **Given** user is on login page, **When** user enters valid email and password, **Then** user is authenticated and redirected to `/dashboard`
3. **Given** user enters invalid credentials, **When** user submits form, **Then** appropriate error message is displayed without redirect
4. **Given** user is already authenticated, **When** user visits login page, **Then** user is automatically redirected to `/dashboard`

---

### User Story 2 - Multi-Tenant Context Detection (Priority: P2)

A user accesses the system via subdomain (e.g., `greenville.vmp.app`) and the system automatically detects their village context for authentication while maintaining the design reference layout.

**Why this priority**: Multi-tenancy is core to the platform's business model, enabling multiple villages to use the same system while maintaining data isolation.

**Independent Test**: Can be tested by accessing different subdomains and verifying that tenant context is properly detected and used for authentication without breaking the design layout.

**Acceptance Scenarios**:

1. **Given** user accesses `greenville.vmp.app/login`, **When** user logs in, **Then** authentication occurs within Greenville tenant context
2. **Given** subdomain cannot be detected, **When** user visits login page, **Then** tenant selector dropdown is displayed within the existing design layout
3. **Given** user selects tenant from dropdown, **When** user authenticates, **Then** login occurs within selected tenant context

---

### User Story 3 - Role-Based Layout Rendering (Priority: P3)

After login, users see a layout with sidebar navigation items that match their specific role permissions within their village.

**Why this priority**: Role-based navigation sets up the foundation for all future features and provides users with appropriate access based on their responsibilities.

**Independent Test**: Can be tested by logging in with different role accounts and verifying that sidebar shows correct menu items for each role.

**Acceptance Scenarios**:

1. **Given** Superadmin user logs in, **When** dashboard loads, **Then** sidebar shows all administrative menu items (Villages, Users, Payments, etc.)
2. **Given** Household-Head user logs in, **When** dashboard loads, **Then** sidebar shows limited menu items (My Household, Requests, Deliveries, Rules)
3. **Given** Security-Officer user logs in, **When** dashboard loads, **Then** sidebar shows security-specific items (Gate Logs, Visitors, Incidents)

---

### User Story 4 - Responsive Layout Experience (Priority: P4)

Users can access the system from mobile devices and experience a responsive layout that adapts the sidebar and header appropriately while maintaining the design aesthetics.

**Why this priority**: Mobile access is essential for security officers and field staff who need system access while on duty.

**Independent Test**: Can be tested by accessing the system on mobile devices and verifying layout adapts properly with collapsible sidebar while maintaining design consistency.

**Acceptance Scenarios**:

1. **Given** user accesses system on mobile, **When** layout renders, **Then** sidebar is collapsed by default with hamburger menu
2. **Given** user is on tablet, **When** screen orientation changes, **Then** layout adapts appropriately
3. **Given** user toggles sidebar on mobile, **When** sidebar opens/closes, **Then** main content area adjusts smoothly

---

### Edge Cases

- What happens when user's session expires while navigating the application?
- How does system handle authentication when Supabase is temporarily unavailable?
- What occurs when user's role is changed while they're logged in?
- How does system behave when subdomain doesn't match any existing tenant?
- What happens when user attempts to access routes they don't have permission for?
- How does the design adapt when the village/tenant branding needs to be customized?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users via Supabase Auth using email/password credentials
- **FR-002**: System MUST detect tenant context from subdomain or provide tenant selection dropdown
- **FR-003**: System MUST redirect all authenticated users to `/dashboard` after successful login
- **FR-004**: System MUST render role-appropriate sidebar navigation items based on user's role
- **FR-005**: System MUST protect all routes except login page and require authentication
- **FR-006**: System MUST display user's name and role at bottom of sidebar
- **FR-007**: System MUST provide logout functionality accessible from header user dropdown
- **FR-008**: System MUST highlight active page in sidebar navigation
- **FR-009**: System MUST be responsive and adapt layout for mobile, tablet, and desktop
- **FR-010**: System MUST validate form inputs and display appropriate error messages
- **FR-011**: System MUST persist authentication state across browser sessions
- **FR-012**: System MUST provide collapsible sidebar functionality
- **FR-013**: Dashboard page MUST display "Coming Soon" placeholder content
- **FR-014**: Login page MUST visually match the structure and layout from design/login.html

### Design Reference Requirements

- **DR-001**: Login page MUST follow the two-column layout from design/login.html (left: form, right: branding)
- **DR-002**: Login form MUST use the same visual hierarchy: title, subtitle, form fields, button, divider, social auth
- **DR-003**: Input fields MUST match the styling: padding, border radius, background opacity, focus states
- **DR-004**: Button styling MUST follow the primary button design with proper hover states
- **DR-005**: Branding area MUST be adapted from "Tenant Management" to "Village Manager" with appropriate icon
- **DR-006**: Color scheme MUST be updated from design reference to VMP palette while maintaining visual balance
- **DR-007**: Typography MUST use Inter font family as specified in both design reference and VMP requirements
- **DR-008**: Responsive behavior MUST follow the mobile-first approach shown in design reference

### Technical Requirements

- **TR-001**: System MUST use Next.js 14+ App Router architecture
- **TR-002**: System MUST implement TypeScript for type safety
- **TR-003**: System MUST use React Hook Form with Zod validation for all forms
- **TR-004**: System MUST use TailwindCSS with defined color palette and typography
- **TR-005**: System MUST use Supabase client for authentication and session management
- **TR-006**: System MUST implement middleware for route protection
- **TR-007**: System MUST use environment variables for Supabase configuration
- **TR-008**: System MUST support Docker containerization
- **TR-009**: System MUST implement ESLint and Prettier for code quality
- **TR-010**: System MUST use lucide-react or react-icons for iconography
- **TR-011**: System MUST convert design/login.html structure to React components with TailwindCSS

### Key Entities *(include if feature involves data)*

- **User**: Represents authenticated users with email, role, tenant association, and session state
- **Tenant**: Represents village/community with subdomain, name, and user base
- **Role**: Defines user permissions and available navigation items
- **Session**: Manages authentication state, token persistence, and expiration
- **Navigation**: Configuration mapping roles to available menu items and routes

### Security Requirements

- **SR-001**: System MUST enforce tenant data isolation at authentication level
- **SR-002**: System MUST validate user permissions before rendering navigation items
- **SR-003**: System MUST implement secure session management with automatic expiration
- **SR-004**: System MUST sanitize all user inputs to prevent XSS attacks
- **SR-005**: System MUST use HTTPS for all authentication communications
- **SR-006**: System MUST implement CSRF protection for form submissions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete login process in under 30 seconds with valid credentials
- **SC-002**: System correctly detects tenant context from subdomain 100% of the time
- **SC-003**: Role-based navigation renders appropriate menu items with 100% accuracy
- **SC-004**: Layout is fully responsive and functional on screen sizes from 320px to 1920px
- **SC-005**: Authentication state persists correctly across browser sessions
- **SC-006**: Form validation provides clear, actionable error messages for invalid inputs
- **SC-007**: System handles concurrent users per tenant without authentication conflicts
- **SC-008**: Login page visual design matches design reference within 95% accuracy

### Performance Criteria

- **PC-001**: Login page loads within 2 seconds on standard broadband connection
- **PC-002**: Dashboard transition after login completes within 1 second
- **PC-003**: Sidebar navigation responds to interactions within 100ms
- **PC-004**: Layout rendering completes within 500ms on mobile devices

### User Experience Criteria

- **UX-001**: 95% of users can successfully log in on first attempt with valid credentials
- **UX-002**: Users can navigate between sections using sidebar without confusion
- **UX-003**: Mobile users can access all navigation functionality through responsive design
- **UX-004**: Error messages are clear and help users resolve authentication issues
- **UX-005**: Visual design feels consistent and professional compared to design reference

## Design Specifications

### Color Palette (Updated from Design Reference)
- Primary: #22574A (Deep Forest Green) - replaces #1173d4 from design
- Secondary: #E8DCCA (Warm Beige) - new addition for VMP
- Accent: #D96E49 (Terracotta Orange) - new addition for VMP
- Background: #FCFBF9 (Off White) - replaces #f6f7f8 from design
- Text: #555555 (Charcoal Gray) - maintains readability

### Typography (Consistent with Design Reference)
- Body Text: Inter font family (matches design reference)
- Headings: Poppins font family (VMP enhancement)
- Font Weights: Regular (400), Medium (500), Semibold (600), Bold (700)

### Layout Specifications (Based on Design Reference)
- Login Page: Two-column layout (50/50 split on desktop, stacked on mobile)
- Form Container: Maximum width 448px (max-w-md), centered with padding
- Input Fields: py-3 px-4 padding, rounded-lg border radius
- Button: Full width, py-3 px-4 padding, bold font weight
- Sidebar Width: 256px (desktop), collapsible on mobile
- Header Height: 64px
- Spacing: 8px grid system (8px, 16px, 24px, 32px)
- Border Radius: 4px (small), 8px (medium), 12px (large)
- Shadow: Soft shadows for elevation and depth

### Design Conversion Guidelines

#### From design/login.html to React Components:

1. **Split-Screen Layout**:
   - Convert to responsive grid/flexbox
   - Maintain order swap on mobile (form first, branding second)

2. **Form Structure**:
   - Convert form elements to React Hook Form components
   - Maintain visual hierarchy and spacing
   - Add Zod validation while keeping error styling

3. **Branding Area**:
   - Replace "Tenant Management" with "Village Manager"
   - Update icon to village/community-themed design
   - Adapt description to VMP context

4. **Color Migration**:
   - Replace `primary` (#1173d4) with VMP primary (#22574A)
   - Update `background-light` (#f6f7f8) with VMP background (#FCFBF9)
   - Maintain contrast ratios and accessibility

5. **Interactive Elements**:
   - Convert social auth placeholders to future OAuth integration points
   - Maintain hover and focus states
   - Add loading states for form submission

## Role-Based Navigation Configuration

### Navigation Menu Items by Role

| Role | Navigation Items |
|------|------------------|
| **Superadmin** | Dashboard, Villages, Users, Payments, Reports, Notifications, Settings |
| **Admin-Head** | Dashboard, Households, Fees, Security, Rules, Announcements, Settings |
| **Admin-Officer** | Dashboard, Households, Fees, Deliveries, Rules, Settings |
| **Household-Head** | Dashboard, My Household, Requests, Deliveries, Rules |
| **Security-Head** | Dashboard, Guards, Incidents, Reports, Settings |
| **Security-Officer** | Dashboard, Gate Logs, Visitors, Incidents |
| **Beneficial User** | Dashboard, My Access, Deliveries |
| **Household-Member** | Dashboard, My Access, Deliveries |

## Implementation Architecture

### File Structure (Updated with Design Reference)
```
app/
├── (auth)/
│   ├── login/
│   │   ├── page.tsx                  # Converted from design/login.html
│   │   └── components/
│   │       ├── LoginForm.tsx         # Form section from design
│   │       ├── BrandingArea.tsx      # Right-side branding from design
│   │       └── SocialAuth.tsx        # Social auth buttons (future)
│   └── layout.tsx
├── (protected)/
│   ├── dashboard/
│   │   └── page.tsx
│   └── layout.tsx
├── middleware.ts
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── types.ts
└── components/
    ├── ui/
    ├── auth/
    │   └── LoginForm.tsx
    └── layout/
        ├── Sidebar.tsx
        ├── Header.tsx
        └── navigation-config.ts
```

### Component Mapping from Design Reference

**design/login.html Structure → React Components**:

1. **Two-Column Container** → `LoginPage` component
2. **Left Column (Form Area)** → `LoginForm` component
3. **Right Column (Branding)** → `BrandingArea` component
4. **Form Elements** → Individual form components with React Hook Form
5. **Social Auth Section** → `SocialAuth` component (placeholder for future OAuth)

### Design Reference Integration Strategy

1. **Phase 1**: Direct HTML-to-React conversion maintaining exact styling
2. **Phase 2**: Color palette migration to VMP colors
3. **Phase 3**: Branding customization (logos, text, icons)
4. **Phase 4**: Integration with Supabase Auth and validation
5. **Phase 5**: Responsive enhancements and accessibility improvements

### State Management

**Authentication State**:
- User session data
- Role information
- Tenant context
- Authentication status

**UI State** (Enhanced for Design Reference):
- Form submission loading state
- Validation error display
- Social auth loading states
- Responsive layout states

### Error Handling

**Authentication Errors**:
- Invalid credentials
- Network connectivity issues
- Session expiration
- Tenant not found

**Design Integration Errors**:
- Asset loading failures
- Font loading fallbacks
- Icon rendering fallbacks

## Testing Strategy

### Unit Tests
- Form validation logic
- Authentication helper functions
- Navigation configuration
- Role permission checks
- Design component rendering

### Integration Tests
- Login flow with Supabase
- Route protection middleware
- Layout rendering with different roles
- Responsive behavior
- Design reference compliance

### End-to-End Tests
- Complete login to dashboard flow
- Multi-tenant authentication
- Role-based navigation rendering
- Mobile responsive functionality
- Visual regression testing against design reference

### Visual Testing
- Component screenshot comparison with design reference
- Cross-browser compatibility testing
- Responsive design validation
- Accessibility compliance testing

## Deployment Considerations

### Environment Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Docker Configuration
- Multi-stage build for production optimization
- Environment variable injection
- Port configuration (3000)
- Health check endpoints

### Design Asset Management
- Font loading optimization (Inter family)
- Icon asset optimization
- Image compression for branding elements
- SVG optimization for scalability

### Security Considerations
- Environment variable security
- HTTPS enforcement
- Session security configuration
- CORS policy setup

## Design Reference Checklist

### Visual Consistency
- [ ] Two-column layout structure maintained
- [ ] Form styling matches design reference proportions
- [ ] Button and input styles converted accurately
- [ ] Responsive behavior follows design patterns
- [ ] Typography hierarchy preserved

### Branding Adaptation
- [ ] "Tenant Management" → "Village Manager" conversion
- [ ] Icon updated to village/community theme
- [ ] Color palette migrated to VMP colors
- [ ] Messaging adapted for village management context

### Functional Integration
- [ ] React Hook Form integration with design styling
- [ ] Supabase Auth integration without visual changes
- [ ] Error state styling matches design patterns
- [ ] Loading states integrated seamlessly

### Technical Quality
- [ ] Clean HTML-to-React conversion
- [ ] TailwindCSS classes properly applied
- [ ] Responsive classes match design behavior
- [ ] Accessibility attributes maintained