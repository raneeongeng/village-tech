-- Update vehicle sticker request function to support household member selection and proof upload

-- Drop the existing function
DROP FUNCTION IF EXISTS submit_vehicle_sticker_request(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT);

-- Create updated function with additional parameters
CREATE OR REPLACE FUNCTION submit_vehicle_sticker_request(
    p_tenant_id UUID,
    p_requester_id UUID,
    p_household_id UUID,
    p_household_member_id UUID,
    p_vehicle_type TEXT,
    p_vehicle_make TEXT,
    p_vehicle_model TEXT,
    p_vehicle_plate TEXT,
    p_vehicle_color TEXT,
    p_proof_file_url TEXT,
    p_remarks TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_request_data JSONB;
BEGIN
    -- Build comprehensive request data
    v_request_data := jsonb_build_object(
        'household_id', p_household_id,
        'household_member_id', p_household_member_id,
        'proof_file_url', p_proof_file_url,
        'vehicle_info', jsonb_build_object(
            'type', p_vehicle_type,
            'make', p_vehicle_make,
            'model', p_vehicle_model,
            'plate', p_vehicle_plate,
            'color', p_vehicle_color
        ),
        'remarks', p_remarks,
        'form_version', 'v2.0'
    );

    -- Submit the request using the generic onboarding function
    RETURN submit_onboarding_request(
        p_tenant_id,
        'sticker_vehicle_request',
        p_requester_id,
        v_request_data
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create actual sticker record when request is approved
CREATE OR REPLACE FUNCTION create_vehicle_sticker_from_request(
    p_request_id UUID,
    p_admin_id UUID,
    p_sticker_code TEXT,
    p_expires_at TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
    v_request_record onboarding_requests%ROWTYPE;
    v_sticker_id UUID;
    v_vehicle_type_id UUID;
    v_active_status_id UUID;
BEGIN
    -- Get the request record
    SELECT * INTO v_request_record
    FROM onboarding_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found: %', p_request_id;
    END IF;

    -- Get vehicle sticker type ID
    SELECT lv.id INTO v_vehicle_type_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'sticker_types' AND lv.code = 'vehicle';

    -- Get active status ID
    SELECT lv.id INTO v_active_status_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'sticker_statuses' AND lv.code = 'active';

    -- Create the sticker record
    INSERT INTO stickers (
        tenant_id,
        sticker_type_id,
        sticker_code,
        household_id,
        household_member_id,
        sticker_data,
        status_id,
        issued_by,
        expires_at,
        created_by
    ) VALUES (
        v_request_record.tenant_id,
        v_vehicle_type_id,
        p_sticker_code,
        (v_request_record.request_data->>'household_id')::UUID,
        (v_request_record.request_data->>'household_member_id')::UUID,
        v_request_record.request_data,
        v_active_status_id,
        p_admin_id,
        p_expires_at,
        p_admin_id
    ) RETURNING id INTO v_sticker_id;

    -- Mark the request as completed
    PERFORM complete_onboarding_request(
        p_request_id,
        'stickers',
        v_sticker_id,
        p_admin_id
    );

    RETURN v_sticker_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get household members for dropdown population
CREATE OR REPLACE FUNCTION get_household_members_for_request(
    p_tenant_id UUID,
    p_household_id UUID
) RETURNS TABLE (
    member_id UUID,
    member_name TEXT,
    relationship_code TEXT,
    relationship_name TEXT,
    is_primary BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        hm.id,
        hm.name,
        lv.code,
        lv.name,
        hm.is_primary
    FROM household_members hm
    JOIN lookup_values lv ON hm.relationship_id = lv.id
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE hm.tenant_id = p_tenant_id
    AND hm.household_id = p_household_id
    AND lc.code = 'household_member_relationships'
    ORDER BY hm.is_primary DESC, hm.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending vehicle sticker requests with member details (for admin)
CREATE OR REPLACE FUNCTION get_pending_vehicle_sticker_requests(
    p_tenant_id UUID
) RETURNS TABLE (
    request_id UUID,
    requester_email TEXT,
    household_address TEXT,
    member_name TEXT,
    member_relationship TEXT,
    vehicle_info JSONB,
    proof_file_url TEXT,
    remarks TEXT,
    submitted_at TIMESTAMPTZ,
    workflow_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        req.id,
        u.email,
        h.address,
        hm.name,
        lv_rel.name::TEXT,
        req.request_data->'vehicle_info',
        req.request_data->>'proof_file_url',
        req.request_data->>'remarks',
        req.submitted_at,
        lv_status.name::TEXT
    FROM onboarding_requests req
    JOIN users u ON req.requester_id = u.id
    JOIN households h ON (req.request_data->>'household_id')::UUID = h.id
    JOIN household_members hm ON (req.request_data->>'household_member_id')::UUID = hm.id
    JOIN lookup_values lv_rel ON hm.relationship_id = lv_rel.id
    JOIN lookup_values lv_status ON req.workflow_status_id = lv_status.id
    JOIN lookup_values lv_type ON req.request_type_id = lv_type.id
    JOIN lookup_categories lc_type ON lv_type.category_id = lc_type.id
    WHERE req.tenant_id = p_tenant_id
    AND lc_type.code = 'request_types'
    AND lv_type.code = 'sticker_vehicle_request'
    AND lv_status.code IN ('submitted', 'under_review')
    ORDER BY req.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Update function comments
COMMENT ON FUNCTION submit_vehicle_sticker_request IS 'Submit vehicle sticker request with household member selection and proof upload';
COMMENT ON FUNCTION create_vehicle_sticker_from_request IS 'Create actual sticker record when admin approves request';
COMMENT ON FUNCTION get_household_members_for_request IS 'Get household members for dropdown population in sticker request form';
COMMENT ON FUNCTION get_pending_vehicle_sticker_requests IS 'Get pending vehicle sticker requests with member details for admin review';