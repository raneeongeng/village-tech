# Data Model: Household Management Pages

**Date**: 2025-01-10
**Feature**: Household Management Pages

## Entity Overview

The household management system operates on existing database tables with established relationships and constraints. This document defines the data model structure, validation rules, and state transitions used by the feature.

## Core Entities

### Household
Represents a residential unit within a village with approval workflow.

**Fields:**
- `id` (UUID, Primary Key): Unique household identifier
- `tenant_id` (UUID, Foreign Key → villages): Village/tenant isolation
- `household_head_id` (UUID, Foreign Key → users): Primary contact person
- `address` (TEXT): Physical address (10-255 characters)
- `status_id` (UUID, Foreign Key → lookup_values): Approval workflow state
- `approved_by` (UUID, Foreign Key → users, Nullable): Administrator who approved
- `approved_at` (TIMESTAMPTZ, Nullable): Approval timestamp
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last modification timestamp

**Validation Rules:**
- Address must be 10-255 characters
- Status must be valid lookup_value from 'household_statuses' category
- Approval fields (approved_by, approved_at) must be both null or both set
- Household head must exist and belong to same tenant

**Relationships:**
- Belongs to Village (tenant_id → villages.id)
- Has one Household Head (household_head_id → users.id)
- Has many Household Members (households.id ← household_members.household_id)
- Has Status (status_id → lookup_values.id)

### Household Member
Individual person associated with a household, including relationship and contact information.

**Fields:**
- `id` (UUID, Primary Key): Unique member identifier
- `tenant_id` (UUID, Foreign Key → villages): Tenant isolation
- `household_id` (UUID, Foreign Key → households): Parent household
- `user_id` (UUID, Foreign Key → users, Nullable): Associated user account (for heads)
- `name` (TEXT): Full name (2-100 characters)
- `relationship_id` (UUID, Foreign Key → lookup_values): Family relationship
- `contact_info` (JSONB): Phone, email, and other contact details
- `photo_url` (TEXT, Nullable): Profile photo reference
- `is_primary` (BOOLEAN): Indicates household head member
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last modification timestamp

**Validation Rules:**
- Name must be 2-100 characters
- Relationship must be valid lookup_value from 'household_member_relationships' category
- Only one member per household can have is_primary = true
- Contact info must be valid JSON object

**Relationships:**
- Belongs to Village (tenant_id → villages.id)
- Belongs to Household (household_id → households.id)
- May have User Account (user_id → users.id)
- Has Relationship Type (relationship_id → lookup_values.id)

### Household Head (Extended User)
Primary contact person with user account and administrative responsibilities.

**Core User Fields:**
- `id` (UUID, Primary Key): Matches Supabase Auth user ID
- `tenant_id` (UUID, Foreign Key → villages): Village assignment
- `email` (TEXT): Email address (unique globally)
- `first_name` (TEXT): First name (2-50 characters)
- `middle_name` (TEXT, Nullable): Middle name (2-50 characters)
- `last_name` (TEXT): Last name (2-50 characters)
- `suffix` (TEXT, Nullable): Name suffix (Jr., Sr., II, III, IV)
- `role_id` (UUID, Foreign Key → lookup_values): User role
- `is_active` (BOOLEAN): Account status

**Validation Rules:**
- Email must be globally unique across all tenants
- Names must contain only letters and spaces
- Role must be 'household_head' for household heads
- Must belong to same tenant as their household

**Relationships:**
- Belongs to Village (tenant_id → villages.id)
- Has Role (role_id → lookup_values.id)
- Heads Household (users.id ← households.household_head_id)
- Has Member Record (users.id ← household_members.user_id where is_primary = true)

## Lookup Value Categories

### Household Statuses (household_statuses)
Workflow states for household approval process.

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| `pending_approval` | Pending Approval | Awaiting administrative approval | Default for new applications |
| `active` | Active | Approved and can access services | After admin approval |
| `inactive` | Inactive | Temporarily suspended | Manual admin action |

### Household Member Relationships (household_member_relationships)
Family and tenant relationships within households.

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| `head` | Head | Primary household contact | Automatically assigned to household head |
| `spouse` | Spouse | Married partner | Common family member |
| `child` | Child | Son or daughter | Common family member |
| `parent` | Parent | Mother or father | Extended family |
| `relative` | Relative | Other family member | Catch-all for family |
| `tenant` | Tenant | Non-family resident | Rental situations |

## State Transitions

### Household Approval Workflow

```
New Application Creation:
    ┌─────────────────┐
    │ Form Submission │
    └─────────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │ pending_approval │ ← Default status for new households
    └─────────┬───────┘
              │
        ┌─────▼─────┐
        │  Admin    │
        │ Decision  │
        └─────┬─────┘
              │
        ┌─────▼─────┬─────────┐
        │           │         │
        ▼           ▼         ▼
    ┌────────┐ ┌────────┐ ┌─────────┐
    │ active │ │inactive│ │ DELETED │
    │        │ │        │ │ (reject)│
    └────────┘ └────────┘ └─────────┘
```

### Status Management Rules
- **Creation**: New households always start as `pending_approval`
- **Approval**: Only admin_head/admin_officer can change to `active`
- **Suspension**: Active households can be toggled to `inactive`
- **Rejection**: Pending applications are deleted (no "rejected" status)
- **Reactivation**: Inactive households can be toggled back to `active`

## Data Constraints

### Multi-Tenant Isolation
- All queries must include tenant_id filter
- RLS policies enforce automatic tenant boundary checks
- Cross-tenant data access is prevented at database level

### Referential Integrity
- Household deletion requires member cleanup (CASCADE)
- User deletion blocks if they are household head (RESTRICT)
- Status changes must reference valid lookup_values

### Business Rules
- One household per household_head_id
- One primary member per household (is_primary = true)
- Email uniqueness enforced globally across all tenants
- Approval metadata (approved_by, approved_at) must be consistent

## Performance Considerations

### Indexes Required
```sql
-- Search optimization
CREATE INDEX idx_households_search ON households USING gin(to_tsvector('english', address));

-- Status filtering
CREATE INDEX idx_households_status_tenant ON households(status_id, tenant_id);

-- Pagination performance
CREATE INDEX idx_households_created_tenant ON households(tenant_id, created_at DESC);

-- Member lookup
CREATE INDEX idx_household_members_household ON household_members(household_id);
```

### Query Patterns
- **Active Households**: Join with users, lookup_values for display
- **Pending Applications**: Filter by status_id with applicant details
- **Search**: Full-text search on address, household head names
- **Member Management**: Efficient household_id based queries

This data model leverages existing database schema while providing clear validation rules and state management for the household management workflows.