# Tasks: Login Page and Post-Login Layout (with Design Reference)

**Input**: Design documents from `.specify/specs/001-login-and-layout/` with design reference integration
**Prerequisites**: plan-v2.md (required), spec-v2.md (required for user stories), design/login.html (design reference)

**Tests**: Tests are included for quality assurance and TDD approach. Visual regression testing added for design compliance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story, with design reference integration throughout.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- **[DR]**: Design Reference specific tasks
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App Router**: `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`
- **Testing**: `tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/visual/`
- **Design Reference**: `design/login.html` (source), `src/styles/design-reference.css`
- **Configuration**: Root-level config files

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and design reference analysis

- [x] T001 [P] Initialize Next.js 14+ project with TypeScript and App Router in repository root
- [x] T002 [P] [DR] Analyze design/login.html structure and create component mapping document in `docs/design-analysis.md`
- [x] T003 [P] Install dependencies: React Hook Form, Zod, Supabase, lucide-react in `package.json`
- [x] T004 [P] [DR] Configure TailwindCSS with VMP color palette and design reference tokens in `tailwind.config.ts`
- [x] T005 [P] Configure ESLint and Prettier for code quality in `.eslintrc.js` and `.prettierrc`
- [x] T006 [P] Create Docker development environment with `Dockerfile` and `docker-compose.yml`
- [x] T007 [P] Set up environment variables template in `.env.example`
- [x] T008 [P] [DR] Set up visual regression testing configuration with Playwright in `playwright.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Initialize Supabase client configuration in `src/lib/supabase/client.ts`
- [x] T010 [P] Create base TypeScript types for User, Tenant, Role, Session in `src/types/auth.ts`
- [x] T011 [P] Create authentication utilities and helpers in `src/lib/auth.ts`
- [x] T012 [P] Set up role definitions and permissions in `src/lib/config/roles.ts`
- [x] T013 [P] Create navigation configuration mapping roles to menu items in `src/lib/config/navigation.ts`
- [x] T014 [P] Set up form validation schemas with Zod in `src/lib/validations/auth.ts`
- [x] T015 [P] [DR] Create design reference base styles in `src/styles/design-reference.css`
- [x] T016 [P] [DR] Create design-to-VMP color migration utilities in `src/lib/utils/design.ts`
- [x] T017 [P] [DR] Create base UI components matching design reference in `src/components/ui/`
- [x] T018 [P] Configure TailwindCSS globals and component styles in `src/app/globals.css`
- [x] T019 Create Next.js middleware for route protection in `middleware.ts`
- [x] T020 [P] Set up authentication context and provider in `src/components/auth/AuthProvider.tsx`
- [x] T021 [P] Create authentication hooks in `src/hooks/useAuth.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Login Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can visit login page matching design reference, enter credentials, and be redirected to dashboard after authentication

**Independent Test**: Navigate to login page, verify it matches design/login.html visual layout, enter valid email/password, verify redirect to dashboard with "Coming Soon" message

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US1] [DR] Visual regression test for login page layout in `tests/visual/login-design.spec.ts`
- [x] T023 [P] [US1] Unit test for login form validation in `tests/unit/components/auth/LoginForm.test.tsx`
- [x] T024 [P] [US1] Integration test for Supabase authentication flow in `tests/integration/auth-flow.test.ts`
- [x] T025 [P] [US1] E2E test for complete login to dashboard journey in `tests/e2e/login.spec.ts`

### Implementation for User Story 1

- [x] T026 [P] [US1] [DR] Create login page main container matching design structure in `src/app/(auth)/login/page.tsx`
- [x] T027 [P] [US1] [DR] Create BrandingArea component (right column) in `src/app/(auth)/login/components/BrandingArea.tsx`
- [x] T028 [P] [US1] Create login page auth layout in `src/app/(auth)/layout.tsx`
- [x] T029 [US1] [DR] Create LoginForm component (left column) matching design in `src/app/(auth)/login/components/LoginForm.tsx`
- [x] T030 [US1] [DR] Implement form fields with design reference styling using React Hook Form
- [x] T031 [US1] Add form validation and error handling with Zod schemas
- [x] T032 [US1] Integrate Supabase authentication in LoginForm component
- [x] T033 [P] [US1] Create dashboard placeholder page in `src/app/(protected)/dashboard/page.tsx`
- [x] T034 [P] [US1] Create protected routes layout in `src/app/(protected)/layout.tsx`
- [x] T035 [US1] Implement redirect logic after successful authentication
- [x] T036 [US1] [DR] Add loading states and error handling matching design patterns
- [x] T037 [US1] [DR] Apply VMP color palette to design reference structure
- [x] T038 [US1] [DR] Update branding from "Tenant Management" to "Village Manager"

