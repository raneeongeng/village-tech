# Implementation Plan Request

## Feature Overview
Implement household management system for head administrators with three main components:
1. **Active Households Page** - View and manage approved households
2. **Pending Households Page** - Review and approve/reject household applications
3. **Add New Household Modal** - Create new household with head and members

## Specification Reference
Full specification available at: `household-management-implementation.md`

## Key Requirements

### Pages to Build
1. `/active-households` - Table view of active/inactive households with search, pagination, and toggle status
2. `/household-approvals` - Table view of pending applications with approve/reject actions
3. Modal component for adding new households with multi-step form

### Data Models
- **households** table: id, tenant_id, household_head_id, address, status_id, approved_by, approved_at
- **household_members** table: id, household_id, name (full), relationship_id, contact_info (JSONB), is_primary
- **lookup_values**: Statuses (active, inactive, pending_approval), Relationships (head, spouse, child, parent, relative, tenant)

### Form Fields Breakdown
**Address**: Lot Number + Street (combined as "Lot X, Street Name")
**Household Head**: First Name, Middle Name, Last Name, Suffix, Phone, Email, Password
**Additional Members (optional)**: Same name fields + Relationship dropdown + Phone/Email (optional)
**No Documents**: Document upload section removed per requirements

### Technical Approach
- Use existing `useAuth` hook for user/tenant context
- Create custom hooks: `useHouseholds`, `usePendingHouseholds`, `useHouseholdActions`, `useCreateHousehold`
- Reusable components: Table, Row, Modals (Approval, Rejection, Add)
- Form validation: Client-side + server-side
- Multi-step transaction: Auth user → User record → Household → Head member → Additional members
- Error handling with rollback if any step fails

### User Flow for Adding Household
1. Admin clicks "Add Household" button
2. Modal opens with 3 sections: Household Info, Household Head, Members (optional)
3. Fill required fields (lot, street, head name, contact, password)
4. Optionally add family members with relationships
5. Submit creates:
   - Supabase Auth user account
   - User record in users table
   - Household record (status: pending_approval)
   - Household head member record
   - Additional member records
6. Success: Show toast, close modal, refresh or redirect to pending page
7. Error: Show message, rollback changes

### Approval Flow
1. Admin views pending households table
2. Clicks "Approve" on a household row
3. Confirmation modal appears
4. On confirm: Update status to active, set approved_by and approved_at
5. Show success toast, refresh table

### UI Design Notes
- Color palette: Primary #22574A (green), not #1791cf (blue from design files)
- Material Symbols Outlined icons
- Responsive tables (hide columns on mobile/tablet)
- Skeleton loaders for loading states
- Empty states with friendly messages
- Pagination with 10 items per page

### Security Requirements
- RLS policies: Tenant isolation enforced
- Only admin_head and admin_officer can access these pages
- Validate tenant_id matches logged-in admin
- Prevent duplicate emails
- Sanitize inputs to prevent XSS/SQL injection
- Transaction rollback on failure

### Testing Needs
- Unit tests for hooks and components
- Integration tests for approval/rejection flows
- Manual testing on mobile devices
- Accessibility testing with screen reader

## Questions for Planning
1. Should we implement all three components in parallel or sequentially?
2. Do we need to create database functions for the multi-step household creation, or handle it in application code?
3. Should rejection delete the household or change status to "rejected" (new status)?
4. Do we need email notifications for approval/rejection, or save for Phase 2?
5. Should the modal be a separate route or overlay on the active households page?

## Success Criteria
- [ ] Admin can view list of active households with search and pagination
- [ ] Admin can toggle household status between active/inactive
- [ ] Admin can add new household with head and optional members
- [ ] New household creates user account that can log in
- [ ] Admin can view pending applications
- [ ] Admin can approve household (changes status, sets approved_by/approved_at)
- [ ] Admin can reject household (deletes or marks rejected)
- [ ] All forms have proper validation and error messages
- [ ] Responsive design works on mobile and tablet
- [ ] RLS policies prevent unauthorized access

## Out of Scope (Phase 2)
- Bulk approve/reject operations
- Export to CSV/Excel
- Advanced filtering (date range, custom filters)
- Household detail/edit page
- Email/SMS notifications
- Document upload for applications
- Audit log UI

## Constraints
- No new database migrations (use existing schema from migrations 001-025)
- No new npm packages (use existing: Next.js, React, TypeScript, Tailwind, Supabase)
- Must integrate with existing layout (header, sidebar)
- Must follow existing project structure and naming conventions
