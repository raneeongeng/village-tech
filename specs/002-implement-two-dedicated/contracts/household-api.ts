/**
 * API Contracts: Household Management Pages
 *
 * This file defines TypeScript interfaces and API patterns for household management
 * functionality, including data types, request/response formats, and hook interfaces.
 *
 * Note: This uses Supabase client-side patterns rather than traditional REST endpoints.
 */

// =============================================================================
// DATA TYPES
// =============================================================================

export interface HouseholdStatus {
  id: string
  code: 'pending_approval' | 'active' | 'inactive'
  name: string
  color_code?: string
  icon?: string
}

export interface RelationshipType {
  id: string
  code: 'head' | 'spouse' | 'child' | 'parent' | 'relative' | 'tenant'
  name: string
  sort_order: number
}

export interface HouseholdHead {
  id: string
  email: string
  first_name: string
  middle_name?: string | null
  last_name: string
  suffix?: string | null
  is_active: boolean
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id?: string | null
  name: string
  relationship_id: string
  relationship: RelationshipType
  contact_info: {
    phone?: string
    email?: string
  }
  photo_url?: string | null
  is_primary: boolean
  created_at: string
}

export interface Household {
  id: string
  tenant_id: string
  household_head_id: string
  household_head: HouseholdHead
  address: string
  status_id: string
  status: HouseholdStatus
  approved_by?: string | null
  approved_at?: string | null
  created_at: string
  updated_at: string
  member_count?: number
  members?: HouseholdMember[]
}

// =============================================================================
// FORM DATA TYPES
// =============================================================================

export interface HouseholdMemberFormData {
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  relationshipId: string
  relationshipName: string // For display purposes
  phone?: string
  email?: string
}

export interface NewHouseholdFormData {
  // Address information
  lotNumber: string
  street: string

  // Household head information
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  phone: string
  email: string
  password: string

  // Additional members (optional)
  members: HouseholdMemberFormData[]
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    itemsPerPage: number
  }
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    details?: any
  }
  success: boolean
}

export interface CreateHouseholdResponse {
  household_id: string
  user_id: string
  success: boolean
  error?: string
}

// =============================================================================
// QUERY FILTERS
// =============================================================================

export interface HouseholdFilters {
  search: string
  statusId?: string
  region?: string
  dateFrom?: string
  dateTo?: string
}

export interface TableOptions {
  page: number
  itemsPerPage: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

// =============================================================================
// HOOK CONTRACTS
// =============================================================================

export interface UseHouseholdsOptions {
  villageId?: string
  statusFilter?: 'active' | 'inactive' | 'pending' | 'all'
  filters?: Partial<HouseholdFilters>
  pagination?: Partial<TableOptions>
}

export interface UseHouseholdsResult {
  data: Household[] | null
  loading: boolean
  error: Error | null
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    itemsPerPage: number
  }
  filters: HouseholdFilters
  setFilters: (filters: Partial<HouseholdFilters>) => void
  setPage: (page: number) => void
  refetch: () => Promise<void>
}

export interface UseHouseholdActionsResult {
  approveHousehold: (householdId: string) => Promise<ApiResponse<void>>
  rejectHousehold: (householdId: string, reason?: string) => Promise<ApiResponse<void>>
  toggleHouseholdStatus: (householdId: string, currentStatus: string) => Promise<ApiResponse<void>>
  loading: Record<string, boolean> // Track loading state per household ID
}

export interface UseCreateHouseholdResult {
  createHousehold: (formData: NewHouseholdFormData) => Promise<ApiResponse<CreateHouseholdResponse>>
  loading: boolean
  progress: number // 0-100 for progress indication
  error: Error | null
  reset: () => void
}

export interface UseLookupDataResult {
  householdStatuses: HouseholdStatus[]
  relationshipTypes: RelationshipType[]
  loading: boolean
  error: Error | null
}

// =============================================================================
// SUPABASE QUERY PATTERNS
// =============================================================================

/**
 * Active/Inactive Households Query
 * Used by Active Households page
 */
export const HOUSEHOLDS_QUERY = `
  id,
  tenant_id,
  address,
  created_at,
  updated_at,
  household_head:users!household_head_id (
    id,
    first_name,
    middle_name,
    last_name,
    email,
    is_active
  ),
  status:lookup_values!status_id (
    id,
    code,
    name,
    color_code,
    icon
  ),
  member_count:household_members(count)
` as const

