-- Create vehicle_stickers table (vehicle access permits)
CREATE TABLE vehicle_stickers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    vehicle_info JSONB NOT NULL,
    sticker_code TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    issued_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT vehicle_stickers_code_length CHECK (length(sticker_code) >= 4 AND length(sticker_code) <= 20),
    CONSTRAINT vehicle_stickers_expires_future CHECK (expires_at > issued_at),
    CONSTRAINT vehicle_stickers_vehicle_info_valid CHECK (
        jsonb_typeof(vehicle_info) = 'object' AND
        vehicle_info ? 'make' AND
        vehicle_info ? 'model' AND
        vehicle_info ? 'plate' AND
        vehicle_info ? 'color' AND
        length(vehicle_info->>'plate') >= 2
    ),

    -- Unique constraint: sticker code unique within tenant
    UNIQUE(tenant_id, sticker_code)

    -- Foreign key constraint to ensure status_id references lookup_values
    -- (Status validation happens at application level for vehicle_sticker_statuses category)

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create indexes for performance
CREATE INDEX idx_vehicle_stickers_tenant_id ON vehicle_stickers(tenant_id);
CREATE INDEX idx_vehicle_stickers_household_id ON vehicle_stickers(household_id);
CREATE INDEX idx_vehicle_stickers_sticker_code ON vehicle_stickers(sticker_code);
CREATE INDEX idx_vehicle_stickers_status_id ON vehicle_stickers(status_id);
CREATE INDEX idx_vehicle_stickers_expires_at ON vehicle_stickers(expires_at);
CREATE INDEX idx_vehicle_stickers_issued_by ON vehicle_stickers(issued_by);
CREATE INDEX idx_vehicle_stickers_tenant_code ON vehicle_stickers(tenant_id, sticker_code);
-- Index for active unexpired vehicle stickers
-- Note: Removed WHERE clause with CURRENT_TIMESTAMP as it's not IMMUTABLE
-- Application layer should filter by active status and expiry date
CREATE INDEX idx_vehicle_stickers_active_unexpired ON vehicle_stickers(tenant_id, status_id, expires_at);

-- Create trigger for updated_at
CREATE TRIGGER trigger_vehicle_stickers_updated_at
    BEFORE UPDATE ON vehicle_stickers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE vehicle_stickers IS 'Vehicle access permits linked to households';
COMMENT ON COLUMN vehicle_stickers.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN vehicle_stickers.household_id IS 'Foreign key to households owning the vehicle';
COMMENT ON COLUMN vehicle_stickers.vehicle_info IS 'Vehicle details (make, model, plate, color)';
COMMENT ON COLUMN vehicle_stickers.sticker_code IS 'Unique sticker identifier within tenant';
COMMENT ON COLUMN vehicle_stickers.issued_at IS 'When the sticker was issued';
COMMENT ON COLUMN vehicle_stickers.expires_at IS 'When the sticker expires';
COMMENT ON COLUMN vehicle_stickers.status_id IS 'Current status of the sticker (references lookup_values)';
COMMENT ON COLUMN vehicle_stickers.issued_by IS 'Admin user who issued the sticker';