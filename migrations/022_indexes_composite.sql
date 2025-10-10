-- Create composite indexes for complex filtering scenarios
-- These indexes support multi-column WHERE clauses and ORDER BY operations

-- Enable extensions needed for advanced indexing
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For trigram similarity searches
CREATE EXTENSION IF NOT EXISTS btree_gin; -- For multi-column GIN indexes

-- =============================================================================
-- ADMIN DASHBOARD COMPOSITE INDEXES
-- =============================================================================

-- Admin dashboard: household management with complex filtering
CREATE INDEX IF NOT EXISTS idx_households_admin_dashboard
ON households(tenant_id, status_id, created_at DESC, approved_at DESC NULLS LAST);

-- Admin dashboard: user management with role and activity filtering
CREATE INDEX IF NOT EXISTS idx_users_admin_dashboard
ON users(tenant_id, role_id, is_active, last_login_at DESC NULLS LAST, created_at DESC);

-- Admin dashboard: incident management with priority filtering
CREATE INDEX IF NOT EXISTS idx_incident_reports_admin_dashboard
ON incident_reports(tenant_id, status_id, severity_id, assigned_to, reported_at DESC);

-- Admin dashboard: construction permit workflow
CREATE INDEX IF NOT EXISTS idx_construction_permits_admin_dashboard
ON construction_permits(tenant_id, status_id, fee_paid, created_at DESC, start_date);

-- =============================================================================
-- SECURITY OFFICER COMPOSITE INDEXES
-- =============================================================================

-- Security dashboard: comprehensive entry/exit tracking
CREATE INDEX IF NOT EXISTS idx_security_logs_officer_dashboard
ON security_logs(tenant_id, timestamp DESC, person_type_id, action_id, logged_by);

-- Security officer: guest pass validation workflow
CREATE INDEX IF NOT EXISTS idx_guest_passes_security_workflow
ON guest_passes(tenant_id, status_id, valid_from, valid_until, logged_by_security);

-- Security officer: delivery management
CREATE INDEX IF NOT EXISTS idx_delivery_records_security_workflow
ON delivery_records(tenant_id, status_id, arrival_time DESC, guard_house_storage, logged_by);

-- Security officer: active permits and authorizations
CREATE INDEX IF NOT EXISTS idx_construction_permits_security_active
ON construction_permits(tenant_id, status_id, start_date, end_date);

-- =============================================================================
-- HOUSEHOLD HEAD MOBILE APP INDEXES
-- =============================================================================

-- Household head: comprehensive household overview
CREATE INDEX IF NOT EXISTS idx_household_overview
ON household_members(household_id, is_primary DESC, relationship_id, name);

-- Household head: guest pass management
CREATE INDEX IF NOT EXISTS idx_guest_passes_household_management
ON guest_passes(household_id, status_id, created_at DESC, valid_until, approved_by_household);

-- Household head: vehicle and permit management
CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_household_management
ON vehicle_stickers(household_id, status_id, expires_at DESC, issued_at DESC);

-- Household head: service requests (permits, deliveries)
CREATE INDEX IF NOT EXISTS idx_construction_permits_household_requests
ON construction_permits(household_id, status_id, created_at DESC, fee_paid, approved_by);

-- =============================================================================
-- FINANCIAL REPORTING INDEXES
-- =============================================================================

-- Financial dashboard: fee collection analytics
CREATE INDEX IF NOT EXISTS idx_fee_payments_financial_dashboard
ON fee_payments(tenant_id, payment_date DESC, fee_structure_id, amount_paid, recorded_by);

-- Financial reports: outstanding fees analysis
CREATE INDEX IF NOT EXISTS idx_fee_structures_outstanding_analysis
ON fee_structures(tenant_id, fee_type_id, is_active, effective_from, amount)
WHERE is_active = true;

-- Financial tracking: household payment history
CREATE INDEX IF NOT EXISTS idx_fee_payments_household_history
ON fee_payments(household_id, payment_date DESC, fee_structure_id, amount_paid);

-- =============================================================================
-- AUDIT AND COMPLIANCE INDEXES
-- =============================================================================

-- Audit trail: comprehensive user activity tracking
CREATE INDEX IF NOT EXISTS idx_audit_user_activity
ON security_logs(logged_by, timestamp DESC, action_id, person_type_id);

-- Audit trail: administrative actions tracking
CREATE INDEX IF NOT EXISTS idx_audit_admin_actions
ON households(tenant_id, approved_by, approved_at DESC, status_id)
WHERE approved_by IS NOT NULL;

-- Compliance: data retention and cleanup
CREATE INDEX IF NOT EXISTS idx_data_retention_cleanup
ON security_logs(tenant_id, timestamp);

