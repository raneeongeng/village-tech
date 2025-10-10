-- Enable RLS and create policies for users table
-- Users can only see and manage users within their own tenant

-- Enable Row Level Security on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for superadmins - can manage all users
CREATE POLICY "superadmin_all_users_policy" ON users
    FOR ALL
    USING (current_user_has_role('superadmin'))
    WITH CHECK (current_user_has_role('superadmin'));

-- Policy for users to read their own profile (essential for authentication)
CREATE POLICY "users_read_own_profile_policy" ON users
    FOR SELECT
    USING (id = get_current_user_id());

-- Policy for users to view users in their own tenant
CREATE POLICY "tenant_users_view_policy" ON users
    FOR SELECT
    USING (tenant_id = get_current_tenant_id());

-- Policy for admin_head to manage users in their tenant
CREATE POLICY "admin_head_manage_users_policy" ON users
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_head')
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_head')
    );

-- Policy for admin_officer to manage non-admin users in their tenant
CREATE POLICY "admin_officer_manage_users_policy" ON users
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_officer')
        AND NOT EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = users.role_id
            AND lv.code IN ('superadmin', 'admin_head', 'admin_officer')
        )
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND current_user_has_role('admin_officer')
        AND NOT EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = users.role_id
            AND lv.code IN ('superadmin', 'admin_head', 'admin_officer')
        )
    );

-- Policy for users to update their own profile
CREATE POLICY "users_update_own_profile_policy" ON users
    FOR UPDATE
    USING (
        id = get_current_user_id()
        AND tenant_id = get_current_tenant_id()
    )
    WITH CHECK (
        id = get_current_user_id()
        AND tenant_id = get_current_tenant_id()
        -- Prevent users from changing their own role or tenant
        AND role_id = (SELECT role_id FROM users WHERE id = get_current_user_id())
        AND tenant_id = (SELECT tenant_id FROM users WHERE id = get_current_user_id())
    );

-- Policy for household heads to create their own user account
CREATE POLICY "household_head_create_account_policy" ON users
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND EXISTS (
            SELECT 1 FROM lookup_values lv
            WHERE lv.id = users.role_id
            AND lv.code = 'household_head'
        )
        AND id = get_current_user_id()
    );

-- Add comments for documentation
COMMENT ON POLICY "superadmin_all_users_policy" ON users IS 'Superadmins can manage all users across all tenants';
COMMENT ON POLICY "users_read_own_profile_policy" ON users IS 'Users can read their own profile data for authentication';
COMMENT ON POLICY "tenant_users_view_policy" ON users IS 'Users can view other users within their tenant';
COMMENT ON POLICY "admin_head_manage_users_policy" ON users IS 'Admin heads can manage all users within their tenant';
COMMENT ON POLICY "admin_officer_manage_users_policy" ON users IS 'Admin officers can manage non-admin users within their tenant';
COMMENT ON POLICY "users_update_own_profile_policy" ON users IS 'Users can update their own profile but not role or tenant';
COMMENT ON POLICY "household_head_create_account_policy" ON users IS 'Household heads can create their own user accounts';