-- Enable RLS and create policies for remaining tables
-- This file covers: vehicle_stickers, construction_permits, delivery_records,
-- incident_reports, security_logs, fee_structures, fee_payments, village_rules

-- =============================================================================
-- VEHICLE STICKERS
-- =============================================================================

ALTER TABLE vehicle_stickers ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all vehicle stickers
CREATE POLICY "superadmin_all_vehicle_stickers_policy" ON vehicle_stickers
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Tenant admins can manage vehicle stickers in their tenant
CREATE POLICY "tenant_admin_manage_vehicle_stickers_policy" ON vehicle_stickers
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Household heads can view and request stickers for their household
CREATE POLICY "household_head_vehicle_stickers_policy" ON vehicle_stickers
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    );

-- Security officers can view active stickers for validation
CREATE POLICY "security_officer_view_vehicle_stickers_policy" ON vehicle_stickers
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = vehicle_stickers.status_id
            AND lv.code = 'active'
        )
    );

-- =============================================================================
-- CONSTRUCTION PERMITS
-- =============================================================================

ALTER TABLE construction_permits ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all construction permits
CREATE POLICY "superadmin_all_construction_permits_policy" ON construction_permits
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Tenant admins can manage construction permits in their tenant
CREATE POLICY "tenant_admin_manage_construction_permits_policy" ON construction_permits
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Household heads can manage permits for their household
CREATE POLICY "household_head_construction_permits_policy" ON construction_permits
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    );

-- Security officers can view approved permits for worker authorization
CREATE POLICY "security_officer_view_construction_permits_policy" ON construction_permits
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = construction_permits.status_id
            AND lv.code IN ('approved', 'in_progress')
        )
    );

-- =============================================================================
-- DELIVERY RECORDS
-- =============================================================================

ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all delivery records
CREATE POLICY "superadmin_all_delivery_records_policy" ON delivery_records
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Tenant admins can view delivery records in their tenant
CREATE POLICY "tenant_admin_view_delivery_records_policy" ON delivery_records
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Security officers can manage delivery records
CREATE POLICY "security_officer_manage_delivery_records_policy" ON delivery_records
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND logged_by = get_current_user_id()
    );

-- Household heads can view and confirm deliveries for their household
CREATE POLICY "household_head_delivery_records_policy" ON delivery_records
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
        -- Household heads can only update delivery confirmation
        AND received_by = get_current_user_id()
    );

-- =============================================================================
-- INCIDENT REPORTS
-- =============================================================================

ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all incident reports
CREATE POLICY "superadmin_all_incident_reports_policy" ON incident_reports
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Tenant admins can manage incident reports in their tenant
CREATE POLICY "tenant_admin_manage_incident_reports_policy" ON incident_reports
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Security officers can view and investigate incident reports
CREATE POLICY "security_officer_incident_reports_policy" ON incident_reports
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND (reported_by = get_current_user_id() OR assigned_to = get_current_user_id())
    );

-- Users can create and view their own incident reports
CREATE POLICY "user_own_incident_reports_policy" ON incident_reports
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND reported_by = get_current_user_id()
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND reported_by = get_current_user_id()
    );

-- =============================================================================
-- SECURITY LOGS
-- =============================================================================

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all security logs
CREATE POLICY "superadmin_all_security_logs_policy" ON security_logs
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Tenant admins can view security logs in their tenant
CREATE POLICY "tenant_admin_view_security_logs_policy" ON security_logs
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Security officers can create and view security logs
CREATE POLICY "security_officer_manage_security_logs_policy" ON security_logs
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND logged_by = get_current_user_id()
    );

-- =============================================================================
-- FEE STRUCTURES
-- =============================================================================

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all fee structures
CREATE POLICY "superadmin_all_fee_structures_policy" ON fee_structures
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Admin heads can manage fee structures in their tenant
CREATE POLICY "admin_head_manage_fee_structures_policy" ON fee_structures
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_head')
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_head')
    );

-- All tenant users can view active fee structures
CREATE POLICY "tenant_users_view_fee_structures_policy" ON fee_structures
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
    );

-- =============================================================================
-- FEE PAYMENTS
-- =============================================================================

ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all fee payments
CREATE POLICY "superadmin_all_fee_payments_policy" ON fee_payments
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Tenant admins can manage fee payments in their tenant
CREATE POLICY "tenant_admin_manage_fee_payments_policy" ON fee_payments
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Household heads can view payments for their household
CREATE POLICY "household_head_view_fee_payments_policy" ON fee_payments
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    );

-- =============================================================================
-- VILLAGE RULES
-- =============================================================================

ALTER TABLE village_rules ENABLE ROW LEVEL SECURITY;

-- Superadmin access to all village rules
CREATE POLICY "superadmin_all_village_rules_policy" ON village_rules
    FOR ALL USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Admin heads can manage village rules in their tenant
CREATE POLICY "admin_head_manage_village_rules_policy" ON village_rules
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_head')
    ) WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_head')
    );

-- All tenant users can view active village rules
CREATE POLICY "tenant_users_view_village_rules_policy" ON village_rules
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND is_active = true
    );

-- Admin officers can view all rules (including inactive) but not modify
CREATE POLICY "admin_officer_view_all_village_rules_policy" ON village_rules
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_officer')
    );