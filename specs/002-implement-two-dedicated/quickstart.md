# Quickstart Guide: Household Management Pages

**Date**: 2025-01-10
**Feature**: Household Management Pages

## Overview

This guide provides a step-by-step implementation roadmap for the Household Management Pages feature. The feature consists of three main components that work together to provide comprehensive household administration.

## Implementation Order

### Phase 1: Foundation (P1 - Core Infrastructure)
**Estimated Effort**: 1-2 days

1. **Database Functions** (Required for all subsequent phases)
   - Create PostgreSQL functions in `contracts/database-functions.sql`
   - Test atomic household creation with rollback scenarios
   - Verify email uniqueness checking

2. **TypeScript Interfaces** (Shared across all components)
   - Implement contracts from `contracts/household-api.ts`
   - Create shared types in `src/types/household.ts`
   - Set up validation schemas with Zod

3. **Base Hooks** (Data layer foundation)
   - Create `src/hooks/useLookupData.ts` for statuses and relationships
   - Implement SWR caching for lookup values
   - Test tenant isolation and RLS policies

### Phase 2: Active Households Management (P1 - High Priority)
**Estimated Effort**: 2-3 days

1. **Data Layer**
   - Create `src/hooks/useHouseholds.ts` with server-side pagination
   - Implement search, filtering, and URL state management
   - Add `src/hooks/useHouseholdActions.ts` for status management

2. **UI Components**
   - Build `src/components/common/ResponsiveTable.tsx` (reusable)
   - Create `src/components/households/HouseholdTable.tsx`
   - Add `src/components/households/HouseholdStatusBadge.tsx`

3. **Page Implementation**
   - Create `src/app/(protected)/active-households/page.tsx`
   - Add search/filter interface
   - Implement pagination controls
   - Test responsive behavior on mobile devices

### Phase 3: Pending Household Approvals (P1 - High Priority)
**Estimated Effort**: 1-2 days

1. **Data Layer**
   - Create `src/hooks/usePendingHouseholds.ts`
   - Implement approval/rejection actions in `useHouseholdActions`

2. **UI Components**
   - Build `src/components/households/ApprovalModal.tsx`
   - Create `src/components/households/RejectionModal.tsx`
   - Modify HouseholdTable for pending-specific actions

3. **Page Implementation**
   - Update `src/app/(protected)/household-approvals/page.tsx`
   - Test approval workflow end-to-end
   - Verify proper state updates and notifications

### Phase 4: Household Creation Modal (P2 - Secondary Priority)
**Estimated Effort**: 3-4 days

1. **Form Components**
   - Create `src/components/households/AddHouseholdModal.tsx`
   - Build `src/components/households/HouseholdInfoForm.tsx`
   - Implement `src/components/households/HouseholdHeadForm.tsx`
   - Add `src/components/households/HouseholdMembersForm.tsx`

2. **Data Layer**
   - Create `src/hooks/useCreateHousehold.ts` with multi-step transaction
   - Implement email validation and duplicate checking
   - Add form state management with React Hook Form

3. **Integration**
   - Integrate modal into Active Households page
   - Test complete creation workflow
   - Verify error handling and rollback scenarios

## Key Implementation Details

### File Structure
```
src/
├── app/(protected)/
│   ├── active-households/page.tsx          # Phase 2
│   └── household-approvals/page.tsx        # Phase 3 (update existing)
├── components/
│   ├── common/
│   │   ├── ResponsiveTable.tsx             # Phase 2
│   │   └── Pagination.tsx                  # Phase 2
│   └── households/
│       ├── HouseholdTable.tsx              # Phase 2
│       ├── HouseholdStatusBadge.tsx        # Phase 2
│       ├── HouseholdActions.tsx            # Phase 2
│       ├── AddHouseholdModal.tsx           # Phase 4
│       ├── HouseholdInfoForm.tsx           # Phase 4
│       ├── HouseholdHeadForm.tsx           # Phase 4
│       ├── HouseholdMembersForm.tsx        # Phase 4
│       ├── ApprovalModal.tsx               # Phase 3
│       └── RejectionModal.tsx              # Phase 3
├── hooks/
│   ├── useLookupData.ts                    # Phase 1
│   ├── useHouseholds.ts                    # Phase 2
│   ├── usePendingHouseholds.ts             # Phase 3
│   ├── useHouseholdActions.ts              # Phase 2-3
│   └── useCreateHousehold.ts               # Phase 4
├── types/
│   └── household.ts                        # Phase 1
└── lib/
    └── validation/
        └── household.ts                    # Phase 1 (Zod schemas)
```

