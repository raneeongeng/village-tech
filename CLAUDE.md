# Village Management Platform Development Guidelines

Auto-generated from all feature plans. **Last updated**: 2025-01-10

## Active Technologies
- TypeScript with Next.js 14+ App Router + React 18+ + TailwindCSS + Supabase (001-define-navigation-paths)
- React Hook Form + Zod validation + SWR data fetching + PostgreSQL functions (002-implement-two-dedicated)

## Project Structure
```
src/
├── app/(protected)/
│   ├── active-households/
│   │   └── page.tsx                    # Household management page
│   └── household-approvals/
│       └── page.tsx                    # Pending approvals page
├── components/
│   ├── navigation/           # Navigation components
│   │   ├── Navigation.tsx    # Main navigation component
│   │   ├── NavigationItem.tsx
│   │   ├── NavigationGroup.tsx
│   │   └── index.ts
│   ├── common/
│   │   ├── ResponsiveTable.tsx         # Reusable table component
│   │   └── Pagination.tsx              # Pagination controls
│   └── households/
│       ├── HouseholdTable.tsx          # Domain-specific table
│       ├── HouseholdStatusBadge.tsx    # Status indicators
│       ├── AddHouseholdModal.tsx       # Creation modal
│       ├── ApprovalModal.tsx           # Approval confirmation
│       └── RejectionModal.tsx          # Rejection confirmation
├── lib/
│   ├── navigation/           # Navigation logic
│   │   ├── navigationConfig.ts    # Role-based navigation definitions
│   │   ├── navigationUtils.ts     # Navigation helper functions
│   │   └── types.ts              # Navigation type definitions
│   └── validation/
│       └── household.ts              # Zod validation schemas
├── hooks/
│   ├── useNavigation.tsx     # Navigation hook
│   ├── useHouseholds.ts              # Household data fetching
│   ├── usePendingHouseholds.ts       # Pending applications
│   ├── useHouseholdActions.ts        # Approve/reject actions
│   ├── useCreateHousehold.ts         # Multi-step creation
│   └── useLookupData.ts              # Status/relationship lookup
└── types/
    ├── navigation.ts         # Navigation TypeScript interfaces
    └── household.ts                  # Household domain types

tests/
├── components/
│   ├── navigation/           # Navigation component tests
│   └── households/                   # Household component tests
├── lib/
│   ├── navigation/           # Navigation logic tests
│   └── validation/                   # Validation schema tests
├── hooks/                            # Hook unit tests
│   ├── useHouseholds.test.ts
│   └── useHouseholdActions.test.ts
└── integration/
    ├── navigation-rbac.test.ts   # Role-based access integration tests
    └── household-workflows.test.ts  # Household approval workflows
```

## Commands
npm test; npm run lint

## Code Style
TypeScript: Follow standard conventions

## Recent Changes
- 001-define-navigation-paths: Added TypeScript with Next.js 14+ App Router + React 18+ + TailwindCSS + Supabase
- 002-implement-two-dedicated: Added household management with React Hook Form, Zod validation, SWR caching, PostgreSQL functions

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->