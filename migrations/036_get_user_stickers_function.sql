-- Function to get household's stickers (both vehicle and people stickers)
CREATE OR REPLACE FUNCTION get_household_stickers(
    p_tenant_id UUID,
    p_household_id UUID
) RETURNS TABLE (
    id UUID,
    sticker_type TEXT,
    sticker_code TEXT,
    issued_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status_name TEXT,
    sticker_data JSONB,
    household_address TEXT,
    member_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        lv_type.name::TEXT as sticker_type,
        s.sticker_code,
        s.issued_at,
        s.expires_at,
        lv_status.name::TEXT as status_name,
        s.sticker_data,
        COALESCE(h.address, 'N/A') as household_address,
        COALESCE(hm.name, 'N/A') as member_name
    FROM stickers s
    JOIN lookup_values lv_type ON s.sticker_type_id = lv_type.id
    JOIN lookup_values lv_status ON s.status_id = lv_status.id
    LEFT JOIN households h ON s.household_id = h.id
    LEFT JOIN household_members hm ON s.household_member_id = hm.id
    WHERE s.tenant_id = p_tenant_id
    AND (
        -- For vehicle/household stickers, match by household_id
        (s.household_id IS NOT NULL AND s.household_id = p_household_id)
        OR
        -- For people stickers, match through household member's household_id
        (s.household_member_id IS NOT NULL AND hm.household_id = p_household_id)
    )
    ORDER BY s.issued_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_household_stickers(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_household_stickers(UUID, UUID) IS 'Get all stickers for a specific household (both vehicle and people stickers)';