-- =============================================================================
-- REAL-TIME NOTIFICATION INDEXES
-- =============================================================================

-- Real-time: pending approvals needing immediate attention
CREATE INDEX IF NOT EXISTS idx_realtime_pending_approvals
ON guest_passes(household_id, status_id, created_at);

-- Real-time: critical incidents requiring immediate response
CREATE INDEX IF NOT EXISTS idx_realtime_critical_incidents
ON incident_reports(tenant_id, severity_id, status_id, reported_at DESC);

-- Real-time: security alerts and monitoring
CREATE INDEX IF NOT EXISTS idx_realtime_security_alerts
ON security_logs(tenant_id, action_id, timestamp DESC);

-- =============================================================================
-- ANALYTICS AND REPORTING INDEXES
-- =============================================================================

-- Analytics: village activity patterns
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_analytics_village_activity
ON security_logs(tenant_id, timestamp, action_id, person_type_id);

-- Analytics: guest visit patterns
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_analytics_guest_patterns
ON guest_passes(tenant_id, created_at, status_id, household_id);

-- Analytics: incident trends and patterns
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_analytics_incident_trends
ON incident_reports(tenant_id, reported_at, incident_type_id, severity_id);

-- Analytics: fee collection patterns
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_analytics_fee_collection
ON fee_payments(tenant_id, payment_date, fee_structure_id);

-- =============================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =============================================================================

-- Performance: large table pagination support
CREATE INDEX IF NOT EXISTS idx_security_logs_pagination
ON security_logs(tenant_id, id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_guest_passes_pagination
ON guest_passes(tenant_id, id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_incident_reports_pagination
ON incident_reports(tenant_id, id, reported_at DESC);

-- Performance: complex JOIN optimization
CREATE INDEX IF NOT EXISTS idx_households_members_join
ON household_members(household_id, tenant_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_guest_passes_households_join
ON guest_passes(household_id, tenant_id, status_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_households_join
ON vehicle_stickers(household_id, tenant_id, status_id);

-- =============================================================================
-- SEARCH PERFORMANCE INDEXES
-- =============================================================================

-- Advanced search: multi-column text search
-- Note: Full-text search indexes require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_incident_reports_advanced_search
-- ON incident_reports USING gin(
--     tenant_id,
--     to_tsvector('english', title || ' ' || description || ' ' || location)
-- );

-- Advanced search: household and member combined search
-- Note: Full-text search indexes require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_household_members_advanced_search
-- ON household_members USING gin(
--     tenant_id,
--     to_tsvector('english', name || ' ' || COALESCE(contact_info->>'phone', ''))
-- );

-- Advanced search: user profile search
-- Note: Full-text search indexes require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_users_advanced_search
-- ON users USING gin(
--     tenant_id,
--     to_tsvector('english', email || ' ' || COALESCE(profile->>'name', ''))
-- );

-- =============================================================================
-- CONSTRAINT PERFORMANCE INDEXES
-- =============================================================================

-- Unique constraint performance: email uniqueness within tenant
-- Note: LOWER() function requires IMMUTABLE - using simple index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email_unique_performance
ON users(tenant_id, email)
WHERE is_active = true;

-- Unique constraint performance: sticker code uniqueness within tenant
-- Note: UPPER() function requires IMMUTABLE - using simple index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_stickers_tenant_code_unique_performance
ON vehicle_stickers(tenant_id, sticker_code, status_id);

-- Unique constraint performance: pass code uniqueness within tenant
-- Note: UPPER() function requires IMMUTABLE - using simple index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_passes_tenant_code_unique_performance
ON guest_passes(tenant_id, pass_code, status_id);

-- Add comments for comprehensive documentation
COMMENT ON INDEX idx_households_admin_dashboard IS 'Composite index for admin household management dashboard';
COMMENT ON INDEX idx_security_logs_officer_dashboard IS 'Composite index for security officer dashboard and monitoring';
COMMENT ON INDEX idx_guest_passes_household_management IS 'Composite index for household head guest pass management';
COMMENT ON INDEX idx_fee_payments_financial_dashboard IS 'Composite index for financial reporting and analytics';
COMMENT ON INDEX idx_audit_user_activity IS 'Composite index for user activity audit trails';
COMMENT ON INDEX idx_realtime_pending_approvals IS 'Composite index for real-time pending approval notifications';
COMMENT ON INDEX idx_analytics_village_activity IS 'Composite index for village activity pattern analytics';
-- COMMENT ON INDEX idx_incident_reports_advanced_search IS 'Advanced GIN index for full-text search on incident reports'; -- Index commented out
COMMENT ON INDEX idx_users_tenant_email_unique_performance IS 'Performance-optimized unique constraint for user emails within tenant';