-- =============================================================================
-- Migration 041: Household Member Management Functions
-- =============================================================================
-- Creates PostgreSQL functions for household member management operations.
-- These functions ensure proper permissions and data consistency.

-- =============================================================================
-- ADD HOUSEHOLD MEMBER FUNCTION
-- =============================================================================

/**
 * Adds a new member to an existing household with user account creation
 *
 * @param member_data - Member information including auth_user_id from signup
 * @param household_uuid - ID of the household to add member to
 * @param tenant_uuid - Tenant ID for data isolation
 * @param created_by_uuid - ID of user creating the member (household head or admin)
 * @returns JSON object with success status and created member ID
 */
CREATE OR REPLACE FUNCTION add_household_member(
  member_data JSONB,
  household_uuid UUID,
  tenant_uuid UUID,
  created_by_uuid UUID
) RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  member_role_id UUID;
  new_member_id UUID;
  result JSONB;
BEGIN
  -- Validate required parameters
  IF member_data IS NULL OR household_uuid IS NULL OR tenant_uuid IS NULL OR created_by_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Missing required parameters'
    );
  END IF;

  -- Get the auth_user_id from member_data (from auth.signUp)
  new_user_id := (member_data->>'auth_user_id')::UUID;

  IF new_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Auth user ID is required'
    );
  END IF;

  -- Validate that the household exists and belongs to the tenant
  IF NOT EXISTS (
    SELECT 1 FROM households
    WHERE id = household_uuid
    AND tenant_id = tenant_uuid
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Household not found or access denied'
    );
  END IF;

  -- Get household_member role ID
  SELECT lv.id INTO member_role_id
  FROM lookup_values lv
  JOIN lookup_categories lc ON lv.category_id = lc.id
  WHERE lc.code = 'user_roles'
    AND lv.code = 'household_member'
    AND lv.is_active = true;

  IF member_role_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Household member role not found'
    );
  END IF;

  -- Step 1: Create user record in users table
  INSERT INTO users (
    id,
    tenant_id,
    email,
    role_id,
    first_name,
    middle_name,
    last_name,
    suffix,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    tenant_uuid,
    member_data->>'email',
    member_role_id,
    member_data->>'first_name',
    member_data->>'middle_name',
    member_data->>'last_name',
    member_data->>'suffix',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

  -- Step 2: Create household member record
  INSERT INTO household_members (
    tenant_id,
    household_id,
    user_id,
    name,
    relationship_id,
    contact_info,
    is_primary,
    created_at,
    updated_at
  ) VALUES (
    tenant_uuid,
    household_uuid,
    new_user_id,
    CONCAT_WS(' ',
      member_data->>'first_name',
      NULLIF(member_data->>'middle_name', ''),
      member_data->>'last_name',
      NULLIF(member_data->>'suffix', '')
    ),
    (member_data->>'relationship_id')::UUID,
    jsonb_build_object(
      'phone', COALESCE(member_data->>'phone', ''),
      'email', member_data->>'email'
    ),
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ) RETURNING id INTO new_member_id;

  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'member_id', new_member_id,
    'user_id', new_user_id
  ) INTO result;

  RETURN result;

EXCEPTION
  WHEN others THEN
    -- All operations are automatically rolled back on exception
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- REMOVE HOUSEHOLD MEMBER FUNCTION
-- =============================================================================

/**
 * Removes a member from a household (soft delete approach)
 *
 * @param member_uuid - ID of the household member to remove
 * @param tenant_uuid - Tenant ID for data isolation
 * @param removed_by_uuid - ID of user removing the member (household head or admin)
 * @returns JSON object with success status
 */
CREATE OR REPLACE FUNCTION remove_household_member(
  member_uuid UUID,
  tenant_uuid UUID,
  removed_by_uuid UUID
) RETURNS JSONB AS $$
DECLARE
  member_user_id UUID;
  result JSONB;
BEGIN
  -- Validate required parameters
  IF member_uuid IS NULL OR tenant_uuid IS NULL OR removed_by_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Missing required parameters'
    );
  END IF;

  -- Get the user_id for the member being removed
  SELECT user_id INTO member_user_id
  FROM household_members
  WHERE id = member_uuid
  AND tenant_id = tenant_uuid;

  IF member_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Household member not found'
    );
  END IF;

  -- Delete the household member record
  DELETE FROM household_members
  WHERE id = member_uuid
  AND tenant_id = tenant_uuid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to remove household member'
    );
  END IF;

  -- Optionally deactivate the user account (but don't delete it)
  UPDATE users
  SET is_active = false,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = member_user_id
  AND tenant_id = tenant_uuid;

  RETURN jsonb_build_object(
    'success', true,
    'removed_at', CURRENT_TIMESTAMP
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION PERMISSIONS AND COMMENTS
-- =============================================================================

-- Add comments for documentation
COMMENT ON FUNCTION add_household_member(JSONB, UUID, UUID, UUID) IS
'Adds new member to household with auth user creation and proper permissions';

COMMENT ON FUNCTION remove_household_member(UUID, UUID, UUID) IS
'Removes member from household and deactivates user account';

-- These functions are SECURITY DEFINER, meaning they run with elevated privileges
-- to bypass RLS policies while still maintaining data integrity and tenant isolation