**Checkpoint**: At this point, User Story 1 should be fully functional - users can log in with design-compliant UI and see dashboard

---

## Phase 4: User Story 2 - Multi-Tenant Context Detection (Priority: P2)

**Goal**: System automatically detects tenant from subdomain or provides tenant selection while maintaining design layout

**Independent Test**: Access different subdomains and verify tenant context is detected and used for authentication without breaking design layout

### Tests for User Story 2

- [ ] T039 [P] [US2] Unit test for tenant detection utilities in `tests/unit/lib/tenant.test.ts`
- [ ] T040 [P] [US2] Integration test for multi-tenant authentication in `tests/integration/multi-tenant.test.ts`
- [ ] T041 [P] [US2] [DR] Visual test for tenant selector integration with design in `tests/visual/tenant-selector.spec.ts`
- [ ] T042 [P] [US2] E2E test for subdomain-based tenant detection in `tests/e2e/multi-tenant.spec.ts`

### Implementation for User Story 2

- [x] T043 [P] [US2] Create tenant detection utilities in `src/lib/utils/tenant.ts`
- [x] T044 [P] [US2] Create tenant context and provider in `src/hooks/useTenant.tsx`
- [x] T045 [P] [US2] [DR] Create TenantSelector component matching design layout in `src/app/(auth)/login/components/TenantSelector.tsx`
- [x] T046 [US2] Integrate tenant detection into login flow
- [x] T047 [US2] Update authentication to include tenant context
- [x] T048 [US2] Add tenant validation and error handling
- [x] T049 [US2] Update middleware to handle tenant context
- [x] T050 [US2] [DR] Style tenant selector to integrate seamlessly with design reference

**Checkpoint**: Multi-tenant authentication working - different tenants can authenticate independently with design compliance

---

## Phase 5: User Story 3 - Role-Based Layout Rendering (Priority: P3)

**Goal**: After login, users see sidebar navigation with menu items appropriate to their role permissions

**Independent Test**: Log in with different role accounts and verify sidebar shows correct menu items for each role

### Tests for User Story 3

- [ ] T051 [P] [US3] Unit test for navigation configuration in `tests/unit/lib/config/navigation.test.ts`
- [ ] T052 [P] [US3] Unit test for Sidebar component with different roles in `tests/unit/components/layout/Sidebar.test.tsx`
- [ ] T053 [P] [US3] Integration test for role-based navigation rendering in `tests/integration/navigation.test.ts`
- [ ] T054 [P] [US3] E2E test for role-based sidebar functionality in `tests/e2e/navigation.spec.ts`
- [ ] T055 [P] [US3] Visual test for layout components consistency in `tests/visual/layout.spec.ts`

### Implementation for User Story 3

- [ ] T056 [P] [US3] Create Sidebar component with role-based navigation in `src/components/layout/Sidebar.tsx`
- [ ] T057 [P] [US3] Create Header component with user menu and branding in `src/components/layout/Header.tsx`
- [ ] T058 [P] [US3] Create UserMenu dropdown component in `src/components/layout/UserMenu.tsx`
- [ ] T059 [P] [US3] Create navigation state management hook in `src/hooks/useNavigation.tsx`
- [ ] T060 [P] [US3] Create Logo component for Village Manager branding in `src/components/ui/Logo.tsx`
- [ ] T061 [US3] Integrate Sidebar and Header into protected layout
- [ ] T062 [US3] Implement role-based menu filtering logic
- [ ] T063 [US3] Add active route highlighting in sidebar navigation
- [ ] T064 [US3] Add user info display at bottom of sidebar
- [ ] T065 [US3] Implement logout functionality in user menu
- [ ] T066 [US3] Style sidebar and header with VMP design system
- [ ] T067 [US3] Add notification icon placeholder in header

**Checkpoint**: Role-based navigation working - different roles see appropriate menu items

---

## Phase 6: User Story 4 - Responsive Layout Experience (Priority: P4)

