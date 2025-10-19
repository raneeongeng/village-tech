-- People sticker request functions for multi-member selection

-- Function to submit people sticker request for multiple household members
CREATE OR REPLACE FUNCTION submit_people_sticker_request(
    p_tenant_id UUID,
    p_requester_id UUID,
    p_household_id UUID,
    p_selected_members JSONB,
    p_remarks TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_request_data JSONB;
    v_request_id UUID;
BEGIN
    -- Validate that selected_members is an array
    IF jsonb_typeof(p_selected_members) != 'array' THEN
        RAISE EXCEPTION 'Selected members must be an array';
    END IF;

    -- Validate that at least one member is selected
    IF jsonb_array_length(p_selected_members) = 0 THEN
        RAISE EXCEPTION 'At least one household member must be selected';
    END IF;

    -- Build comprehensive request data
    v_request_data := jsonb_build_object(
        'household_id', p_household_id,
        'selected_members', p_selected_members,
        'request_type', 'bulk_people_stickers',
        'remarks', p_remarks
    );

    -- Submit the onboarding request
    SELECT submit_onboarding_request(
        p_tenant_id,
        'sticker_people_request',
        p_requester_id,
        v_request_data
    ) INTO v_request_id;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending people sticker requests for admin review
CREATE OR REPLACE FUNCTION get_pending_people_sticker_requests(
    p_tenant_id UUID
) RETURNS TABLE (
    request_id UUID,
    requester_email TEXT,
    household_address TEXT,
    selected_members JSONB,
    remarks TEXT,
    submitted_at TIMESTAMPTZ,
    workflow_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        req.id,
        u.email,
        COALESCE(h.address, 'N/A') AS household_address,
        req.request_data->'selected_members',
        req.request_data->>'remarks',
        req.submitted_at,
        lv_status.name::TEXT
    FROM onboarding_requests req
    JOIN users u ON req.requester_id = u.id
    LEFT JOIN households h ON (req.request_data->>'household_id')::UUID = h.id
    JOIN lookup_values lv_status ON req.workflow_status_id = lv_status.id
    JOIN lookup_values lv_type ON req.request_type_id = lv_type.id
    JOIN lookup_categories lc_type ON lv_type.category_id = lc_type.id
    WHERE req.tenant_id = p_tenant_id
    AND lc_type.code = 'request_types'
    AND lv_type.code = 'sticker_people_request'
    AND lv_status.code IN ('submitted', 'under_review')
    ORDER BY req.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to approve people sticker request and create sticker records
CREATE OR REPLACE FUNCTION approve_people_sticker_request(
    p_request_id UUID,
    p_reviewer_id UUID,
    p_approved_member_ids UUID[] DEFAULT NULL -- If NULL, approve all members
) RETURNS TABLE (
    success BOOLEAN,
    created_sticker_ids UUID[],
    message TEXT
) AS $$
DECLARE
    v_request_data JSONB;
    v_tenant_id UUID;
    v_household_id UUID;
    v_selected_members JSONB;
    v_member JSONB;
    v_member_id UUID;
    v_sticker_code TEXT;
    v_sticker_id UUID;
    v_sticker_type_id UUID;
    v_active_status_id UUID;
    v_created_stickers UUID[] := ARRAY[]::UUID[];
    v_expires_at TIMESTAMPTZ;
    i INTEGER;
BEGIN
    -- Get request details
    SELECT
        tenant_id,
        request_data
    INTO v_tenant_id, v_request_data
    FROM onboarding_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, ARRAY[]::UUID[], 'Request not found';
        RETURN;
    END IF;

    -- Extract data from request
    v_household_id := (v_request_data->>'household_id')::UUID;
    v_selected_members := v_request_data->'selected_members';

    -- Check if household exists, set to NULL if not
    IF NOT EXISTS (SELECT 1 FROM households WHERE id = v_household_id) THEN
        v_household_id := NULL;
    END IF;

    -- Get sticker type and status IDs
    SELECT lv.id INTO v_sticker_type_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'sticker_types' AND lv.code = 'people';

    SELECT lv.id INTO v_active_status_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'sticker_statuses' AND lv.code = 'active';

    -- Set expiration date (1 year from now)
    v_expires_at := CURRENT_TIMESTAMP + INTERVAL '1 year';

    -- Create stickers for approved members
    FOR i IN 0..jsonb_array_length(v_selected_members) - 1 LOOP
        v_member := v_selected_members->i;
        v_member_id := (v_member->>'member_id')::UUID;

        -- If specific member IDs provided, only approve those
        IF p_approved_member_ids IS NOT NULL AND NOT (v_member_id = ANY(p_approved_member_ids)) THEN
            CONTINUE;
        END IF;

        -- Generate unique sticker code
        v_sticker_code := 'PER-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));

        -- Ensure sticker code is unique within tenant
        WHILE EXISTS (SELECT 1 FROM stickers WHERE tenant_id = v_tenant_id AND sticker_code = v_sticker_code) LOOP
            v_sticker_code := 'PER-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
        END LOOP;

        -- Create sticker record
        INSERT INTO stickers (
            tenant_id,
            sticker_type_id,
            sticker_code,
            status_id,
            household_id,
            household_member_id,
            sticker_data,
            expires_at,
            issued_by,
            created_by
        ) VALUES (
            v_tenant_id,
            v_sticker_type_id,
            v_sticker_code,
            v_active_status_id,
            v_household_id,
            v_member_id,
            jsonb_build_object(
                'member_name', v_member->>'member_name',
                'relationship', v_member->>'relationship',
                'id_document_url', v_member->>'id_document_url',
                'photo_url', v_member->>'photo_url',
                'issued_date', CURRENT_DATE,
                'request_id', p_request_id
            ),
            v_expires_at,
            p_reviewer_id,
            p_reviewer_id
        ) RETURNING id INTO v_sticker_id;

        v_created_stickers := array_append(v_created_stickers, v_sticker_id);
    END LOOP;

    -- Update request status to approved
    PERFORM update_request_status(
        p_request_id,
        'approved',
        p_reviewer_id,
        'People stickers approved and created'
    );

    RETURN QUERY SELECT
        TRUE,
        v_created_stickers,
        format('Successfully created %s people stickers', array_length(v_created_stickers, 1));
END;
$$ LANGUAGE plpgsql;

-- Function to check if household member already has active people sticker
CREATE OR REPLACE FUNCTION has_active_people_sticker(
    p_tenant_id UUID,
    p_member_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_sticker_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_sticker_count
    FROM stickers s
    JOIN lookup_values lv_type ON s.sticker_type_id = lv_type.id
    JOIN lookup_categories lc_type ON lv_type.category_id = lc_type.id
    JOIN lookup_values lv_status ON s.status_id = lv_status.id
    WHERE s.tenant_id = p_tenant_id
    AND s.household_member_id = p_member_id
    AND lc_type.code = 'sticker_types'
    AND lv_type.code = 'people'
    AND lv_status.code = 'active'
    AND s.expires_at > CURRENT_TIMESTAMP;

    RETURN v_sticker_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION submit_people_sticker_request(UUID, UUID, UUID, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_people_sticker_requests(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_people_sticker_request(UUID, UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_people_sticker(UUID, UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION submit_people_sticker_request(UUID, UUID, UUID, JSONB, TEXT) IS 'Submit people sticker request for multiple household members';
COMMENT ON FUNCTION get_pending_people_sticker_requests(UUID) IS 'Get pending people sticker requests for admin review';
COMMENT ON FUNCTION approve_people_sticker_request(UUID, UUID, UUID[]) IS 'Approve people sticker request and create sticker records';
COMMENT ON FUNCTION has_active_people_sticker(UUID, UUID) IS 'Check if household member already has active people sticker';