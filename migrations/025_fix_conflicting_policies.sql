-- Fix conflicting RLS policies for superadmin access
-- Remove old conflicting policies and ensure proper superadmin access

-- Drop the old conflicting superadmin policy from migration 014
DROP POLICY IF EXISTS "superadmin_all_tenants_policy" ON villages;

-- Drop the old tenant users policy that might conflict
DROP POLICY IF EXISTS "tenant_users_own_tenant_policy" ON villages;

-- Ensure the new superadmin policy exists (from migration 023)
-- If it doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'villages'
        AND policyname = 'superadmin_all_villages'
    ) THEN
        CREATE POLICY "superadmin_all_villages" ON villages
          FOR ALL USING (is_superadmin());
    END IF;
END $$;

-- Create a more specific policy for regular tenant users
CREATE POLICY "tenant_users_own_village_access" ON villages
    FOR SELECT
    USING (
        id IN (
            SELECT tenant_id FROM users
            WHERE id = get_current_user_id()
            AND tenant_id IS NOT NULL
        )
    );

-- Test the is_superadmin function with explicit user ID
-- This helps debug RLS issues
CREATE OR REPLACE FUNCTION test_superadmin_access(test_user_id UUID DEFAULT get_current_user_id())
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_exists BOOLEAN;
    user_role TEXT;
    is_admin BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM users WHERE id = test_user_id) INTO user_exists;

    -- Get user role
    SELECT lv.code INTO user_role
    FROM users u
    JOIN lookup_values lv ON u.role_id = lv.id
    WHERE u.id = test_user_id;

    -- Test is_superadmin function
    SELECT is_superadmin(test_user_id) INTO is_admin;

    result := json_build_object(
        'user_id', test_user_id,
        'user_exists', user_exists,
        'user_role', COALESCE(user_role, 'none'),
        'is_superadmin_result', is_admin,
        'current_user_from_jwt', get_current_user_id(),
        'jwt_sub', (auth.jwt() ->> 'sub')::UUID
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_superadmin_access(UUID) TO authenticated;

COMMENT ON FUNCTION test_superadmin_access(UUID) IS 'Debug function to test superadmin access and RLS policies';