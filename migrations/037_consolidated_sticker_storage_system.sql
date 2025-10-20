-- Consolidated sticker and storage system improvements
-- Combines essential functionality from migrations 039-051

-- 1. Storage Upload Functions (from 046)
-- Create application-level file upload validation since storage policies have permission issues

CREATE OR REPLACE FUNCTION can_user_upload_to_path(
    p_user_id UUID,
    p_file_path TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_tenant_id UUID;
    v_path_tenant_id TEXT;
BEGIN
    -- Get user's tenant ID
    SELECT tenant_id INTO v_user_tenant_id
    FROM users
    WHERE id = p_user_id;

    -- Extract tenant ID from file path (sticker-proofs/{tenant_id}/filename)
    v_path_tenant_id := (string_to_array(p_file_path, '/'))[2];

    -- Check if user's tenant matches path tenant
    RETURN v_user_tenant_id::TEXT = v_path_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_upload_url(
    p_user_id UUID,
    p_tenant_id UUID,
    p_file_name TEXT,
    p_file_type TEXT DEFAULT 'sticker-proofs'
) RETURNS TEXT AS $$
DECLARE
    v_user_tenant_id UUID;
    v_file_path TEXT;
    v_timestamp TEXT;
    v_random_id TEXT;
BEGIN
    -- Verify user belongs to tenant
    SELECT tenant_id INTO v_user_tenant_id
    FROM users
    WHERE id = p_user_id;

    IF v_user_tenant_id != p_tenant_id THEN
        RAISE EXCEPTION 'User does not belong to specified tenant';
    END IF;

    -- Generate unique file path
    v_timestamp := extract(epoch from now())::bigint::text;
    v_random_id := substring(md5(random()::text) from 1 for 8);
    v_file_path := format('%s/%s/%s-%s-%s',
        p_file_type,
        p_tenant_id,
        v_timestamp,
        v_random_id,
        p_file_name
    );

    RETURN v_file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Vehicle Sticker Creation Function (corrected version from debugging)
-- Create the function if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'create_vehicle_sticker_from_request'
    ) THEN
        CREATE OR REPLACE FUNCTION create_vehicle_sticker_from_request(
            p_request_id UUID,
            p_admin_id UUID,
            p_sticker_code TEXT,
            p_expires_at TIMESTAMPTZ
        ) RETURNS UUID AS $func$
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
                issued_at,              -- This field is required
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
                now(),                  -- issued_at: current timestamp
                p_expires_at,
                v_active_status_id,
                p_admin_id,
                (v_request_record.request_data->>'household_id')::UUID,
                (v_request_record.request_data->>'household_member_id')::UUID,
                v_request_record.request_data,
                now(),                  -- created_at
                now(),                  -- updated_at
                p_admin_id              -- created_by
            ) RETURNING id INTO v_sticker_id;

            -- Mark the request as completed
            UPDATE onboarding_requests
            SET workflow_status_id = (
                SELECT lv.id FROM lookup_values lv
                JOIN lookup_categories lc ON lv.category_id = lc.id
                WHERE lc.code = 'workflow_statuses' AND lv.code = 'completed'
            ),
            updated_at = now()
            WHERE id = p_request_id;

            RETURN v_sticker_id;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;
END $$;

-- 3. Auto-Create Stickers Trigger (from 051)
-- Create a function that automatically creates stickers when requests are approved
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

-- 4. Verification Queries
-- Verify the consolidated system is working
SELECT
    'Storage functions' as component,
    'can_user_upload_to_path' as function_name,
    CASE
        WHEN COUNT(*) > 0 THEN 'CREATED'
        ELSE 'MISSING'
    END as status
FROM pg_proc
WHERE proname = 'can_user_upload_to_path'

UNION ALL

SELECT
    'Storage functions' as component,
    'generate_upload_url' as function_name,
    CASE
        WHEN COUNT(*) > 0 THEN 'CREATED'
        ELSE 'MISSING'
    END as status
FROM pg_proc
WHERE proname = 'generate_upload_url'

UNION ALL

SELECT
    'Sticker functions' as component,
    'create_vehicle_sticker_from_request' as function_name,
    CASE
        WHEN COUNT(*) > 0 THEN 'CREATED'
        ELSE 'MISSING'
    END as status
FROM pg_proc
WHERE proname = 'create_vehicle_sticker_from_request'

UNION ALL

SELECT
    'Sticker functions' as component,
    'auto_create_vehicle_sticker_on_approval' as function_name,
    CASE
        WHEN COUNT(*) > 0 THEN 'CREATED'
        ELSE 'MISSING'
    END as status
FROM pg_proc
WHERE proname = 'auto_create_vehicle_sticker_on_approval';

-- Verify trigger was created
SELECT
    'Trigger status' as component,
    trigger_name as function_name,
    'ACTIVE' as status
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_vehicle_sticker';