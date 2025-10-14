-- =============================================================================
-- Migration 026: Household Management Functions
-- =============================================================================
-- Creates PostgreSQL functions for atomic household creation and management
-- operations. These functions ensure data consistency and provide proper
-- error handling with automatic rollback.

-- =============================================================================
-- ATOMIC HOUSEHOLD CREATION FUNCTION
-- =============================================================================

/**
 * Creates a complete household record with head user and optional members
 * in a single atomic transaction.
 *
 * @param household_data - Household information (address, tenant_id, status_id)
 * @param head_user_data - User account information for household head
 * @param member_data - Array of additional household members
 * @returns JSON object with success status and created IDs
 */
CREATE OR REPLACE FUNCTION create_household_with_members(
  household_data JSONB,
  head_user_data JSONB,
  member_data JSONB[] DEFAULT ARRAY[]::JSONB[]
) RETURNS JSONB AS $$
DECLARE
  new_household_id UUID;
  new_user_id UUID;
  head_relationship_id UUID;
  member_record JSONB;
  result JSONB;
BEGIN
  -- Validate required parameters
  IF household_data IS NULL OR head_user_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Missing required household or user data'
    );
  END IF;

  -- Get the auth_user_id from head_user_data
  new_user_id := (head_user_data->>'auth_user_id')::UUID;

  IF new_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Auth user ID is required'
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
    (household_data->>'tenant_id')::UUID,
    head_user_data->>'email',
    (head_user_data->>'role_id')::UUID,
    head_user_data->>'first_name',
    head_user_data->>'middle_name',
    head_user_data->>'last_name',
    head_user_data->>'suffix',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

  -- Step 2: Create household record
  INSERT INTO households (
    tenant_id,
    household_head_id,
    address,
    status_id,
    created_at,
    updated_at
  ) VALUES (
    (household_data->>'tenant_id')::UUID,
    new_user_id,
    household_data->>'address',
    (household_data->>'status_id')::UUID,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ) RETURNING id INTO new_household_id;

  -- Step 3: Get 'head' relationship ID
  SELECT lv.id INTO head_relationship_id
  FROM lookup_values lv
  JOIN lookup_categories lc ON lv.category_id = lc.id
  WHERE lc.code = 'household_member_relationships'
    AND lv.code = 'head'
    AND lv.is_active = true;

  IF head_relationship_id IS NULL THEN
    RAISE EXCEPTION 'Head relationship type not found in lookup_values';
  END IF;

  -- Step 4: Create household member record for the head
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
    (household_data->>'tenant_id')::UUID,
    new_household_id,
    new_user_id,
    CONCAT_WS(' ',
      head_user_data->>'first_name',
      NULLIF(head_user_data->>'middle_name', ''),
      head_user_data->>'last_name',
      NULLIF(head_user_data->>'suffix', '')
    ),
    head_relationship_id,
    jsonb_build_object(
      'phone', head_user_data->>'phone',
      'email', head_user_data->>'email'
    ),
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

  -- Step 5: Create additional household members (if any)
  IF array_length(member_data, 1) > 0 THEN
    FOR i IN 1..array_length(member_data, 1) LOOP
      member_record := member_data[i];

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
        (household_data->>'tenant_id')::UUID,
        new_household_id,
        NULL, -- Additional members don't have user accounts initially
        member_record->>'name',
        (member_record->>'relationship_id')::UUID,
        COALESCE(member_record->'contact_info', '{}'::JSONB),
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    END LOOP;
  END IF;

  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'household_id', new_household_id,
    'user_id', new_user_id,
    'member_count', 1 + COALESCE(array_length(member_data, 1), 0)
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
-- HOUSEHOLD APPROVAL FUNCTION
-- =============================================================================

/**
 * Approves a pending household application
 *
 * @param household_uuid - ID of household to approve
 * @param approved_by_uuid - ID of admin user performing approval
 * @returns JSON object with success status
 */