/**
 * Pending Applications Query
 * Used by Pending Households page
 */
export const PENDING_HOUSEHOLDS_QUERY = `
  id,
  tenant_id,
  address,
  created_at,
  household_head:users!household_head_id (
    id,
    first_name,
    middle_name,
    last_name,
    email
  ),
  status:lookup_values!status_id (
    id,
    code,
    name,
    color_code
  )
` as const

/**
 * Household Details Query
 * Used for detailed views
 */
export const HOUSEHOLD_DETAILS_QUERY = `
  id,
  tenant_id,
  address,
  approved_by,
  approved_at,
  created_at,
  updated_at,
  household_head:users!household_head_id (
    id,
    first_name,
    middle_name,
    last_name,
    suffix,
    email,
    is_active
  ),
  status:lookup_values!status_id (
    id,
    code,
    name,
    color_code,
    icon
  ),
  members:household_members (
    id,
    name,
    contact_info,
    photo_url,
    is_primary,
    relationship:lookup_values!relationship_id (
      id,
      code,
      name
    )
  )
` as const

// =============================================================================
// DATABASE FUNCTION SIGNATURES
// =============================================================================

/**
 * PostgreSQL function for atomic household creation
 * Created during implementation phase
 */
export interface CreateHouseholdFunctionParams {
  household_data: {
    tenant_id: string
    address: string
    status_id: string
  }
  head_user_data: {
    auth_user_id: string
    email: string
    role_id: string
    first_name: string
    middle_name?: string
    last_name: string
    suffix?: string
  }
  member_data: Array<{
    name: string
    relationship_id: string
    contact_info: {
      phone?: string
      email?: string
    }
    is_primary: boolean
  }>
}

// =============================================================================
// COMPONENT PROP INTERFACES
// =============================================================================

export interface HouseholdsTableProps {
  data: Household[]
  loading?: boolean
  error?: Error | null
  type: 'active' | 'pending'
  onViewDetails: (householdId: string) => void
  onApprove?: (householdId: string) => void
  onReject?: (householdId: string) => void
  onToggleStatus?: (householdId: string, currentStatus: string) => void
}

export interface AddHouseholdModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (household: Household) => void
}

export interface ApprovalModalProps {
  isOpen: boolean
  household: {
    id: string
    address: string
    household_head: HouseholdHead
  } | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export interface RejectionModalProps {
  isOpen: boolean
  household: {
    id: string
    address: string
    household_head: HouseholdHead
  } | null
  onConfirm: (reason?: string) => void
  onCancel: () => void
  loading?: boolean
}

// =============================================================================
// VALIDATION SCHEMAS (ZOD PATTERNS)
// =============================================================================

/**
 * These represent the structure for Zod schemas
 * Actual schemas will be implemented using zod library
 */
export interface ValidationSchemas {
  householdInfo: {
    lotNumber: string // min: 1, max: 20, alphanumeric
    street: string // min: 2, max: 100
  }

  householdHead: {
    firstName: string // min: 2, max: 50, letters only
    middleName?: string // min: 2, max: 50, letters only
    lastName: string // min: 2, max: 50, letters only
    suffix?: string // max: 10
    phone: string // valid phone format
    email: string // valid email, unique check
    password: string // min: 8, complexity rules
  }

  householdMember: {
    firstName: string // min: 2, max: 50
    middleName?: string // min: 2, max: 50
    lastName: string // min: 2, max: 50
    suffix?: string // max: 10
    relationshipId: string // must exist in lookup_values
    phone?: string // valid phone format
    email?: string // valid email format
  }
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export type HouseholdErrorType =
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_EMAIL'
  | 'AUTH_ERROR'
  | 'DATABASE_ERROR'
  | 'PERMISSION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export interface HouseholdError {
  type: HouseholdErrorType
  message: string
  field?: string
  details?: any
}

// =============================================================================
// AUDIT TYPES
// =============================================================================

export interface HouseholdAuditEvent {
  id: string
  household_id: string
  action: 'created' | 'approved' | 'rejected' | 'status_changed' | 'updated'
  performed_by: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  reason?: string
  timestamp: string
}