**Goal**: System adapts layout appropriately for mobile, tablet, and desktop with collapsible sidebar while maintaining design aesthetics

**Independent Test**: Access system on different screen sizes and verify responsive behavior with collapsible sidebar while maintaining design consistency

### Tests for User Story 4

- [ ] T068 [P] [US4] Unit test for responsive layout utilities in `tests/unit/hooks/useLayout.test.tsx`
- [ ] T069 [P] [US4] E2E test for mobile responsive functionality in `tests/e2e/responsive.spec.ts`
- [ ] T070 [P] [US4] E2E test for sidebar collapse/expand behavior in `tests/e2e/sidebar.spec.ts`
- [ ] T071 [P] [US4] [DR] Visual test for responsive design compliance in `tests/visual/responsive.spec.ts`

### Implementation for User Story 4

- [ ] T072 [P] [US4] Create layout state management hook in `src/hooks/useLayout.tsx`
- [ ] T073 [P] [US4] Create MobileNavigation component in `src/components/layout/MobileNavigation.tsx`
- [ ] T074 [P] [US4] Add responsive breakpoint utilities in `src/lib/utils/responsive.ts`
- [ ] T075 [P] [US4] [DR] Implement login page responsive behavior matching design reference
- [ ] T076 [US4] Implement sidebar collapse/expand functionality
- [ ] T077 [US4] Add mobile hamburger menu integration
- [ ] T078 [US4] Implement responsive layout adjustments for tablet and mobile
- [ ] T079 [US4] Add smooth animations for sidebar transitions
- [ ] T080 [US4] Optimize touch interactions for mobile devices
- [ ] T081 [US4] [DR] Test and refine responsive breakpoints to match design patterns

**Checkpoint**: All responsive functionality working - system adapts to all screen sizes with design consistency

---

## Phase 7: Design Reference Integration & Polish

**Purpose**: Ensure complete design compliance and cross-cutting improvements

- [ ] T082 [P] [DR] Conduct comprehensive visual comparison with design/login.html in `tests/visual/design-compliance.spec.ts`
- [ ] T083 [P] [DR] Create design reference documentation in `docs/design-integration.md`
- [ ] T084 [P] Add comprehensive error boundaries in `src/components/ErrorBoundary.tsx`
- [ ] T085 [P] [DR] Implement SocialAuth component placeholders matching design in `src/app/(auth)/login/components/SocialAuth.tsx`
- [ ] T086 [P] Implement toast notification system in `src/components/ui/Toast.tsx`
- [ ] T087 [P] Add loading spinners and skeleton states throughout application
- [ ] T088 [P] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T089 [P] [DR] Optimize font loading (Inter) and icon assets for performance
- [ ] T090 [P] Optimize bundle size and implement code splitting
- [ ] T091 [P] Add security headers and CSRF protection
- [ ] T092 [P] Performance optimization for navigation and authentication
- [ ] T093 [P] Add comprehensive logging for debugging and monitoring
- [ ] T094 [P] [DR] Create style guide documentation matching design reference patterns
- [ ] T095 [P] Create development setup documentation in `README.md`
- [ ] T096 [P] Add production Docker configuration
- [ ] T097 [P] Implement session persistence and refresh logic
- [ ] T098 Run final integration tests across all user stories
- [ ] T099 [DR] Validate design reference compliance checklist
- [ ] T100 Validate all acceptance criteria from specification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Design Integration & Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 authentication but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US1 authentication, independently testable
- **User Story 4 (P4)**: Depends on US3 completion for layout components, can be developed in parallel with design reference integration

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Design Reference (DR) tasks can often run in parallel with functional implementation
- Visual tests should be written after basic implementation to validate design compliance
- UI components before integration
- Core functionality before styling enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1-3 can start in parallel
- User Story 4 can start once User Story 3 layout components are available
- Design Reference [DR] tasks can often run parallel to functional implementation
- All tests for a user story marked [P] can run in parallel
- UI components within a story marked [P] can run in parallel
- Visual regression tests can run in parallel across different stories

---

## Parallel Example: User Story 1 (Enhanced with Design Reference)

