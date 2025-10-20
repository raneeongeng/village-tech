-- Fix type mismatch in get_pending_vehicle_sticker_requests function
-- Column 5 (member_relationship) needs explicit TEXT casting

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
        u.email::TEXT,
        COALESCE(h.address, 'N/A')::TEXT AS household_address,
        COALESCE(hm.name, 'N/A')::TEXT AS member_name,
        COALESCE(lv_rel.name::TEXT, 'N/A') AS member_relationship,  -- Explicit cast to TEXT
        COALESCE(req.request_data->'vehicle_info', '{}'::jsonb) AS vehicle_info,
        COALESCE(req.request_data->>'proof_file_url', '')::TEXT AS proof_file_url,
        (req.request_data->>'remarks')::TEXT,
        req.submitted_at,
        lv_status.name::TEXT
    FROM onboarding_requests req
    JOIN users u ON req.requester_id = u.id
    LEFT JOIN households h ON (req.request_data->>'household_id')::UUID = h.id
    LEFT JOIN household_members hm ON (req.request_data->>'household_member_id')::UUID = hm.id
    LEFT JOIN lookup_values lv_rel ON hm.relationship_id = lv_rel.id
    JOIN lookup_values lv_status ON req.workflow_status_id = lv_status.id
    JOIN lookup_values lv_type ON req.request_type_id = lv_type.id
    JOIN lookup_categories lc_type ON lv_type.category_id = lc_type.id
    WHERE req.tenant_id = p_tenant_id
    AND lc_type.code = 'request_types'
    AND lv_type.code = 'sticker_vehicle_request'
    AND lv_status.code IN ('submitted', 'under_review', 'approved', 'ready_for_printing', 'printed')
    ORDER BY req.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Also fix the people sticker requests function with explicit casting
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
        u.email::TEXT,
        COALESCE(h.address, 'N/A')::TEXT AS household_address,
        req.request_data->'selected_members',
        (req.request_data->>'remarks')::TEXT,
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
    AND lv_status.code IN ('submitted', 'under_review', 'approved', 'ready_for_printing', 'printed')
    ORDER BY req.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;