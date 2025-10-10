-- Create indexes for frequent query patterns
-- Based on common application use cases and user workflows

-- =============================================================================
-- USER AUTHENTICATION AND SESSION INDEXES
-- =============================================================================

-- Fast user lookup by email for authentication
-- Note: LOWER() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_users_email_lowercase
ON users(email);

-- Fast user lookup with last login tracking
CREATE INDEX IF NOT EXISTS idx_users_last_login
ON users(last_login_at DESC NULLS LAST)
WHERE is_active = true;

-- =============================================================================
-- DASHBOARD AND OVERVIEW QUERIES
-- =============================================================================

-- Admin dashboard: pending approvals by tenant
CREATE INDEX IF NOT EXISTS idx_households_pending_approval
ON households(tenant_id, created_at DESC, status_id);

-- Security dashboard: recent entries by tenant
CREATE INDEX IF NOT EXISTS idx_security_logs_recent_entries
ON security_logs(tenant_id, action_id, timestamp DESC);

-- Guest pass dashboard: pending approvals by household
CREATE INDEX IF NOT EXISTS idx_guest_passes_pending_by_household
ON guest_passes(household_id, created_at DESC, status_id);

-- Incident dashboard: open incidents by severity
CREATE INDEX IF NOT EXISTS idx_incident_reports_open_by_severity
ON incident_reports(tenant_id, severity_id, reported_at DESC, status_id);

-- =============================================================================
-- MOBILE APP PERFORMANCE INDEXES
-- =============================================================================

-- Household head mobile app: my household information
CREATE INDEX IF NOT EXISTS idx_household_members_by_household_sorted
ON household_members(household_id, is_primary DESC, name);

-- Household head mobile app: my vehicle stickers
CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_by_household_active
ON vehicle_stickers(household_id, status_id, expires_at DESC);

-- Household head mobile app: my guest passes (recent first)
CREATE INDEX IF NOT EXISTS idx_guest_passes_by_household_recent
ON guest_passes(household_id, created_at DESC);

-- Security officer mobile app: scan sticker validation
CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_by_code_tenant
ON vehicle_stickers(tenant_id, sticker_code, status_id, expires_at);

-- Security officer mobile app: verify guest pass
CREATE INDEX IF NOT EXISTS idx_guest_passes_by_code_tenant
ON guest_passes(tenant_id, pass_code, status_id, valid_until);

-- =============================================================================
-- SEARCH AND FILTERING INDEXES
-- =============================================================================

-- Search households by address (for admin)
-- Note: Full-text search indexes require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_households_address_search
-- ON households USING gin(to_tsvector('english', address));

-- Search household members by name (for admin)
-- Note: Full-text search indexes require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_household_members_name_search
-- ON household_members USING gin(to_tsvector('english', name));

-- Search incident reports by title and description
-- Note: Full-text search indexes require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_incident_reports_text_search
-- ON incident_reports USING gin(to_tsvector('english', title || ' ' || description));

-- Search delivery records by courier name
-- Note: Full-text search indexes require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_delivery_records_courier_search
-- ON delivery_records USING gin(to_tsvector('english', courier_info->>'name'));

-- =============================================================================
-- REPORTING AND ANALYTICS INDEXES
-- =============================================================================

-- Monthly security activity reports
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_security_logs_monthly_reports
ON security_logs(tenant_id, timestamp, action_id);

-- Monthly fee collection reports
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_fee_payments_monthly_reports
ON fee_payments(tenant_id, payment_date, fee_structure_id);

-- Incident reports by month and type
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_incident_reports_monthly_type
ON incident_reports(tenant_id, reported_at, incident_type_id);

-- Guest pass usage analytics
-- Note: date_trunc() function removed due to IMMUTABLE requirement
CREATE INDEX IF NOT EXISTS idx_guest_passes_usage_analytics
ON guest_passes(tenant_id, created_at, status_id);

-- =============================================================================
-- EXPIRY AND CLEANUP INDEXES
-- =============================================================================

-- Find expired vehicle stickers for cleanup
CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_expired
ON vehicle_stickers(expires_at, status_id);

-- Find expired guest passes for cleanup
CREATE INDEX IF NOT EXISTS idx_guest_passes_expired
ON guest_passes(valid_until, status_id);

-- Find overdue construction permits
CREATE INDEX IF NOT EXISTS idx_construction_permits_overdue
ON construction_permits(end_date, status_id);

-- =============================================================================
-- NOTIFICATION INDEXES
-- =============================================================================

-- Find users to notify about pending guest passes
CREATE INDEX IF NOT EXISTS idx_guest_passes_notification_queue
ON guest_passes(household_id, created_at, status_id);

-- Find households with overdue fees
CREATE INDEX IF NOT EXISTS idx_fee_structures_overdue_notification
ON fee_structures(tenant_id, effective_from, frequency_id)
WHERE is_active = true;

-- =============================================================================
-- PERFORMANCE MONITORING INDEXES
-- =============================================================================

-- Track table activity for performance monitoring
CREATE INDEX IF NOT EXISTS idx_users_activity_tracking
ON users(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_households_activity_tracking
ON households(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_passes_activity_tracking
ON guest_passes(updated_at DESC);

-- =============================================================================
-- JSON FIELD INDEXES
-- =============================================================================

-- Index on vehicle info plate numbers for quick lookup
-- Note: JSON operators require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_vehicle_stickers_plate_number
-- ON vehicle_stickers((vehicle_info->>'plate'));

-- Index on guest info names for search
-- Note: JSON operators require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_guest_passes_guest_name
-- ON guest_passes((guest_info->>'name'));

-- Index on user profile names for search (if users table has profile JSONB column)
-- Note: JSON operators require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_users_profile_name
-- ON users((profile->>'name'));

-- Index on household member contact info
-- Note: JSON operators require IMMUTABLE functions - commented out
-- CREATE INDEX IF NOT EXISTS idx_household_members_contact_phone
-- ON household_members((contact_info->>'phone'))
-- WHERE contact_info->>'phone' IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_users_email_lowercase IS 'Email lookup for authentication';
COMMENT ON INDEX idx_households_pending_approval IS 'Fast retrieval of pending household approvals for admin dashboard';
COMMENT ON INDEX idx_security_logs_recent_entries IS 'Fast retrieval of recent security entries for monitoring';
COMMENT ON INDEX idx_guest_passes_pending_by_household IS 'Fast lookup of pending guest passes for household notifications';
COMMENT ON INDEX idx_vehicle_stickers_by_code_tenant IS 'Fast sticker validation for security officers';
COMMENT ON INDEX idx_guest_passes_by_code_tenant IS 'Fast guest pass validation for security officers';
-- COMMENT ON INDEX idx_households_address_search IS 'Full-text search on household addresses'; -- Index commented out
-- COMMENT ON INDEX idx_incident_reports_text_search IS 'Full-text search on incident reports'; -- Index commented out
COMMENT ON INDEX idx_vehicle_stickers_expired IS 'Fast identification of expired vehicle stickers';
COMMENT ON INDEX idx_guest_passes_expired IS 'Fast identification of expired guest passes';