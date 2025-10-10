# Tasks: Login Page and Post-Login Layout

**Input**: Design documents from `.specify/specs/001-login-and-layout/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), constitution.md

**Tests**: Tests are OPTIONAL for this feature. Unit and E2E tests will be included for quality assurance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App Router**: `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`
- **Testing**: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- **Configuration**: Root-level config files

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Initialize Next.js 14+ project with TypeScript and App Router in repository root
- [ ] T002 [P] Install and configure TailwindCSS with VMP color palette and typography in `tailwind.config.ts`
- [ ] T003 [P] Install dependencies: React Hook Form, Zod, Supabase, lucide-react in `package.json`
- [ ] T004 [P] Configure ESLint and Prettier for code quality in `.eslintrc.js` and `.prettierrc`
- [ ] T005 [P] Create Docker development environment with `Dockerfile` and `docker-compose.yml`
- [ ] T006 [P] Set up environment variables template in `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Initialize Supabase client configuration in `src/lib/supabase/client.ts`
- [ ] T008 [P] Create base TypeScript types for User, Tenant, Role, Session in `src/types/auth.ts`
- [ ] T009 [P] Create authentication utilities and helpers in `src/lib/auth.ts`
- [ ] T010 [P] Set up role definitions and permissions in `src/lib/config/roles.ts`
- [ ] T011 [P] Create navigation configuration mapping roles to menu items in `src/lib/config/navigation.ts`
- [ ] T012 [P] Set up form validation schemas with Zod in `src/lib/validations/auth.ts`
- [ ] T013 [P] Create base UI components (Button, Input, Card) in `src/components/ui/`
- [ ] T014 [P] Configure TailwindCSS globals and component styles in `src/app/globals.css`
- [ ] T015 Create Next.js middleware for route protection in `middleware.ts`
- [ ] T016 [P] Set up authentication context and provider in `src/components/auth/AuthProvider.tsx`
- [ ] T017 [P] Create authentication hooks in `src/hooks/useAuth.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Login Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can visit login page, enter credentials, and be redirected to dashboard after successful authentication

**Independent Test**: Navigate to login page, enter valid email/password, verify redirect to dashboard with "Coming Soon" message

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [P] [US1] Unit test for login form validation in `tests/unit/components/auth/LoginForm.test.tsx`
- [ ] T019 [P] [US1] Integration test for Supabase authentication flow in `tests/integration/auth-flow.test.ts`
- [ ] T020 [P] [US1] E2E test for complete login to dashboard journey in `tests/e2e/login.spec.ts`

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create login page layout in `src/app/(auth)/layout.tsx`
- [ ] T022 [P] [US1] Create login page component in `src/app/(auth)/login/page.tsx`
- [ ] T023 [US1] Implement LoginForm component with React Hook Form in `src/components/auth/LoginForm.tsx`
- [ ] T024 [US1] Add form validation and error handling to LoginForm component
- [ ] T025 [US1] Integrate Supabase authentication in LoginForm component
- [ ] T026 [P] [US1] Create dashboard placeholder page in `src/app/(protected)/dashboard/page.tsx`
- [ ] T027 [P] [US1] Create protected routes layout in `src/app/(protected)/layout.tsx`
- [ ] T028 [US1] Implement redirect logic after successful authentication
- [ ] T029 [US1] Add loading states and error handling for authentication
- [ ] T030 [US1] Style login page with TailwindCSS according to VMP design system

**Checkpoint**: At this point, User Story 1 should be fully functional - users can log in and see dashboard

---

## Phase 4: User Story 2 - Multi-Tenant Context Detection (Priority: P2)

**Goal**: System automatically detects tenant from subdomain or provides tenant selection for authentication

**Independent Test**: Access different subdomains and verify tenant context is detected and used for authentication

### Tests for User Story 2

- [ ] T031 [P] [US2] Unit test for tenant detection utilities in `tests/unit/lib/tenant.test.ts`
- [ ] T032 [P] [US2] Integration test for multi-tenant authentication in `tests/integration/multi-tenant.test.ts`
- [ ] T033 [P] [US2] E2E test for subdomain-based tenant detection in `tests/e2e/multi-tenant.spec.ts`

### Implementation for User Story 2

- [ ] T034 [P] [US2] Create tenant detection utilities in `src/lib/utils/tenant.ts`
- [ ] T035 [P] [US2] Create tenant context and provider in `src/hooks/useTenant.tsx`
- [ ] T036 [P] [US2] Create TenantSelector component in `src/components/auth/TenantSelector.tsx`
- [ ] T037 [US2] Integrate tenant detection into login flow
- [ ] T038 [US2] Update authentication to include tenant context
- [ ] T039 [US2] Add tenant validation and error handling
- [ ] T040 [US2] Update middleware to handle tenant context
- [ ] T041 [US2] Style tenant selector with VMP design system

**Checkpoint**: Multi-tenant authentication working - different tenants can authenticate independently

---

## Phase 5: User Story 3 - Role-Based Layout Rendering (Priority: P3)

**Goal**: After login, users see sidebar navigation with menu items appropriate to their role permissions

**Independent Test**: Log in with different role accounts and verify sidebar shows correct menu items for each role

### Tests for User Story 3

- [ ] T042 [P] [US3] Unit test for navigation configuration in `tests/unit/lib/config/navigation.test.ts`
- [ ] T043 [P] [US3] Unit test for Sidebar component with different roles in `tests/unit/components/layout/Sidebar.test.tsx`
- [ ] T044 [P] [US3] Integration test for role-based navigation rendering in `tests/integration/navigation.test.ts`
- [ ] T045 [P] [US3] E2E test for role-based sidebar functionality in `tests/e2e/navigation.spec.ts`

### Implementation for User Story 3

- [ ] T046 [P] [US3] Create Sidebar component with role-based navigation in `src/components/layout/Sidebar.tsx`
- [ ] T047 [P] [US3] Create Header component with user menu and branding in `src/components/layout/Header.tsx`
- [ ] T048 [P] [US3] Create UserMenu dropdown component in `src/components/layout/UserMenu.tsx`
- [ ] T049 [P] [US3] Create navigation state management hook in `src/hooks/useNavigation.tsx`
- [ ] T050 [US3] Integrate Sidebar and Header into protected layout
- [ ] T051 [US3] Implement role-based menu filtering logic
- [ ] T052 [US3] Add active route highlighting in sidebar navigation
- [ ] T053 [US3] Add user info display at bottom of sidebar
- [ ] T054 [US3] Implement logout functionality in user menu
- [ ] T055 [US3] Style sidebar and header with VMP design system

**Checkpoint**: Role-based navigation working - different roles see appropriate menu items

---

## Phase 6: User Story 4 - Responsive Layout Experience (Priority: P4)

**Goal**: System adapts layout appropriately for mobile, tablet, and desktop with collapsible sidebar

**Independent Test**: Access system on different screen sizes and verify responsive behavior with collapsible sidebar

### Tests for User Story 4

- [ ] T056 [P] [US4] Unit test for responsive layout utilities in `tests/unit/hooks/useLayout.test.tsx`
- [ ] T057 [P] [US4] E2E test for mobile responsive functionality in `tests/e2e/responsive.spec.ts`
- [ ] T058 [P] [US4] E2E test for sidebar collapse/expand behavior in `tests/e2e/sidebar.spec.ts`

### Implementation for User Story 4

- [ ] T059 [P] [US4] Create layout state management hook in `src/hooks/useLayout.tsx`
- [ ] T060 [P] [US4] Create MobileNavigation component in `src/components/layout/MobileNavigation.tsx`
- [ ] T061 [P] [US4] Add responsive breakpoint utilities in `src/lib/utils/responsive.ts`
- [ ] T062 [US4] Implement sidebar collapse/expand functionality
- [ ] T063 [US4] Add mobile hamburger menu integration
- [ ] T064 [US4] Implement responsive layout adjustments for tablet and mobile
- [ ] T065 [US4] Add smooth animations for sidebar transitions
- [ ] T066 [US4] Optimize touch interactions for mobile devices
- [ ] T067 [US4] Test and refine responsive breakpoints

**Checkpoint**: All responsive functionality working - system adapts to all screen sizes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final system hardening

- [ ] T068 [P] Add comprehensive error boundaries in `src/components/ErrorBoundary.tsx`
- [ ] T069 [P] Implement toast notification system in `src/components/ui/Toast.tsx`
- [ ] T070 [P] Add loading spinners and skeleton states throughout application
- [ ] T071 [P] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T072 [P] Optimize bundle size and implement code splitting
- [ ] T073 [P] Add security headers and CSRF protection
- [ ] T074 [P] Performance optimization for navigation and authentication
- [ ] T075 [P] Add comprehensive logging for debugging and monitoring
- [ ] T076 [P] Create development setup documentation in `README.md`
- [ ] T077 [P] Add production Docker configuration
- [ ] T078 [P] Implement session persistence and refresh logic
- [ ] T079 Run final integration tests across all user stories
- [ ] T080 Validate all acceptance criteria from specification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 authentication but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US1 authentication, independently testable
- **User Story 4 (P4)**: Depends on US3 completion for layout components, but can be developed in parallel

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- UI components before integration
- Core functionality before styling
- Individual features before cross-feature integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1-3 can start in parallel
- User Story 4 can start once User Story 3 layout components are available
- All tests for a user story marked [P] can run in parallel
- UI components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for login form validation in tests/unit/components/auth/LoginForm.test.tsx"
Task: "Integration test for Supabase authentication flow in tests/integration/auth-flow.test.ts"
Task: "E2E test for complete login to dashboard journey in tests/e2e/login.spec.ts"

# Launch parallel UI components for User Story 1:
Task: "Create login page layout in src/app/(auth)/layout.tsx"
Task: "Create dashboard placeholder page in src/app/(protected)/dashboard/page.tsx"
Task: "Create protected routes layout in src/app/(protected)/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo basic authentication system

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic Login MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Multi-tenant system)
4. Add User Story 3 → Test independently → Deploy/Demo (Role-based navigation)
5. Add User Story 4 → Test independently → Deploy/Demo (Mobile responsive)
6. Polish → Final production system

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T017)
2. Once Foundational is done:
   - Developer A: User Story 1 (T018-T030)
   - Developer B: User Story 2 (T031-T041)
   - Developer C: User Story 3 (T042-T055)
3. User Story 4 starts after User Story 3 layout components (T046-T048) complete
4. Stories integrate smoothly due to shared foundation

---

## Key Files and Components

### Authentication System
- `src/lib/supabase/client.ts` - Supabase configuration
- `src/components/auth/LoginForm.tsx` - Main login form
- `src/components/auth/AuthProvider.tsx` - Authentication context
- `src/hooks/useAuth.tsx` - Authentication state management

### Layout System
- `src/components/layout/Sidebar.tsx` - Role-based navigation sidebar
- `src/components/layout/Header.tsx` - Top header with user menu
- `src/lib/config/navigation.ts` - Role to menu mapping
- `src/hooks/useNavigation.tsx` - Navigation state management

### Multi-tenancy
- `src/lib/utils/tenant.ts` - Tenant detection utilities
- `src/components/auth/TenantSelector.tsx` - Tenant selection UI
- `src/hooks/useTenant.tsx` - Tenant context management

### Responsive Design
- `src/components/layout/MobileNavigation.tsx` - Mobile navigation
- `src/hooks/useLayout.tsx` - Layout state management
- `src/lib/utils/responsive.ts` - Responsive utilities

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All components follow VMP design system (constitution compliance)
- Multi-tenant data isolation enforced at all levels
- Role-based access control implemented throughout
- Mobile-first responsive design approach