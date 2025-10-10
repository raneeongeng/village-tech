-- Enable RLS and create policies for households table
-- Household access based on tenant isolation and role permissions

-- Enable Row Level Security on households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Policy for superadmins - can manage all households
CREATE POLICY "superadmin_all_households_policy" ON households
    FOR ALL
    USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Policy for tenant admins to manage households in their tenant
CREATE POLICY "tenant_admin_manage_households_policy" ON households
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Policy for household heads to view and update their own household
CREATE POLICY "household_head_own_household_policy" ON households
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND household_head_id = get_current_user_id()
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND household_head_id = get_current_user_id()
        -- Household heads cannot change their approval status
        AND (status_id = (SELECT status_id FROM households WHERE id = households.id) OR EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = households.status_id
            AND lv.code = 'pending_approval'
        ))
    );

-- Policy for security officers to view households for logging purposes
CREATE POLICY "security_officer_view_households_policy" ON households
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = households.status_id
            AND lv.code = 'active'
        )
    );

-- Policy for household creation by admin or self-registration
CREATE POLICY "household_creation_policy" ON households
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND (
            -- Admin can create any household
            current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
            OR
            -- Household head can create their own household
            (household_head_id = get_current_user_id() AND EXISTS (
                SELECT 1 FROM lookup_values lv
                WHERE lv.id = households.status_id
                AND lv.code = 'pending_approval'
            ))
        )
    );

-- Add comments for documentation
COMMENT ON POLICY "superadmin_all_households_policy" ON households IS 'Superadmins can manage all households across all tenants';
COMMENT ON POLICY "tenant_admin_manage_households_policy" ON households IS 'Tenant admins can manage all households within their tenant';
COMMENT ON POLICY "household_head_own_household_policy" ON households IS 'Household heads can manage their own household';
COMMENT ON POLICY "security_officer_view_households_policy" ON households IS 'Security officers can view active households for entry logging';
COMMENT ON POLICY "household_creation_policy" ON households IS 'Households can be created by admins or self-registered by household heads';