### Critical Dependencies
- **Database functions must be created first** - All phases depend on them
- **Lookup data hook** - Required for status/relationship dropdowns
- **ResponsiveTable component** - Shared by both household pages
- **Household actions hook** - Shared between active and pending pages

### Testing Strategy

**Phase 1 Testing**:
- Unit tests for database functions with mock data
- Test email uniqueness checking
- Verify tenant isolation in lookup data

**Phase 2 Testing**:
- Integration tests for household listing and pagination
- Test search functionality with various terms
- Verify status toggle operations

**Phase 3 Testing**:
- End-to-end approval workflow tests
- Test rejection with cleanup verification
- Verify proper state updates after actions

**Phase 4 Testing**:
- Complete household creation workflow
- Test form validation and error handling
- Verify rollback on transaction failures

## Environment Setup

### Prerequisites
- Existing Next.js 14 App Router setup ✓
- Supabase client configuration ✓
- Material Symbols Outlined font ✓
- TailwindCSS with project color palette ✓

### Required Packages
```bash
# Install validation and form handling
npm install react-hook-form @hookform/resolvers zod

# Install data fetching (if not already installed)
npm install swr

# No additional dependencies needed - use existing packages
```

### Database Setup
1. Run database functions from `contracts/database-functions.sql`
2. Verify RLS policies are active for households and household_members tables
3. Ensure lookup_values contain required statuses and relationships

## Configuration

### Environment Variables
Use existing Supabase configuration - no additional variables needed.

### Route Configuration
Add new routes to existing navigation structure:
- `/active-households` → Active Households page
- `/household-approvals` → Update existing route content

## Success Criteria

### Phase Completion Criteria

**Phase 1 Complete When**:
- All database functions execute without errors
- TypeScript interfaces compile successfully
- Lookup data hook returns correct statuses and relationships

**Phase 2 Complete When**:
- Active households page displays real data with pagination
- Search and filtering work correctly
- Households can be toggled between active/inactive status
- Responsive design works on mobile devices

**Phase 3 Complete When**:
- Pending households page shows applications awaiting approval
- Approval workflow completes successfully with status updates
- Rejection workflow removes applications properly
- Proper confirmation dialogs and loading states

**Phase 4 Complete When**:
- Add household modal opens and displays all form sections
- Complete form submission creates user account and household
- Error handling provides clear feedback and rollback on failures
- Form validation prevents invalid submissions

### Performance Targets
- Page loads complete in <2 seconds
- Search results display in <3 seconds
- Household creation completes in <10 seconds
- Tables support 1000+ households without performance degradation

### Quality Gates
- All TypeScript errors resolved
- Components pass unit tests
- Integration tests verify workflows
- Manual testing covers mobile responsiveness
- RLS policies prevent unauthorized access

## Deployment Considerations

### Database Migration
- Database functions need to be deployed before application code
- Test functions in staging environment first
- Verify RLS policies don't block function execution

### Feature Flags
Consider using feature flags for gradual rollout:
- Phase 2: Enable active households page
- Phase 3: Enable pending approvals functionality
- Phase 4: Enable household creation modal

### Monitoring
- Track household creation success/failure rates
- Monitor page load performance for large datasets
- Alert on database function errors

## Rollback Plan

### Quick Rollback Options
- **Route Level**: Remove new routes from navigation
- **Component Level**: Replace with "Coming Soon" components
- **Database Level**: Drop new functions (preserve existing data)

### Data Safety
- All operations maintain data integrity through transactions
- No existing data is modified - only new records created
- RLS policies prevent cross-tenant data access

This quickstart guide ensures systematic implementation with proper testing at each phase, enabling early delivery of high-priority features while maintaining code quality and system stability.