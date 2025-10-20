-- Create auto-creation trigger for vehicle stickers

-- Create the trigger function that automatically creates stickers when requests are approved
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

        -- Create the sticker automatically
        BEGIN
            SELECT create_vehicle_sticker_from_request(
                NEW.id,
                v_admin_id,
                v_sticker_code,
                v_expires_at
            ) INTO v_sticker_id;

            RAISE NOTICE 'Auto-created sticker % for approved request %', v_sticker_id, NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to auto-create sticker for request %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create stickers when requests are approved
DROP TRIGGER IF EXISTS trigger_auto_create_vehicle_sticker ON onboarding_requests;

CREATE TRIGGER trigger_auto_create_vehicle_sticker
    AFTER UPDATE ON onboarding_requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_vehicle_sticker_on_approval();