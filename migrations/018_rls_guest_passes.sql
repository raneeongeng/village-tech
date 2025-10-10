-- Enable RLS and create policies for guest_passes table
-- Guest pass access based on household ownership, security officer logging, and admin oversight

-- Enable Row Level Security on guest_passes
ALTER TABLE guest_passes ENABLE ROW LEVEL SECURITY;

-- Policy for superadmins - can manage all guest passes
CREATE POLICY "superadmin_all_guest_passes_policy" ON guest_passes
    FOR ALL
    USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Policy for tenant admins to view and manage guest passes in their tenant
CREATE POLICY "tenant_admin_manage_guest_passes_policy" ON guest_passes
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Policy for security officers to create and manage guest passes
CREATE POLICY "security_officer_manage_guest_passes_policy" ON guest_passes
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND logged_by_security = get_current_user_id()
    );

-- Policy for household heads to view and approve guest passes for their household
CREATE POLICY "household_head_guest_passes_policy" ON guest_passes
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
        -- Household heads can only approve/reject, not create passes
        AND (
            EXISTS (
                SELECT 1 FROM lookup_values lv
                WHERE lv.id = guest_passes.status_id
                AND lv.code IN ('approved', 'rejected')
            )
            OR approved_by_household = get_current_user_id()
        )
    );

-- Policy for household members to view guest passes for their household
CREATE POLICY "household_member_view_guest_passes_policy" ON guest_passes
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT household_id FROM household_members
            WHERE user_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
    );

-- Policy for guest pass creation by security officers only
CREATE POLICY "security_officer_create_guest_passes_policy" ON guest_passes
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND logged_by_security = get_current_user_id()
        AND EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = guest_passes.status_id
            AND lv.code = 'pending'
        )
        AND approved_by_household IS NULL
    );

-- Policy for household approval updates
CREATE POLICY "household_approval_update_policy" ON guest_passes
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
        AND EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = guest_passes.status_id
            AND lv.code = 'pending'
        )
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND household_id IN (
            SELECT id FROM households
            WHERE household_head_id = get_current_user_id()
            AND tenant_id = get_current_tenant_id()
        )
        AND approved_by_household = get_current_user_id()
        AND EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = guest_passes.status_id
            AND lv.code IN ('approved', 'rejected')
        )
    );

-- Add comments for documentation
COMMENT ON POLICY "superadmin_all_guest_passes_policy" ON guest_passes IS 'Superadmins can manage all guest passes';
COMMENT ON POLICY "tenant_admin_manage_guest_passes_policy" ON guest_passes IS 'Tenant admins can oversee guest pass activity';
COMMENT ON POLICY "security_officer_manage_guest_passes_policy" ON guest_passes IS 'Security officers can create and manage guest passes';
COMMENT ON POLICY "household_head_guest_passes_policy" ON guest_passes IS 'Household heads can approve/reject guest passes for their household';
COMMENT ON POLICY "household_member_view_guest_passes_policy" ON guest_passes IS 'Household members can view guest passes for their household';
COMMENT ON POLICY "security_officer_create_guest_passes_policy" ON guest_passes IS 'Only security officers can create new guest pass requests';
COMMENT ON POLICY "household_approval_update_policy" ON guest_passes IS 'Household heads can approve or reject pending guest passes';