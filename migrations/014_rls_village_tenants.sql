-- Enable RLS and create tenant isolation policies for villages table
-- This is the foundation table for multi-tenant isolation

-- Enable Row Level Security on villages
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

-- Policy for superadmins - can see all tenants
CREATE POLICY "superadmin_all_tenants_policy" ON villages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN lookup_values lv ON u.role_id = lv.id
            WHERE u.id = (auth.jwt() ->> 'sub')::UUID
            AND lv.code = 'superadmin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN lookup_values lv ON u.role_id = lv.id
            WHERE u.id = (auth.jwt() ->> 'sub')::UUID
            AND lv.code = 'superadmin'
        )
    );

-- Policy for tenant users - can only see their own tenant
CREATE POLICY "tenant_users_own_tenant_policy" ON villages
    FOR SELECT
    USING (
        id = (auth.jwt() ->> 'tenant_id')::UUID
    );

-- Policy for tenant admins - can update their own tenant
CREATE POLICY "tenant_admin_update_own_tenant_policy" ON villages
    FOR UPDATE
    USING (
        id = (auth.jwt() ->> 'tenant_id')::UUID
        AND EXISTS (
            SELECT 1 FROM users u
            JOIN lookup_values lv ON u.role_id = lv.id
            WHERE u.id = (auth.jwt() ->> 'sub')::UUID
            AND u.tenant_id = villages.id
            AND lv.code IN ('admin_head', 'admin_officer')
        )
    )
    WITH CHECK (
        id = (auth.jwt() ->> 'tenant_id')::UUID
        AND EXISTS (
            SELECT 1 FROM users u
            JOIN lookup_values lv ON u.role_id = lv.id
            WHERE u.id = (auth.jwt() ->> 'sub')::UUID
            AND u.tenant_id = villages.id
            AND lv.code IN ('admin_head', 'admin_officer')
        )
    );

-- Function to get current user's tenant_id from users table
-- SECURITY DEFINER bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    result UUID;
BEGIN
    SELECT tenant_id INTO result
    FROM users
    WHERE id = (auth.jwt() ->> 'sub')::UUID
    LIMIT 1;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to get current user's id from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'sub')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION current_user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        JOIN lookup_values lv ON u.role_id = lv.id
        WHERE u.id = get_current_user_id()
        AND u.tenant_id = get_current_tenant_id()
        AND lv.code = required_role
        AND u.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has any of the specified roles
CREATE OR REPLACE FUNCTION current_user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        JOIN lookup_values lv ON u.role_id = lv.id
        WHERE u.id = get_current_user_id()
        AND u.tenant_id = get_current_tenant_id()
        AND lv.code = ANY(required_roles)
        AND u.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on public functions
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_has_any_role(TEXT[]) TO authenticated;

-- Add comments for documentation
COMMENT ON POLICY "superadmin_all_tenants_policy" ON villages IS 'Superadmins can manage all villages';
COMMENT ON POLICY "tenant_users_own_tenant_policy" ON villages IS 'Users can only view their own village information';
COMMENT ON POLICY "tenant_admin_update_own_tenant_policy" ON villages IS 'Village admins can update their own village settings';

COMMENT ON FUNCTION get_current_tenant_id() IS 'Extract tenant_id from JWT token for RLS policies';
COMMENT ON FUNCTION get_current_user_id() IS 'Extract user_id from JWT token for RLS policies';
COMMENT ON FUNCTION current_user_has_role(TEXT) IS 'Check if current user has specific role within their tenant';
COMMENT ON FUNCTION current_user_has_any_role(TEXT[]) IS 'Check if current user has any of the specified roles within their tenant';