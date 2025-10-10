-- Sync existing auth.users with public.users (one-time migration)
DO $$
DECLARE
    auth_user RECORD;
    default_tenant_id UUID;
    default_role_id UUID;
BEGIN
    -- Get the first available village (tenant)
    SELECT id INTO default_tenant_id
    FROM villages
    WHERE status_id IN (
        SELECT id FROM lookup_values
        WHERE category_id IN (
            SELECT id FROM lookup_categories WHERE code = 'village_tenant_statuses'
        ) AND code = 'active'
    )
    LIMIT 1;

    -- Get default user role (assuming 'resident' role exists)
    SELECT id INTO default_role_id
    FROM lookup_values
    WHERE category_id IN (
        SELECT id FROM lookup_categories WHERE code = 'user_roles'
    ) AND code = 'resident'
    LIMIT 1;

    -- If no tenant or role found, exit
    IF default_tenant_id IS NULL OR default_role_id IS NULL THEN
        RAISE NOTICE 'No default tenant or role found. Skipping sync.';
        RETURN;
    END IF;

    -- Sync existing auth users
    FOR auth_user IN
        SELECT id, email, raw_user_meta_data, created_at
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.users)
    LOOP
        INSERT INTO public.users (
            id,
            tenant_id,
            email,
            role_id,
            first_name,
            last_name,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            auth_user.id,
            default_tenant_id,
            auth_user.email,
            default_role_id,
            COALESCE(auth_user.raw_user_meta_data->>'first_name', split_part(auth_user.email, '@', 1)),
            COALESCE(auth_user.raw_user_meta_data->>'last_name', ''),
            true,
            auth_user.created_at,
            NOW()
        );

        RAISE NOTICE 'Synced user: %', auth_user.email;
    END LOOP;
END $$;