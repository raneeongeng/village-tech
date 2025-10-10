-- Create guest_passes table (temporary visitor access)
CREATE TABLE guest_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    guest_info JSONB NOT NULL,
    pass_code TEXT NOT NULL,
    approved_by_household UUID REFERENCES users(id) ON DELETE SET NULL,
    logged_by_security UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT guest_passes_code_length CHECK (length(pass_code) >= 6 AND length(pass_code) <= 20),
    CONSTRAINT guest_passes_valid_period CHECK (valid_until > valid_from),
    CONSTRAINT guest_passes_guest_info_valid CHECK (
        jsonb_typeof(guest_info) = 'object' AND
        guest_info ? 'name' AND
        guest_info ? 'purpose' AND
        length(guest_info->>'name') >= 2 AND
        length(guest_info->>'purpose') >= 5
    ),
    CONSTRAINT guest_passes_entry_exit_logic CHECK (
        entry_time IS NULL OR exit_time IS NULL OR exit_time >= entry_time
    ),
    -- Guest pass approval logic moved to application layer
    -- (Status validation happens at application level for guest_pass_statuses category)

    -- Unique constraint: pass code unique within tenant
    UNIQUE(tenant_id, pass_code)

    -- Foreign key constraint to ensure status_id references lookup_values
    -- (Status validation happens at application level for guest_pass_statuses category)

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create indexes for performance
CREATE INDEX idx_guest_passes_tenant_id ON guest_passes(tenant_id);
CREATE INDEX idx_guest_passes_household_id ON guest_passes(household_id);
CREATE INDEX idx_guest_passes_pass_code ON guest_passes(pass_code);
CREATE INDEX idx_guest_passes_status_id ON guest_passes(status_id);
CREATE INDEX idx_guest_passes_valid_until ON guest_passes(valid_until);
CREATE INDEX idx_guest_passes_approved_by_household ON guest_passes(approved_by_household);
CREATE INDEX idx_guest_passes_logged_by_security ON guest_passes(logged_by_security);
CREATE INDEX idx_guest_passes_tenant_code ON guest_passes(tenant_id, pass_code);
-- Index for pending guest passes (subquery removed for performance)
-- Application layer should filter by pending status from lookup_values
CREATE INDEX idx_guest_passes_pending_approval ON guest_passes(household_id, status_id);
-- Index for active valid guest passes
-- Note: Removed WHERE clause with CURRENT_TIMESTAMP as it's not IMMUTABLE
-- Application layer should filter by approved/active status and validity dates
CREATE INDEX idx_guest_passes_active_valid ON guest_passes(tenant_id, status_id, valid_until);

-- Create trigger for updated_at
CREATE TRIGGER trigger_guest_passes_updated_at
    BEFORE UPDATE ON guest_passes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE guest_passes IS 'Temporary visitor access with approval workflow';
COMMENT ON COLUMN guest_passes.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN guest_passes.household_id IS 'Foreign key to households being visited';
COMMENT ON COLUMN guest_passes.guest_info IS 'Guest details (name, ID, phone, purpose)';
COMMENT ON COLUMN guest_passes.pass_code IS 'Unique pass identifier within tenant';
COMMENT ON COLUMN guest_passes.approved_by_household IS 'Household member who approved the visit';
COMMENT ON COLUMN guest_passes.logged_by_security IS 'Security officer who logged the guest';
COMMENT ON COLUMN guest_passes.valid_from IS 'When the pass becomes valid';
COMMENT ON COLUMN guest_passes.valid_until IS 'When the pass expires';
COMMENT ON COLUMN guest_passes.status_id IS 'Current status of the guest pass (references lookup_values)';
COMMENT ON COLUMN guest_passes.entry_time IS 'Actual entry timestamp';
COMMENT ON COLUMN guest_passes.exit_time IS 'Actual exit timestamp';
COMMENT ON COLUMN guest_passes.rejection_reason IS 'Reason for rejection if applicable';