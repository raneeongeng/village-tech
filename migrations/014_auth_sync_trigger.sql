-- Create function to sync auth.users with public.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_tenant_id UUID;
    default_role_id UUID;
    superadmin_role_id UUID;
    is_superadmin BOOLEAN := false;
    skip_insert BOOLEAN := false;
BEGIN
    -- Check if this user creation should skip automatic insertion
    IF NEW.raw_user_meta_data->>'skip_auto_insert' = 'true' THEN
        skip_insert := true;
        RAISE LOG 'Skipping auto-insert for user % due to skip_auto_insert flag', NEW.id;
        RETURN NEW;
    END IF;

    -- Check if this is a superadmin user (by email domain or metadata)
    IF NEW.email = 'superadmin@gmail.com' OR NEW.raw_user_meta_data->>'role' = 'superadmin' THEN
        is_superadmin := true;
    END IF;

    -- Get superadmin role ID
    SELECT id INTO superadmin_role_id
    FROM public.lookup_values
    WHERE category_id IN (
        SELECT id FROM public.lookup_categories WHERE code = 'user_roles'
    ) AND code = 'superadmin'
    LIMIT 1;

    IF is_superadmin AND superadmin_role_id IS NOT NULL THEN
        -- For superadmin users, set tenant_id to NULL and use superadmin role
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
            NEW.id,
            NULL, -- No tenant for superadmin
            NEW.email,
            superadmin_role_id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', 'Super'),
            COALESCE(NEW.raw_user_meta_data->>'last_name', 'Admin'),
            true,
            NOW(),
            NOW()
        );
    ELSE
        -- Regular user logic
        -- Try to get tenant_id from metadata first, then fallback to first active village
        IF NEW.raw_user_meta_data->>'tenant_id' IS NOT NULL THEN
            default_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
        ELSE
            SELECT id INTO default_tenant_id
            FROM public.villages
            WHERE status_id IN (
                SELECT id FROM public.lookup_values
                WHERE category_id IN (
                    SELECT id FROM public.lookup_categories WHERE code = 'village_tenant_statuses'
                ) AND code = 'active'
            )
            LIMIT 1;
        END IF;

        -- Try to get role from metadata first, then fallback to 'household_head' role
        IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
            SELECT id INTO default_role_id
            FROM public.lookup_values
            WHERE category_id IN (
                SELECT id FROM public.lookup_categories WHERE code = 'user_roles'
            ) AND code = NEW.raw_user_meta_data->>'role'
            LIMIT 1;
        END IF;

        -- If role not found from metadata, use default 'household_head' role
        IF default_role_id IS NULL THEN
            SELECT id INTO default_role_id
            FROM public.lookup_values
            WHERE category_id IN (
                SELECT id FROM public.lookup_categories WHERE code = 'user_roles'
            ) AND code = 'household_head'
            LIMIT 1;
        END IF;

        -- If no tenant or role found, skip insertion
        IF default_tenant_id IS NULL OR default_role_id IS NULL THEN
            RAISE WARNING 'No default tenant or role found for user %', NEW.id;
            RETURN NEW;
        END IF;

        -- Insert into public.users
        INSERT INTO public.users (
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
            NEW.id,
            default_tenant_id,
            NEW.email,
            default_role_id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'middle_name',
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            NEW.raw_user_meta_data->>'suffix',
            true,
            NOW(),
            NOW()
        );
    END IF;

    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    -- Log the specific error for debugging
    RAISE EXCEPTION 'Error in handle_new_user for %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add comments
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a public.users record when a new auth.users record is created';