-- Create tenant context functions for regular users
-- These functions allow authenticated users to set their tenant context for RLS policies

-- Function to set current tenant ID for regular users
CREATE OR REPLACE FUNCTION set_current_tenant_id(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Set the tenant context for RLS policies
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current tenant ID
CREATE OR REPLACE FUNCTION get_current_tenant_id_rpc()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_tenant_id', true), NULL)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear current tenant context
CREATE OR REPLACE FUNCTION clear_current_tenant_id()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION set_current_tenant_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_tenant_id_rpc() TO authenticated;
GRANT EXECUTE ON FUNCTION clear_current_tenant_id() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION set_current_tenant_id(UUID) IS 'Set tenant context for authenticated users to enable RLS policies';
COMMENT ON FUNCTION get_current_tenant_id_rpc() IS 'Get current tenant context for authenticated users';
COMMENT ON FUNCTION clear_current_tenant_id() IS 'Clear tenant context for authenticated users';