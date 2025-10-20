-- Add printing workflow statuses to sticker workflow
-- New flow: submit → approved → ready_for_printing → printed → completed

-- 1. Add 'ready_for_printing' status to workflow_statuses lookup values
INSERT INTO lookup_values (category_id, code, name, description, sort_order, is_active, created_at, updated_at)
SELECT
    lc.id,
    'ready_for_printing',
    'Ready for Printing',
    'Sticker request is approved and ready to be printed',
    3, -- Order between approved (2) and printed (4)
    true,
    now(),
    now()
FROM lookup_categories lc
WHERE lc.code = 'workflow_statuses'
AND NOT EXISTS (
    SELECT 1 FROM lookup_values lv
    WHERE lv.category_id = lc.id AND lv.code = 'ready_for_printing'
);

-- 2. Add 'printed' status to workflow_statuses lookup values
INSERT INTO lookup_values (category_id, code, name, description, sort_order, is_active, created_at, updated_at)
SELECT
    lc.id,
    'printed',
    'Printed',
    'Sticker has been printed and is ready for distribution',
    4, -- Order between ready_for_printing (3) and completed (5)
    true,
    now(),
    now()
FROM lookup_categories lc
WHERE lc.code = 'workflow_statuses'
AND NOT EXISTS (
    SELECT 1 FROM lookup_values lv
    WHERE lv.category_id = lc.id AND lv.code = 'printed'
);

-- 3. Update the auto-creation trigger to set status to 'ready_for_printing' instead of 'completed'
CREATE OR REPLACE FUNCTION auto_create_vehicle_sticker_on_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_old_status_code TEXT;
    v_new_status_code TEXT;
    v_request_type_code TEXT;
    v_sticker_id UUID;
    v_sticker_code TEXT;
    v_expires_at TIMESTAMPTZ;
    v_admin_id UUID;
    v_ready_for_printing_status_id UUID;
BEGIN
    -- Get status codes
    SELECT lv.code INTO v_old_status_code
    FROM lookup_values lv
    WHERE lv.id = OLD.workflow_status_id;

    SELECT lv.code INTO v_new_status_code
    FROM lookup_values lv
    WHERE lv.id = NEW.workflow_status_id;

    -- Get request type code
    SELECT lv.code INTO v_request_type_code
    FROM lookup_values lv
    WHERE lv.id = NEW.request_type_id;

    -- Only process vehicle sticker requests that are being approved
    IF v_request_type_code = 'sticker_vehicle_request'
       AND v_old_status_code != 'approved'
       AND v_new_status_code = 'approved' THEN

        -- Get current user as admin (or use a default)
        v_admin_id := auth.uid();
        IF v_admin_id IS NULL THEN
            SELECT id INTO v_admin_id
            FROM users
            WHERE tenant_id = NEW.tenant_id
            LIMIT 1;
        END IF;

        -- Generate sticker code
        v_sticker_code := 'VH-' || UPPER(substring(md5(random()::text) from 1 for 8));

        -- Set expiry to 1 year from now
        v_expires_at := now() + interval '1 year';

        -- Get ready_for_printing status ID
        SELECT lv.id INTO v_ready_for_printing_status_id
        FROM lookup_values lv
        JOIN lookup_categories lc ON lv.category_id = lc.id
        WHERE lc.code = 'workflow_statuses' AND lv.code = 'ready_for_printing';

        -- Create the sticker automatically
        BEGIN
            SELECT create_vehicle_sticker_from_request(
                NEW.id,
                v_admin_id,
                v_sticker_code,
                v_expires_at
            ) INTO v_sticker_id;

            -- Update request status to 'ready_for_printing' instead of 'completed'
            UPDATE onboarding_requests
            SET workflow_status_id = v_ready_for_printing_status_id,
                updated_at = now()
            WHERE id = NEW.id;

            RAISE NOTICE 'Auto-created sticker % and set request % to ready_for_printing status', v_sticker_id, NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to auto-create sticker for request %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update the create_vehicle_sticker_from_request function to NOT auto-complete
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

    -- Create the sticker record with all required fields including issued_at
    INSERT INTO stickers (
        tenant_id,
        sticker_type_id,
        sticker_code,
        issued_at,
        expires_at,
        status_id,
        issued_by,
        household_id,
        household_member_id,
        sticker_data,
        created_at,
        updated_at,
        created_by
    ) VALUES (
        v_request_record.tenant_id,
        v_vehicle_type_id,
        p_sticker_code,
        now(),
        p_expires_at,
        v_active_status_id,
        p_admin_id,
        (v_request_record.request_data->>'household_id')::UUID,
        (v_request_record.request_data->>'household_member_id')::UUID,
        v_request_record.request_data,
        now(),
        now(),
        p_admin_id
    ) RETURNING id INTO v_sticker_id;

    -- Note: Do NOT mark request as completed here - that's handled by the trigger
    -- which will set it to 'printed' status first

    RETURN v_sticker_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a function to mark requests as printed
CREATE OR REPLACE FUNCTION mark_sticker_request_printed(p_request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_printed_status_id UUID;
BEGIN
    -- Get printed status ID
    SELECT lv.id INTO v_printed_status_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'workflow_statuses' AND lv.code = 'printed';

    -- Update request to printed
    UPDATE onboarding_requests
    SET workflow_status_id = v_printed_status_id,
        updated_at = now()
    WHERE id = p_request_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a function to mark requests as completed (after distribution)
CREATE OR REPLACE FUNCTION mark_sticker_request_completed(p_request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_completed_status_id UUID;
BEGIN
    -- Get completed status ID
    SELECT lv.id INTO v_completed_status_id
    FROM lookup_values lv
    JOIN lookup_categories lc ON lv.category_id = lc.id
    WHERE lc.code = 'workflow_statuses' AND lv.code = 'completed';

    -- Update request to completed
    UPDATE onboarding_requests
    SET workflow_status_id = v_completed_status_id,
        updated_at = now()
    WHERE id = p_request_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 7. Verify the new workflow statuses
SELECT
    'Workflow Status Check' as info,
    lv.code,
    lv.name,
    lv.sort_order
FROM lookup_values lv
JOIN lookup_categories lc ON lv.category_id = lc.id
WHERE lc.code = 'workflow_statuses'
ORDER BY lv.sort_order;