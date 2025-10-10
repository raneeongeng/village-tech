'use client'

export interface VillageSettings {
  description?: string
  address?: string
  contact_phone?: string
  contact_email?: string
  region?: string
  timezone?: string
  currency?: string
  date_format?: string
  notifications_enabled?: boolean
}

export interface LookupValue {
  id: string
  category_id: string
  code: string
  name: string
  color_code?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Village {
  id: string
  name: string
  status_id: string
  settings: VillageSettings
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  status?: LookupValue
  admin_head?: {
    id: string
    first_name: string
    middle_name?: string
    last_name: string
    suffix?: string
    email: string
  }
}

export interface CreateVillageFormData {
  // Step 1: Basic Information
  name: string
  statusId: string
  description?: string

  // Step 2: Details
  address?: string
  contactPhone?: string
  contactEmail?: string
  region?: string

  // Step 3: Settings
  timezone?: string
  currency?: string
  dateFormat?: string
  notificationsEnabled?: boolean

  // Step 4: Admin Head
  adminFirstName: string
  adminMiddleName?: string
  adminLastName: string
  adminSuffix?: string
  adminEmail: string
  adminPassword: string
  adminRoleId: string
}

export interface VillageFilters {
  search: string
  statusId?: string
  region?: string
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
}

export interface VillageListData {
  villages: Village[] | null
  loading: boolean
  error: Error | null
  pagination: PaginationData
  filters: VillageFilters
  refetch: () => Promise<void>
  setFilters: (filters: VillageFilters) => void
  setPage: (page: number) => void
}

export interface CreateVillageResult {
  success: boolean
  village?: Village
  adminHead?: any
  error?: Error
}

export type CreateVillageStep = 1 | 2 | 3 | 4 | 5

export const DEFAULT_VILLAGE_FILTERS: VillageFilters = {
  search: '',
  statusId: '',
  region: '',
}

export const ITEMS_PER_PAGE = 10

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Asia/Manila', label: 'Philippines Time (PHT)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
]

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'PHP', label: 'Philippine Peso (₱)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'SGD', label: 'Singapore Dollar (S$)' },
]

export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

export const REGIONS = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
]