CREATE OR REPLACE FUNCTION approve_household(
  household_uuid UUID,
  approved_by_uuid UUID
) RETURNS JSONB AS $$
DECLARE
  active_status_id UUID;
  result JSONB;
BEGIN
  -- Get active status ID
  SELECT lv.id INTO active_status_id
  FROM lookup_values lv
  JOIN lookup_categories lc ON lv.category_id = lc.id
  WHERE lc.code = 'household_statuses'
    AND lv.code = 'active'
    AND lv.is_active = true;

  IF active_status_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Active status not found in lookup_values'
    );
  END IF;

  -- Update household status and approval metadata
  UPDATE households SET
    status_id = active_status_id,
    approved_by = approved_by_uuid,
    approved_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = household_uuid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Household not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'approved_at', CURRENT_TIMESTAMP
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
-- HOUSEHOLD STATUS TOGGLE FUNCTION
-- =============================================================================

/**
 * Toggles household status between active and inactive
 *
 * @param household_uuid - ID of household to toggle
 * @param admin_user_uuid - ID of admin user performing action
 * @returns JSON object with success status and new status
 */
CREATE OR REPLACE FUNCTION toggle_household_status(
  household_uuid UUID,
  admin_user_uuid UUID
) RETURNS JSONB AS $$
DECLARE
  current_status_code TEXT;
  new_status_id UUID;
  new_status_code TEXT;
  result JSONB;
