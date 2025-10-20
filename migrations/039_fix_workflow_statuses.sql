-- Fix workflow statuses and ensure trigger works properly

-- Update the sort_order of existing statuses to make room for printing statuses
UPDATE lookup_values
SET sort_order = 5  -- Move approved from 3 to 5 to make room
WHERE code = 'approved'
AND category_id IN (
    SELECT id FROM lookup_categories WHERE code = 'workflow_statuses'
);

UPDATE lookup_values
SET sort_order = 7  -- Move rejected from 4 to 7
WHERE code = 'rejected'
AND category_id IN (
    SELECT id FROM lookup_categories WHERE code = 'workflow_statuses'
);

UPDATE lookup_values
SET sort_order = 8  -- Move completed from 5 to 8
WHERE code = 'completed'
AND category_id IN (
    SELECT id FROM lookup_categories WHERE code = 'workflow_statuses'
);

UPDATE lookup_values
SET sort_order = 9  -- Move cancelled from 6 to 9
WHERE code = 'cancelled'
AND category_id IN (
    SELECT id FROM lookup_categories WHERE code = 'workflow_statuses'
);

-- Now insert the new printing statuses in the right order
INSERT INTO lookup_values (category_id, code, name, description, sort_order, is_active, created_at, updated_at)
SELECT
    lc.id,
    'ready_for_printing',
    'Ready for Printing',
    'Sticker request is approved and ready to be printed',
    6, -- After approved (5), before rejected (7)
    true,
    now(),
    now()
FROM lookup_categories lc
WHERE lc.code = 'workflow_statuses'
AND NOT EXISTS (
    SELECT 1 FROM lookup_values lv
    WHERE lv.category_id = lc.id AND lv.code = 'ready_for_printing'
);

INSERT INTO lookup_values (category_id, code, name, description, sort_order, is_active, created_at, updated_at)
SELECT
    lc.id,
    'printed',
    'Printed',
    'Sticker has been printed and is ready for distribution',
    7, -- After ready_for_printing (6), before completed (8)
    true,
    now(),
    now()
FROM lookup_categories lc
WHERE lc.code = 'workflow_statuses'
AND NOT EXISTS (
    SELECT 1 FROM lookup_values lv
    WHERE lv.category_id = lc.id AND lv.code = 'printed'
);

-- Update the rejected sort_order again since we inserted printed at 7
UPDATE lookup_values
SET sort_order = 10  -- Move rejected after printed
WHERE code = 'rejected'
AND category_id IN (
    SELECT id FROM lookup_categories WHERE code = 'workflow_statuses'
);

-- Test the trigger with a specific approved request
DO $$
DECLARE
    v_approved_request_id UUID;
    v_approved_status_id UUID;
    v_ready_for_printing_status_id UUID;
BEGIN
    -- Find an approved vehicle sticker request
    SELECT req.id INTO v_approved_request_id
    FROM onboarding_requests req
    LEFT JOIN lookup_values lv_status ON req.workflow_status_id = lv_status.id
    LEFT JOIN lookup_values lv_type ON req.request_type_id = lv_type.id
    LEFT JOIN lookup_categories lc_type ON lv_type.category_id = lc_type.id
    WHERE lv_status.code = 'approved'
    AND lc_type.code = 'request_types'
    AND lv_type.code = 'sticker_vehicle_request'
    LIMIT 1;

    IF v_approved_request_id IS NOT NULL THEN
        -- Get status IDs
        SELECT lv.id INTO v_approved_status_id
        FROM lookup_values lv
        JOIN lookup_categories lc ON lv.category_id = lc.id
        WHERE lc.code = 'workflow_statuses' AND lv.code = 'approved';

        SELECT lv.id INTO v_ready_for_printing_status_id
        FROM lookup_values lv
        JOIN lookup_categories lc ON lv.category_id = lc.id
        WHERE lc.code = 'workflow_statuses' AND lv.code = 'ready_for_printing';

        -- Manually trigger the workflow change for this request
        UPDATE onboarding_requests
        SET workflow_status_id = v_ready_for_printing_status_id,
            updated_at = now()
        WHERE id = v_approved_request_id;

        RAISE NOTICE 'Updated request % from approved to ready_for_printing', v_approved_request_id;
    ELSE
        RAISE NOTICE 'No approved vehicle sticker requests found';
    END IF;
END $$;

-- Update the get_pending_people_sticker_requests function to include new workflow statuses
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
    AND lv_status.code IN ('submitted', 'under_review', 'approved', 'ready_for_printing', 'printed')
    ORDER BY req.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Also update the vehicle sticker requests function to include new workflow statuses
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
        COALESCE(h.address, 'N/A') AS household_address,
        COALESCE(hm.name, 'N/A') AS member_name,
        COALESCE(lv_rel.name, 'N/A') AS member_relationship,
        COALESCE(req.request_data->'vehicle_info', '{}'::jsonb) AS vehicle_info,
        COALESCE(req.request_data->>'proof_file_url', '') AS proof_file_url,
        req.request_data->>'remarks',
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

-- Verify the updated workflow statuses
SELECT
    'Updated Workflow Status Order' as info,
    lv.code,
    lv.name,
    lv.sort_order
FROM lookup_values lv
JOIN lookup_categories lc ON lv.category_id = lc.id
WHERE lc.code = 'workflow_statuses'
ORDER BY lv.sort_order;