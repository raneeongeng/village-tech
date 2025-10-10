-- Create performance indexes specifically for tenant isolation
-- These indexes are critical for multi-tenant query performance

-- =============================================================================
-- TENANT ISOLATION INDEXES
-- =============================================================================

-- Village Tenants: Primary indexes already created in table definition
-- Additional compound indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_villages_status_name
ON villages(status_id, name);

-- Users: Critical tenant isolation indexes
-- Primary tenant_id index already exists
CREATE INDEX IF NOT EXISTS idx_users_tenant_role_active
ON users(tenant_id, role_id, is_active)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_tenant_email_active
ON users(tenant_id, email)
WHERE is_active = true;

-- Households: Tenant isolation with status filtering
CREATE INDEX IF NOT EXISTS idx_households_tenant_status_approved
ON households(tenant_id, status_id, approved_at);

CREATE INDEX IF NOT EXISTS idx_households_tenant_head
ON households(tenant_id, household_head_id);

-- Household Members: Tenant isolation with household grouping
CREATE INDEX IF NOT EXISTS idx_household_members_tenant_household
ON household_members(tenant_id, household_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_household_members_tenant_user
ON household_members(tenant_id, user_id)
WHERE user_id IS NOT NULL;

-- Vehicle Stickers: Tenant isolation with active status
CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_tenant_active
ON vehicle_stickers(tenant_id, status_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_tenant_household_active
ON vehicle_stickers(tenant_id, household_id, status_id);

-- Guest Passes: Tenant isolation with time-based filtering
CREATE INDEX IF NOT EXISTS idx_guest_passes_tenant_status_valid
ON guest_passes(tenant_id, status_id, valid_until);

CREATE INDEX IF NOT EXISTS idx_guest_passes_tenant_household_status
ON guest_passes(tenant_id, household_id, status_id, valid_until);

-- Construction Permits: Tenant isolation with status filtering
CREATE INDEX IF NOT EXISTS idx_construction_permits_tenant_status
ON construction_permits(tenant_id, status_id, start_date);

CREATE INDEX IF NOT EXISTS idx_construction_permits_tenant_household_active
ON construction_permits(tenant_id, household_id, status_id);

-- Delivery Records: Tenant isolation with completion status
CREATE INDEX IF NOT EXISTS idx_delivery_records_tenant_status
ON delivery_records(tenant_id, status_id, arrival_time);

CREATE INDEX IF NOT EXISTS idx_delivery_records_tenant_household_pending
ON delivery_records(tenant_id, household_id, status_id);

-- Incident Reports: Tenant isolation with severity and status
CREATE INDEX IF NOT EXISTS idx_incident_reports_tenant_severity_status
ON incident_reports(tenant_id, severity_id, status_id, reported_at);

CREATE INDEX IF NOT EXISTS idx_incident_reports_tenant_reporter
ON incident_reports(tenant_id, reported_by, status_id);

-- Security Logs: Tenant isolation with time-based partitioning
CREATE INDEX IF NOT EXISTS idx_security_logs_tenant_timestamp
ON security_logs(tenant_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_logs_tenant_person
ON security_logs(tenant_id, person_type_id, action_id, timestamp DESC);

-- Fee Structures: Tenant isolation with active status
CREATE INDEX IF NOT EXISTS idx_fee_structures_tenant_active
ON fee_structures(tenant_id, is_active, effective_from, effective_until)
WHERE is_active = true;

-- Fee Payments: Tenant isolation with household grouping
CREATE INDEX IF NOT EXISTS idx_fee_payments_tenant_household
ON fee_payments(tenant_id, household_id, payment_date DESC);

-- Village Rules: Tenant isolation with active status
CREATE INDEX IF NOT EXISTS idx_village_rules_tenant_active
ON village_rules(tenant_id, category_id, is_active, effective_from)
WHERE is_active = true;

-- =============================================================================
-- FOREIGN KEY PERFORMANCE INDEXES
-- =============================================================================

-- Indexes to speed up foreign key constraint checks
-- These are especially important for cascading operations

-- Users referenced by many tables
CREATE INDEX IF NOT EXISTS idx_users_id_tenant
ON users(id, tenant_id);

-- Households referenced by many tables
CREATE INDEX IF NOT EXISTS idx_households_id_tenant
ON households(id, tenant_id);

-- Villages referenced by all tables
CREATE INDEX IF NOT EXISTS idx_villages_id
ON villages(id);

-- =============================================================================
-- AUDIT TRAIL INDEXES
-- =============================================================================

-- Indexes for audit trail queries (created_by, updated_by tracking)
CREATE INDEX IF NOT EXISTS idx_users_created_by
ON users(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_households_created_by
ON households(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_issued_by
ON vehicle_stickers(issued_by);

CREATE INDEX IF NOT EXISTS idx_guest_passes_logged_by
ON guest_passes(logged_by_security);

CREATE INDEX IF NOT EXISTS idx_construction_permits_approved_by
ON construction_permits(approved_by) WHERE approved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_delivery_records_logged_by
ON delivery_records(logged_by);

CREATE INDEX IF NOT EXISTS idx_incident_reports_reported_by
ON incident_reports(reported_by);

CREATE INDEX IF NOT EXISTS idx_security_logs_logged_by
ON security_logs(logged_by);

CREATE INDEX IF NOT EXISTS idx_fee_structures_created_by
ON fee_structures(created_by);

CREATE INDEX IF NOT EXISTS idx_fee_payments_recorded_by
ON fee_payments(recorded_by);

CREATE INDEX IF NOT EXISTS idx_village_rules_created_by
ON village_rules(created_by);

-- Add comments for documentation
COMMENT ON INDEX idx_users_tenant_role_active IS 'Fast lookup of active users by tenant and role';
COMMENT ON INDEX idx_households_tenant_status_approved IS 'Fast lookup of approved households by tenant';
COMMENT ON INDEX idx_vehicle_stickers_tenant_active IS 'Fast validation of active vehicle stickers by tenant';
COMMENT ON INDEX idx_guest_passes_tenant_status_valid IS 'Fast lookup of valid guest passes by tenant';
COMMENT ON INDEX idx_security_logs_tenant_timestamp IS 'Fast retrieval of recent security logs by tenant';
COMMENT ON INDEX idx_fee_structures_tenant_active IS 'Fast lookup of active fee structures by tenant';