/**
 * TypeScript interfaces for Dashboard data types
 * Based on actual Supabase database schema with normalized lookup tables
 */

// Lookup system interfaces
export interface LookupCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LookupValue {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description?: string;
  color_code?: string;
  icon?: string;
  metadata?: any;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Main entity interfaces
export interface Village {
  id: string;
  name: string;
  status_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // For joins
  status?: LookupValue;
}

export interface User {
  id: string;
  tenant_id: string; // Foreign key to villages
  email: string;
  role_id: string; // Foreign key to lookup_values
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // For joins
  role?: LookupValue;
  village?: Village;
}

export interface Household {
  id: string;
  tenant_id: string; // Foreign key to villages
  household_head_id: string; // Foreign key to users
  address: string;
  status_id: string; // Foreign key to lookup_values
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // For joins
  status?: LookupValue;
  village?: Village;
  household_head?: User;
}

// Dashboard-specific interfaces
export interface DashboardStats {
  totalVillages: number;
  activeTenants: number;
  inactiveTenants: number;
}

export interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface StatsDataState {
  totalVillages: DataState<number>;
  activeTenants: DataState<number>;
  inactiveTenants: DataState<number>;
}

export interface RecentVillagesData {
  data: Village[] | null;
  loading: boolean;
  error: Error | null;
}

export interface RecentHouseholdsData {
  data: Household[] | null;
  loading: boolean;
  error: Error | null;
}

// For tenant data (users with specific roles)
export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  village_id: string;
  village?: Village;
}

// For the StatCard component
export interface StatCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

// For error handling
export interface DashboardError extends Error {
  code?: string;
  type?: 'network' | 'permission' | 'query' | 'timeout';
}

// Helper types for queries
export interface VillageWithStatus extends Village {
  status: LookupValue;
}

export interface HouseholdWithDetails extends Household {
  status: LookupValue;
  village: Village;
  household_head: User & { role: LookupValue };
}