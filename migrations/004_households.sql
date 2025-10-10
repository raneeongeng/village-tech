-- Create households table (primary residential units)
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    household_head_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    address TEXT NOT NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT households_address_length CHECK (length(address) >= 10 AND length(address) <= 255),

    -- Foreign key constraint to lookup_values for status validation
    CONSTRAINT households_status_fkey FOREIGN KEY (status_id) REFERENCES lookup_values(id),

    -- Note: Approval logic validation should be handled at application level
    -- to avoid complex database constraints
    CONSTRAINT households_approval_consistency CHECK (
        (approved_by IS NULL AND approved_at IS NULL) OR
        (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    ),

    -- Foreign key constraint to users
    CONSTRAINT households_head_fkey FOREIGN KEY (household_head_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_households_tenant_id ON households(tenant_id);
CREATE INDEX idx_households_household_head_id ON households(household_head_id);
CREATE INDEX idx_households_status_id ON households(status_id);
CREATE INDEX idx_households_approved_by ON households(approved_by);
CREATE INDEX idx_households_tenant_status ON households(tenant_id, status_id);

-- Create trigger for updated_at
CREATE TRIGGER trigger_households_updated_at
    BEFORE UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE households IS 'Primary residential units within village tenants';
COMMENT ON COLUMN households.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN households.household_head_id IS 'Primary contact person for this household';
COMMENT ON COLUMN households.address IS 'Physical address of the household';
COMMENT ON COLUMN households.status_id IS 'Approval status of the household (references lookup_values)';
COMMENT ON COLUMN households.approved_by IS 'Admin user who approved this household';
COMMENT ON COLUMN households.approved_at IS 'Timestamp when household was approved';