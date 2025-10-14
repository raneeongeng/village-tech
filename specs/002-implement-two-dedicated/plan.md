# Implementation Plan: Household Management Pages

**Branch**: `002-implement-two-dedicated` | **Date**: 2025-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-implement-two-dedicated/spec.md`

## Summary

Implement comprehensive household management system for head administrators with three core components: Active Households page for managing approved households, Pending Households page for reviewing and approving applications, and Add New Household modal for creating new applications. The system will leverage existing Next.js 14 App Router architecture with Supabase backend, implementing multi-tenant data isolation and role-based access control according to established platform patterns.

## Technical Context

**Language/Version**: TypeScript with Next.js 14+ App Router, React 18+
**Primary Dependencies**: Supabase JS Client, React Hook Form, TailwindCSS, Material Symbols Outlined
**Storage**: Supabase PostgreSQL with existing tables (households, household_members, users, lookup_values)
**Testing**: Jest for unit tests, React Testing Library for component tests
**Target Platform**: Web application (responsive design for desktop, tablet, mobile)
**Project Type**: Web application (Next.js frontend with Supabase backend)
**Performance Goals**: Page loads <2s, search/filter operations <3s, supports 1000+ households per village
**Constraints**: No new database migrations, use existing schema from migrations 001-025
**Scale/Scope**: 3 new pages/modals, 4 custom hooks, 8 reusable components, multi-tenant isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Technology Stack Compliance**:
- Uses Next.js 14+ App Router with TypeScript ✓
- Integrates with Supabase backend ✓
- Implements multi-tenant architecture with data isolation ✓

✅ **Development Standards Compliance**:
- Uses TailwindCSS for styling and design system ✓
- Implements React Hook Form for all form handling ✓
- Follows existing Docker development environment ✓

✅ **User Experience Compliance**:
- Uses defined color palette (Primary #22574A, etc.) ✓
- Implements Material Symbols Outlined icons ✓
- Follows 8px grid spacing system ✓

✅ **MVP Feature Priority Alignment**:
- Aligns with Priority 2: Household & user management ✓
- Implements role-based access control ✓
- Supports multi-tenant village management ✓

✅ **Security & RBAC Compliance**:
- Implements tenant data isolation ✓
- Enforces admin_head/admin_officer role restrictions ✓
- Includes input validation and audit logging ✓

✅ **Quality Assurance Standards**:
- Implements modular, reusable components ✓
- Uses full TypeScript with strict typing ✓
- Includes comprehensive testing strategy ✓

**Gate Status**: ✅ PASSED - All constitution requirements met

*Re-check after Phase 1 design*: ✅ PASSED
- Technology choices (React Hook Form, Zod, SWR) align with platform standards ✓
- Database functions follow existing Supabase patterns ✓
- Component structure maintains modular architecture ✓
- Multi-tenant isolation preserved in all data operations ✓

## Project Structure

### Documentation (this feature)

```
specs/002-implement-two-dedicated/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   └── (protected)/
│       ├── active-households/
│       │   └── page.tsx                    # Active households page
│       └── household-approvals/
│           └── page.tsx                    # Pending households page (update existing)
├── components/
│   └── households/
│       ├── HouseholdsTable.tsx             # Reusable table component
│       ├── HouseholdRow.tsx                # Individual table row
│       ├── HouseholdActions.tsx            # Action buttons
│       ├── HouseholdStatusBadge.tsx        # Status indicator
│       ├── AddHouseholdModal.tsx           # Main add modal
│       ├── HouseholdInfoForm.tsx           # Address section
│       ├── HouseholdHeadForm.tsx           # Head details section
│       ├── HouseholdMembersForm.tsx        # Members section
│       ├── MembersList.tsx                 # Members preview list
│       ├── ApprovalModal.tsx               # Approve confirmation
│       ├── RejectionModal.tsx              # Reject confirmation
│       └── index.ts                        # Component exports
├── hooks/
│   ├── useHouseholds.ts                    # Active/inactive households
│   ├── usePendingHouseholds.ts             # Pending applications
│   ├── useHouseholdActions.ts              # Approve/reject/toggle
│   └── useCreateHousehold.ts               # Multi-step creation
├── types/
│   └── household.ts                        # TypeScript interfaces
└── lib/
    └── households/
        ├── validation.ts                   # Form validation schemas
        └── utils.ts                        # Helper functions

tests/
├── components/
│   └── households/                         # Component unit tests
├── hooks/                                  # Hook unit tests
├── integration/                            # E2E workflow tests
└── utils/                                  # Utility function tests
```

**Structure Decision**: Web application structure selected based on Next.js App Router pattern with modular component organization. Follows established platform conventions with domain-specific grouping under `/households/` namespace for clear separation of concerns and maintainability.

## Complexity Tracking

*No constitution violations requiring justification*