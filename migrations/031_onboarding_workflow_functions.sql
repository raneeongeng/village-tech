-- Workflow management functions for the onboarding system

-- Function to submit a new request
CREATE OR REPLACE FUNCTION submit_onboarding_request(
    p_tenant_id UUID,
    p_request_type_code TEXT,
    p_requester_id UUID,
    p_request_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_request_type_id UUID;
    v_submitted_status_id UUID;
BEGIN
    -- Get request type ID
    SELECT lv.id INTO v_request_type_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'request_types' AND lv.code = p_request_type_code;

    IF v_request_type_id IS NULL THEN
        RAISE EXCEPTION 'Invalid request type: %', p_request_type_code;
    END IF;

    -- Get submitted status ID
    SELECT lv.id INTO v_submitted_status_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'workflow_statuses' AND lv.code = 'submitted';

    -- Insert the request
    INSERT INTO onboarding_requests (
        tenant_id,
        request_type_id,
        workflow_status_id,
        requester_id,
        request_data,
        submitted_at,
        created_by
    ) VALUES (
        p_tenant_id,
        v_request_type_id,
        v_submitted_status_id,
        p_requester_id,
        p_request_data,
        CURRENT_TIMESTAMP,
        p_requester_id
    ) RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update request status
CREATE OR REPLACE FUNCTION update_request_status(
    p_request_id UUID,
    p_new_status_code TEXT,
    p_reviewer_id UUID DEFAULT NULL,
    p_reviewer_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_new_status_id UUID;
    v_current_request onboarding_requests%ROWTYPE;
BEGIN
    -- Get the current request
    SELECT * INTO v_current_request
    FROM onboarding_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found: %', p_request_id;
    END IF;

    -- Get new status ID
    SELECT lv.id INTO v_new_status_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'workflow_statuses' AND lv.code = p_new_status_code;

    IF v_new_status_id IS NULL THEN
        RAISE EXCEPTION 'Invalid status code: %', p_new_status_code;
    END IF;

    -- Update the request
    UPDATE onboarding_requests SET
        workflow_status_id = v_new_status_id,
        reviewer_id = COALESCE(p_reviewer_id, reviewer_id),
        reviewer_notes = COALESCE(p_reviewer_notes, reviewer_notes),
        reviewed_at = CASE
            WHEN p_new_status_code IN ('under_review', 'approved', 'rejected')
            THEN CURRENT_TIMESTAMP
            ELSE reviewed_at
        END,
        updated_by = p_reviewer_id
    WHERE id = p_request_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a request and create target record
CREATE OR REPLACE FUNCTION complete_onboarding_request(
    p_request_id UUID,
    p_target_table TEXT,
    p_target_record_id UUID,
    p_reviewer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_completed_status_id UUID;
BEGIN
    -- Get completed status ID
    SELECT lv.id INTO v_completed_status_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'workflow_statuses' AND lv.code = 'completed';

    -- Update the request to completed
    UPDATE onboarding_requests SET
        workflow_status_id = v_completed_status_id,
        target_table = p_target_table,
        target_record_id = p_target_record_id,
        completed_at = CURRENT_TIMESTAMP,
        updated_by = p_reviewer_id
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found: %', p_request_id;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending requests for review
CREATE OR REPLACE FUNCTION get_pending_requests(
    p_tenant_id UUID,
    p_request_type_code TEXT DEFAULT NULL
) RETURNS TABLE (
    request_id UUID,
    request_type_code TEXT,
    request_type_name TEXT,
    requester_email TEXT,
    submitted_at TIMESTAMPTZ,
    request_data JSONB,
    workflow_status_code TEXT,
    workflow_status_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        req.id,
        rt.code::TEXT,
        rt.name::TEXT,
        u.email::TEXT,
        req.submitted_at,
        req.request_data,
        ws.code::TEXT,
        ws.name::TEXT
    FROM onboarding_requests req
    JOIN lookup_values rt ON req.request_type_id = rt.id
    JOIN lookup_categories rtc ON rt.category_id = rtc.id AND rtc.code = 'request_types'
    JOIN lookup_values ws ON req.workflow_status_id = ws.id
    JOIN lookup_categories wsc ON ws.category_id = wsc.id AND wsc.code = 'workflow_statuses'
    JOIN users u ON req.requester_id = u.id
    WHERE req.tenant_id = p_tenant_id
    AND ws.code IN ('submitted', 'under_review')
    AND (CASE WHEN p_request_type_code IS NULL THEN TRUE ELSE rt.code = p_request_type_code END)
    ORDER BY req.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Example usage functions for specific request types

-- Submit vehicle sticker request
CREATE OR REPLACE FUNCTION submit_vehicle_sticker_request(
    p_tenant_id UUID,
    p_requester_id UUID,
    p_household_id UUID,
    p_vehicle_make TEXT,
    p_vehicle_model TEXT,
    p_vehicle_plate TEXT,
    p_vehicle_color TEXT
) RETURNS UUID AS $$
DECLARE
    v_request_data JSONB;
BEGIN
    v_request_data := jsonb_build_object(
        'household_id', p_household_id,
        'vehicle_info', jsonb_build_object(
            'make', p_vehicle_make,
            'model', p_vehicle_model,
            'plate', p_vehicle_plate,
            'color', p_vehicle_color
        )
    );

    RETURN submit_onboarding_request(
        p_tenant_id,
        'sticker_vehicle_request',
        p_requester_id,
        v_request_data
    );
END;
$$ LANGUAGE plpgsql;

-- Submit household registration request
CREATE OR REPLACE FUNCTION submit_household_registration(
    p_tenant_id UUID,
    p_requester_id UUID,
    p_address TEXT,
    p_contact_info JSONB
) RETURNS UUID AS $$
DECLARE
    v_request_data JSONB;
BEGIN
    v_request_data := jsonb_build_object(
        'address', p_address,
        'contact_info', p_contact_info,
        'household_head_id', p_requester_id
    );

    RETURN submit_onboarding_request(
        p_tenant_id,
        'household_registration',
        p_requester_id,
        v_request_data
    );
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION submit_onboarding_request IS 'Submit a new onboarding request of any type';
COMMENT ON FUNCTION update_request_status IS 'Update the workflow status of a request';
COMMENT ON FUNCTION complete_onboarding_request IS 'Mark a request as completed and link to target record';
COMMENT ON FUNCTION get_pending_requests IS 'Get all pending requests for admin review';
COMMENT ON FUNCTION submit_vehicle_sticker_request IS 'Convenience function to submit vehicle sticker requests';
COMMENT ON FUNCTION submit_household_registration IS 'Convenience function to submit household registration requests';