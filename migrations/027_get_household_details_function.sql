-- =============================================================================
-- Migration 027: Get Household Details Function
-- =============================================================================
-- Creates a PostgreSQL function to fetch detailed household information
-- including household head, members, status, and all related data.
-- Uses SECURITY DEFINER to bypass RLS policies.

/**
 * Fetches complete household details including all related data
 *
 * @param household_uuid - The household ID to fetch
 * @param tenant_uuid - The tenant ID for security
 * @returns JSON object with household details or error
 */
CREATE OR REPLACE FUNCTION get_household_details(
  household_uuid UUID,
  tenant_uuid UUID
) RETURNS JSONB AS $$
DECLARE
  household_data JSONB;
  members_data JSONB;
BEGIN
  -- Fetch household with head and status
  SELECT jsonb_build_object(
    'id', h.id,
    'tenant_id', h.tenant_id,
    'household_head_id', h.household_head_id,
    'address', h.address,
    'status_id', h.status_id,
    'approved_by', h.approved_by,
    'approved_at', h.approved_at,
    'created_at', h.created_at,
    'updated_at', h.updated_at,
    'household_head', jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'first_name', u.first_name,
      'middle_name', u.middle_name,
      'last_name', u.last_name,
      'suffix', u.suffix,
      'is_active', u.is_active
    ),
    'status', jsonb_build_object(
      'id', lv.id,
      'code', lv.code,
      'name', lv.name,
      'color_code', lv.color_code
    )
  ) INTO household_data
  FROM households h
  JOIN users u ON h.household_head_id = u.id
  JOIN lookup_values lv ON h.status_id = lv.id
  WHERE h.id = household_uuid
    AND h.tenant_id = tenant_uuid;

  -- Check if household was found
  IF household_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Household not found'
    );
  END IF;

  -- Fetch household members
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', hm.id,
      'household_id', hm.household_id,
      'user_id', hm.user_id,
      'name', hm.name,
      'relationship_id', hm.relationship_id,
      'contact_info', hm.contact_info,
      'is_primary', hm.is_primary,
      'created_at', hm.created_at,
      'relationship', jsonb_build_object(
        'id', lv.id,
        'code', lv.code,
        'name', lv.name
      )
    )
  ), '[]'::jsonb) INTO members_data
  FROM household_members hm
  LEFT JOIN lookup_values lv ON hm.relationship_id = lv.id
  WHERE hm.household_id = household_uuid;

  -- Combine household data with members
  household_data := household_data || jsonb_build_object(
    'members', members_data,
    'member_count', jsonb_array_length(members_data)
  );

  -- Return success with data
  RETURN jsonb_build_object(
    'success', true,
    'data', household_data
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_household_details(UUID, UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_household_details IS 'Fetches complete household details including members, bypassing RLS policies';
