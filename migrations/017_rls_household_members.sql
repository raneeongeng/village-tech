-- Enable RLS and create policies for household_members table
-- Members access based on household ownership and admin permissions

-- Enable Row Level Security on household_members
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Policy for superadmins - can manage all household members
CREATE POLICY "superadmin_all_household_members_policy" ON household_members
    FOR ALL
    USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Policy for tenant admins to manage household members in their tenant
CREATE POLICY "tenant_admin_manage_household_members_policy" ON household_members
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_any_role(ARRAY['admin_head', 'admin_officer'])
    );

-- Policy for household heads to manage members in their household
CREATE POLICY "household_head_manage_members_policy" ON household_members
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
    );

-- Policy for household members to view other members in their household
CREATE POLICY "household_member_view_household_policy" ON household_members
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            -- User is a member of this household
            household_id IN (
                SELECT household_id FROM household_members
                WHERE user_id = get_current_user_id()
                AND tenant_id = get_current_tenant_id()
            )
            OR
            -- User is the household head
            household_id IN (
                SELECT id FROM households
                WHERE household_head_id = get_current_user_id()
                AND tenant_id = get_current_tenant_id()
            )
        )
    );

-- Policy for security officers to view household members for identification
CREATE POLICY "security_officer_view_members_policy" ON household_members
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('security_officer')
        AND household_id IN (
            SELECT h.id FROM households h
            JOIN lookup_values lv ON h.status_id = lv.id
            WHERE lv.code = 'active'
            AND h.tenant_id = get_current_tenant_id()
        )
    );

-- Policy for members to update their own information
CREATE POLICY "member_update_own_info_policy" ON household_members
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND user_id = get_current_user_id()
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND user_id = get_current_user_id()
        -- Members cannot change their household or primary status
        AND household_id = (SELECT household_id FROM household_members WHERE id = household_members.id)
        AND is_primary = (SELECT is_primary FROM household_members WHERE id = household_members.id)
    );

-- Add comments for documentation
COMMENT ON POLICY "superadmin_all_household_members_policy" ON household_members IS 'Superadmins can manage all household members';
COMMENT ON POLICY "tenant_admin_manage_household_members_policy" ON household_members IS 'Tenant admins can manage household members within their tenant';
COMMENT ON POLICY "household_head_manage_members_policy" ON household_members IS 'Household heads can manage members in their household';
COMMENT ON POLICY "household_member_view_household_policy" ON household_members IS 'Household members can view other members in their household';
COMMENT ON POLICY "security_officer_view_members_policy" ON household_members IS 'Security officers can view members for identification purposes';
COMMENT ON POLICY "member_update_own_info_policy" ON household_members IS 'Members can update their own contact information';