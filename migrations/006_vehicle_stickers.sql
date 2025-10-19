-- Create stickers table (supports vehicle, people, construction, and visitor stickers)
CREATE TABLE stickers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    sticker_type_id UUID NOT NULL REFERENCES lookup_values(id),
    sticker_code TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    issued_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,

    -- Optional foreign keys based on sticker type
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    household_member_id UUID REFERENCES household_members(id) ON DELETE CASCADE,

    -- Polymorphic data field for type-specific information
    sticker_data JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT stickers_code_length CHECK (length(sticker_code) >= 4 AND length(sticker_code) <= 20),
    CONSTRAINT stickers_expires_future CHECK (expires_at > issued_at),
    CONSTRAINT stickers_data_not_empty CHECK (jsonb_typeof(sticker_data) = 'object'),

    -- Unique constraint: sticker code unique within tenant
    UNIQUE(tenant_id, sticker_code)

    -- Foreign key constraints to ensure proper lookup_values references
    -- (Type and status validation happens at application level using lookup categories)
);

-- Create indexes for performance
CREATE INDEX idx_stickers_tenant_id ON stickers(tenant_id);
CREATE INDEX idx_stickers_household_id ON stickers(household_id);
CREATE INDEX idx_stickers_household_member_id ON stickers(household_member_id);
CREATE INDEX idx_stickers_sticker_code ON stickers(sticker_code);
CREATE INDEX idx_stickers_sticker_type_id ON stickers(sticker_type_id);
CREATE INDEX idx_stickers_status_id ON stickers(status_id);
CREATE INDEX idx_stickers_expires_at ON stickers(expires_at);
CREATE INDEX idx_stickers_issued_by ON stickers(issued_by);
CREATE INDEX idx_stickers_tenant_code ON stickers(tenant_id, sticker_code);
-- Index for active unexpired stickers by type
-- Note: Removed WHERE clause with CURRENT_TIMESTAMP as it's not IMMUTABLE
-- Application layer should filter by active status and expiry date
CREATE INDEX idx_stickers_active_unexpired ON stickers(tenant_id, sticker_type_id, status_id, expires_at);

-- Create trigger for updated_at
CREATE TRIGGER trigger_stickers_updated_at
    BEFORE UPDATE ON stickers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE stickers IS 'Multi-type stickers: vehicle, people, construction, and visitor access permits';
COMMENT ON COLUMN stickers.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN stickers.sticker_type_id IS 'Type of sticker (references lookup_values in sticker_types category)';
COMMENT ON COLUMN stickers.household_id IS 'Foreign key to households (for vehicle and construction stickers)';
COMMENT ON COLUMN stickers.household_member_id IS 'Foreign key to household members (for people stickers)';
COMMENT ON COLUMN stickers.sticker_data IS 'Type-specific data: vehicle info, person details, construction project, or visitor info';
COMMENT ON COLUMN stickers.sticker_code IS 'Unique sticker identifier within tenant';
COMMENT ON COLUMN stickers.issued_at IS 'When the sticker was issued';
COMMENT ON COLUMN stickers.expires_at IS 'When the sticker expires';
COMMENT ON COLUMN stickers.status_id IS 'Current status of the sticker (references lookup_values in sticker_statuses category)';
COMMENT ON COLUMN stickers.issued_by IS 'Admin user who issued the sticker';

-- Add new lookup categories for sticker types
INSERT INTO lookup_categories (code, name, description, sort_order) VALUES
('sticker_types', 'Sticker Types', 'Types of access stickers available in the village', 19),
('sticker_statuses', 'Sticker Statuses', 'Status of all sticker types (replaces vehicle_sticker_statuses)', 20);

-- Add sticker type lookup values
WITH categories AS (
  SELECT id, code FROM lookup_categories
)
INSERT INTO lookup_values (category_id, code, name, description, sort_order, color_code, icon) VALUES
-- Sticker Types
((SELECT id FROM categories WHERE code = 'sticker_types'), 'vehicle', 'Vehicle Sticker', 'Vehicle access permits linked to households', 0, '#007bff', 'car-front'),
((SELECT id FROM categories WHERE code = 'sticker_types'), 'people', 'People Sticker', 'Personal identification stickers for household members', 1, '#28a745', 'person-badge'),
((SELECT id FROM categories WHERE code = 'sticker_types'), 'construction', 'Construction Sticker', 'Temporary access for construction workers and contractors', 2, '#fd7e14', 'tools'),
((SELECT id FROM categories WHERE code = 'sticker_types'), 'visitor', 'Visitor Sticker', 'Temporary access stickers for visitors', 3, '#17a2b8', 'person-plus'),

-- Sticker Statuses (unified for all sticker types)
((SELECT id FROM categories WHERE code = 'sticker_statuses'), 'active', 'Active', 'Sticker is valid and allows access', 0, '#28a745', 'check-circle'),
((SELECT id FROM categories WHERE code = 'sticker_statuses'), 'expired', 'Expired', 'Sticker has passed its expiration date', 1, '#6c757d', 'clock'),
((SELECT id FROM categories WHERE code = 'sticker_statuses'), 'revoked', 'Revoked', 'Sticker has been canceled due to violations or other reasons', 2, '#dc3545', 'x-circle'),
((SELECT id FROM categories WHERE code = 'sticker_statuses'), 'pending', 'Pending', 'Sticker is awaiting approval or activation', 3, '#ffc107', 'hourglass-split');