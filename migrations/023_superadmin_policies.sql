-- Superadmin Row Level Security Policies
-- Allows superadmins to access all data across all tenants

-- Drop existing restrictive policies for superadmin access
-- Superadmins need cross-tenant access for management purposes

-- =====================================================================================
-- SUPERADMIN ACCESS POLICIES
-- =====================================================================================

-- Create a function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(user_uuid UUID DEFAULT get_current_user_id())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users u
    JOIN lookup_values lv ON u.role_id = lv.id
    WHERE u.id = user_uuid
    AND lv.code = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create superadmin bypass policies for all tenant tables

-- Villages table - superadmins can manage all villages (tenants)
CREATE POLICY "superadmin_all_villages" ON villages
  FOR ALL USING (is_superadmin());

-- Users table - superadmins can manage all users
CREATE POLICY "superadmin_all_users" ON users
  FOR ALL USING (is_superadmin());

-- Households - superadmins can access all households
CREATE POLICY "superadmin_all_households" ON households
  FOR ALL USING (is_superadmin());

-- Household members - superadmins can access all members
CREATE POLICY "superadmin_all_household_members" ON household_members
  FOR ALL USING (is_superadmin());

-- Vehicle stickers - superadmins can access all vehicle stickers
CREATE POLICY "superadmin_all_vehicle_stickers" ON vehicle_stickers
  FOR ALL USING (is_superadmin());

-- Guest passes - superadmins can access all guest passes
CREATE POLICY "superadmin_all_guest_passes" ON guest_passes
  FOR ALL USING (is_superadmin());

-- Security logs - superadmins can access all security logs
CREATE POLICY "superadmin_all_security_logs" ON security_logs
  FOR ALL USING (is_superadmin());

-- Delivery records - superadmins can access all delivery records
CREATE POLICY "superadmin_all_delivery_records" ON delivery_records
  FOR ALL USING (is_superadmin());

-- Construction permits - superadmins can access all permits
CREATE POLICY "superadmin_all_construction_permits" ON construction_permits
  FOR ALL USING (is_superadmin());

-- Incident reports - superadmins can access all incidents
CREATE POLICY "superadmin_all_incident_reports" ON incident_reports
  FOR ALL USING (is_superadmin());

-- Fee structures - superadmins can access all fee structures
CREATE POLICY "superadmin_all_fee_structures" ON fee_structures
  FOR ALL USING (is_superadmin());

-- Fee payments - superadmins can access all fee payments
CREATE POLICY "superadmin_all_fee_payments" ON fee_payments
  FOR ALL USING (is_superadmin());

-- Village rules - superadmins can access all village rules
CREATE POLICY "superadmin_all_village_rules" ON village_rules
  FOR ALL USING (is_superadmin());

-- =====================================================================================
-- SUPERADMIN UTILITY FUNCTIONS
-- =====================================================================================

-- Function to set tenant context for superadmin operations
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Only superadmins can set tenant context
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can set tenant context';
  END IF;

  -- Set the tenant context
  PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear tenant context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS VOID AS $$
BEGIN
  -- Only superadmins can clear tenant context
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can clear tenant context';
  END IF;

  -- Clear the tenant context
  PERFORM set_config('app.current_tenant_id', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate new tenant ID
CREATE OR REPLACE FUNCTION generate_tenant_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
BEGIN
  -- Only superadmins can generate tenant IDs
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can generate tenant IDs';
  END IF;

  -- Generate a unique tenant ID in format VLG-XXXXXX-XXX
  new_id := 'VLG-' ||
            upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)) ||
            '-' ||
            upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 3));

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM villages WHERE name = new_id) LOOP
    new_id := 'VLG-' ||
              upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)) ||
              '-' ||
              upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 3));
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard statistics for superadmin
CREATE OR REPLACE FUNCTION get_superadmin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  total_villages INTEGER;
  active_villages INTEGER;
  inactive_villages INTEGER;
  new_villages_month INTEGER;
  result JSON;
BEGIN
  -- Only superadmins can access dashboard stats
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can access dashboard statistics';
  END IF;

  -- Get total villages count
  SELECT COUNT(*) INTO total_villages FROM villages;

  -- Get active villages count
  SELECT COUNT(*) INTO active_villages
  FROM villages v
  JOIN lookup_values lv ON v.status_id = lv.id
  WHERE lv.code = 'active';

  -- Get inactive villages count
  SELECT COUNT(*) INTO inactive_villages
  FROM villages v
  JOIN lookup_values lv ON v.status_id = lv.id
  WHERE lv.code = 'inactive';

  -- Get new villages this month
  SELECT COUNT(*) INTO new_villages_month
  FROM villages
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);

  -- Build result JSON
  result := json_build_object(
    'totalVillages', total_villages,
    'activeVillages', active_villages,
    'inactiveVillages', inactive_villages,
    'newVillagesThisMonth', new_villages_month,
    'generatedAt', CURRENT_TIMESTAMP
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- GRANT PERMISSIONS
-- =====================================================================================

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION is_superadmin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_tenant_context(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_tenant_context() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_superadmin_dashboard_stats() TO authenticated;

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

COMMENT ON FUNCTION is_superadmin(UUID) IS 'Check if a user has superadmin role';
COMMENT ON FUNCTION set_tenant_context(UUID) IS 'Set tenant context for superadmin cross-tenant operations';
COMMENT ON FUNCTION clear_tenant_context() IS 'Clear tenant context for global superadmin operations';
COMMENT ON FUNCTION generate_tenant_id() IS 'Generate unique tenant ID for new villages';
COMMENT ON FUNCTION get_superadmin_dashboard_stats() IS 'Get dashboard statistics for superadmin interface';