```bash
# Launch all tests for User Story 1 together:
Task: "Visual regression test for login page layout in tests/visual/login-design.spec.ts"
Task: "Unit test for login form validation in tests/unit/components/auth/LoginForm.test.tsx"
Task: "Integration test for Supabase authentication flow in tests/integration/auth-flow.test.ts"
Task: "E2E test for complete login to dashboard journey in tests/e2e/login.spec.ts"

# Launch parallel UI components for User Story 1:
Task: "Create login page main container matching design structure in src/app/(auth)/login/page.tsx"
Task: "Create BrandingArea component (right column) in src/app/(auth)/login/components/BrandingArea.tsx"
Task: "Create login page auth layout in src/app/(auth)/layout.tsx"
Task: "Create dashboard placeholder page in src/app/(protected)/dashboard/page.tsx"

# Design Reference specific tasks can run parallel:
Task: "Apply VMP color palette to design reference structure"
Task: "Update branding from 'Tenant Management' to 'Village Manager'"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only with Design Compliance)

1. Complete Phase 1: Setup (including design reference analysis)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (with design reference integration)
4. **STOP and VALIDATE**: Test User Story 1 independently + verify design compliance
5. Deploy/demo basic authentication system with design-compliant UI

### Incremental Delivery (Design-Enhanced)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate design compliance → Deploy/Demo (Design-Compliant Login MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Multi-tenant system with design consistency)
4. Add User Story 3 → Test independently → Deploy/Demo (Role-based navigation)
5. Add User Story 4 → Test independently → Deploy/Demo (Mobile responsive with design consistency)
6. Design Integration & Polish → Final production system with full design compliance

### Parallel Team Strategy (Design-Enhanced)

With multiple developers:

1. Team completes Setup + Foundational together (T001-T021)
2. Once Foundational is done:
   - Developer A: User Story 1 functional implementation (T026-T032)
   - Developer B: User Story 1 design integration (T033-T038)
   - Developer C: User Story 2 preparation (T043-T045)
3. Design specialist can work on visual tests and design compliance throughout
4. Stories integrate smoothly due to shared foundation and design system

---

## Design Reference Integration Points

### Visual Compliance Validation
- **T022**: Visual regression testing ensures pixel-perfect compliance
- **T041**: Tenant selector integration maintains design consistency
- **T055**: Layout components follow design patterns
- **T071**: Responsive behavior matches design reference
- **T082**: Comprehensive design compliance verification

### Design-to-Implementation Mapping
- **design/login.html** → **src/app/(auth)/login/page.tsx** (main structure)
- **Left column form** → **LoginForm.tsx** component
- **Right column branding** → **BrandingArea.tsx** component
- **Social auth buttons** → **SocialAuth.tsx** placeholders
- **Design colors** → **VMP color palette** migration

### Key Files and Components (Design-Enhanced)

#### Authentication System (Design-Integrated)
- `src/app/(auth)/login/page.tsx` - Main login page matching design structure
- `src/app/(auth)/login/components/LoginForm.tsx` - Form section with design styling
- `src/app/(auth)/login/components/BrandingArea.tsx` - Branding section adapted for VMP
- `src/components/auth/AuthProvider.tsx` - Authentication context

#### Layout System
- `src/components/layout/Sidebar.tsx` - Role-based navigation sidebar
- `src/components/layout/Header.tsx` - Top header with user menu
- `src/lib/config/navigation.ts` - Role to menu mapping
- `src/hooks/useNavigation.tsx` - Navigation state management

#### Design Reference System
- `design/login.html` - Source design reference
- `src/styles/design-reference.css` - Converted design styles
- `src/lib/utils/design.ts` - Design-to-VMP conversion utilities
- `tests/visual/` - Visual regression test suite

#### Multi-tenancy
- `src/lib/utils/tenant.ts` - Tenant detection utilities
- `src/components/auth/TenantSelector.tsx` - Tenant selection UI (design-integrated)
- `src/hooks/useTenant.tsx` - Tenant context management

#### Responsive Design (Design-Compliant)
- `src/components/layout/MobileNavigation.tsx` - Mobile navigation
- `src/hooks/useLayout.tsx` - Layout state management
- `src/lib/utils/responsive.ts` - Responsive utilities matching design patterns

---

## Notes

- [P] tasks = different files, no dependencies
- [DR] tasks = Design Reference specific implementations
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Design compliance validated at each checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently and design compliance
- All components follow VMP design system adapted from design reference
- Multi-tenant data isolation enforced at all levels
- Role-based access control implemented throughout
- Mobile-first responsive design approach matching design patterns
- Visual regression testing ensures ongoing design compliance