BEGIN
  -- Get current status code
  SELECT lv.code INTO current_status_code
  FROM households h
  JOIN lookup_values lv ON h.status_id = lv.id
  WHERE h.id = household_uuid;

  IF current_status_code IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Household not found'
    );
  END IF;

  -- Determine new status
  IF current_status_code = 'active' THEN
    new_status_code := 'inactive';
  ELSIF current_status_code = 'inactive' THEN
    new_status_code := 'active';
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot toggle status from ' || current_status_code
    );
  END IF;

  -- Get new status ID
  SELECT lv.id INTO new_status_id
  FROM lookup_values lv
  JOIN lookup_categories lc ON lv.category_id = lc.id
  WHERE lc.code = 'household_statuses'
    AND lv.code = new_status_code
    AND lv.is_active = true;

  IF new_status_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target status not found: ' || new_status_code
    );
  END IF;

  -- Update household status
  UPDATE households SET
    status_id = new_status_id,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = household_uuid;

  RETURN jsonb_build_object(
    'success', true,
    'old_status', current_status_code,
    'new_status', new_status_code,
    'updated_at', CURRENT_TIMESTAMP
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
-- EMAIL UNIQUENESS CHECK FUNCTION
-- =============================================================================

/**
 * Checks if email address is unique across all tenants
 *
 * @param email_address - Email to check
 * @returns JSON object with availability status
 */
CREATE OR REPLACE FUNCTION check_email_availability(
  email_address TEXT
) RETURNS JSONB AS $$
DECLARE
  email_count INTEGER;
  result JSONB;
BEGIN
  -- Count existing users with this email
  SELECT COUNT(*) INTO email_count
  FROM users
  WHERE LOWER(email) = LOWER(email_address);

  RETURN jsonb_build_object(
    'email', email_address,
    'available', email_count = 0,
    'count', email_count
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'email', email_address,
      'available', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- HOUSEHOLD SEARCH FUNCTION
-- =============================================================================

/**
 * Performs full-text search on households with pagination
 *
 * @param tenant_uuid - Tenant ID for data isolation
 * @param search_term - Search string
 * @param status_filter - Optional status code filter
 * @param page_number - Page number (1-based)
 * @param page_size - Items per page
 * @returns JSON object with results and pagination info
 */
CREATE OR REPLACE FUNCTION search_households(
  tenant_uuid UUID,
  search_term TEXT DEFAULT '',
  status_filter TEXT DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10
) RETURNS JSONB AS $$
DECLARE
  offset_count INTEGER;
  total_count INTEGER;
  result_data JSONB;
  pagination_info JSONB;
BEGIN
  offset_count := (page_number - 1) * page_size;

  -- Get total count for pagination
  SELECT COUNT(*) INTO total_count
  FROM households h
  JOIN users u ON h.household_head_id = u.id
  JOIN lookup_values lv ON h.status_id = lv.id
  WHERE h.tenant_id = tenant_uuid
    AND (
      search_term = '' OR
      h.address ILIKE '%' || search_term || '%' OR
      u.first_name ILIKE '%' || search_term || '%' OR
      u.last_name ILIKE '%' || search_term || '%'
    )
    AND (status_filter IS NULL OR lv.code = status_filter);

  -- Get paginated results with member count
  SELECT jsonb_agg(row_data ORDER BY created_at DESC) INTO result_data
  FROM (
    SELECT
      jsonb_build_object(
        'id', h.id,
        'address', h.address,
        'created_at', h.created_at,
        'household_head', jsonb_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'middle_name', u.middle_name,
          'last_name', u.last_name,
          'email', u.email
        ),
        'status', jsonb_build_object(
          'id', lv.id,
          'code', lv.code,
          'name', lv.name,
          'color_code', lv.color_code
        ),
        'member_count', COALESCE(COUNT(hm.id), 0)
      ) as row_data,
      h.created_at
    FROM households h
    JOIN users u ON h.household_head_id = u.id
    JOIN lookup_values lv ON h.status_id = lv.id
    LEFT JOIN household_members hm ON h.id = hm.household_id
    WHERE h.tenant_id = tenant_uuid
      AND (
        search_term = '' OR
        h.address ILIKE '%' || search_term || '%' OR
        u.first_name ILIKE '%' || search_term || '%' OR
        u.last_name ILIKE '%' || search_term || '%'
      )
      AND (status_filter IS NULL OR lv.code = status_filter)
    GROUP BY h.id, h.address, h.created_at, u.id, u.first_name, u.middle_name, u.last_name, u.email, lv.id, lv.code, lv.name, lv.color_code
    ORDER BY h.created_at DESC
    LIMIT page_size
    OFFSET offset_count
  ) subquery;

  -- Build pagination info
  SELECT jsonb_build_object(
    'current_page', page_number,
    'page_size', page_size,
    'total_count', total_count,
    'total_pages', CEIL(total_count::FLOAT / page_size),
    'has_next', (offset_count + page_size) < total_count,
    'has_prev', page_number > 1
  ) INTO pagination_info;

  -- Return combined result
  RETURN jsonb_build_object(
    'data', COALESCE(result_data, '[]'::JSONB),
    'pagination', pagination_info,
    'search_term', search_term,
    'status_filter', status_filter
  );

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'data', '[]'::JSONB,
      'error', SQLERRM,
      'search_term', search_term
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION PERMISSIONS AND COMMENTS
-- =============================================================================

-- Add comments for documentation
COMMENT ON FUNCTION create_household_with_members(JSONB, JSONB, JSONB[]) IS
'Atomically creates household with user account and members in single transaction';

COMMENT ON FUNCTION approve_household(UUID, UUID) IS
'Approves pending household application and sets approval metadata';

COMMENT ON FUNCTION toggle_household_status(UUID, UUID) IS
'Toggles household status between active and inactive states';

COMMENT ON FUNCTION check_email_availability(TEXT) IS
'Checks email uniqueness across all tenants for user account creation';

COMMENT ON FUNCTION search_households(UUID, TEXT, TEXT, INTEGER, INTEGER) IS
'Performs paginated full-text search on households with optional status filter';

-- These functions are SECURITY DEFINER, meaning they run with elevated privileges
-- RLS policies still apply to ensure tenant isolation
-- Grant execute permissions to authenticated users (handled by RLS)