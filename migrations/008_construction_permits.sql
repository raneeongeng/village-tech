-- Create construction_permits table (home improvement approvals)
CREATE TABLE construction_permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    permit_type_id UUID NOT NULL REFERENCES lookup_values(id),
    description TEXT NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    fee_paid BOOLEAN DEFAULT false NOT NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    worker_authorizations JSONB DEFAULT '[]' NOT NULL,
    start_date DATE,
    end_date DATE,
    completion_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT construction_permits_description_length CHECK (length(description) >= 10 AND length(description) <= 1000),
    CONSTRAINT construction_permits_fee_positive CHECK (fee_amount >= 0),
    CONSTRAINT construction_permits_date_logic CHECK (
        start_date IS NULL OR end_date IS NULL OR end_date >= start_date
    ),
    CONSTRAINT construction_permits_worker_auth_valid CHECK (
        jsonb_typeof(worker_authorizations) = 'array'
    )
    -- Construction permit approval logic moved to application layer
    -- (Status validation happens at application level for construction_permit_statuses category)
    -- Fee payment logic moved to application layer
    -- (Status validation happens at application level for construction_permit_statuses category)
    -- Completion logic moved to application layer
    -- (Status validation happens at application level for construction_permit_statuses category)

    -- Foreign key constraint to ensure permit_type_id references lookup_values
    -- (Type validation happens at application level for construction_permit_types category)

    -- Foreign key constraint to ensure status_id references lookup_values
    -- (Status validation happens at application level for construction_permit_statuses category)

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create indexes for performance
CREATE INDEX idx_construction_permits_tenant_id ON construction_permits(tenant_id);
CREATE INDEX idx_construction_permits_household_id ON construction_permits(household_id);
CREATE INDEX idx_construction_permits_permit_type_id ON construction_permits(permit_type_id);
CREATE INDEX idx_construction_permits_status_id ON construction_permits(status_id);
CREATE INDEX idx_construction_permits_approved_by ON construction_permits(approved_by);
CREATE INDEX idx_construction_permits_fee_paid ON construction_permits(fee_paid);
CREATE INDEX idx_construction_permits_start_date ON construction_permits(start_date);
CREATE INDEX idx_construction_permits_end_date ON construction_permits(end_date);
-- Index for pending construction permits (subquery removed for performance)
-- Application layer should filter by pending status from lookup_values
CREATE INDEX idx_construction_permits_pending_approval ON construction_permits(tenant_id, status_id);
-- Index for active construction projects (subquery removed for performance)
-- Application layer should filter by approved/in_progress status from lookup_values
CREATE INDEX idx_construction_permits_active_projects ON construction_permits(tenant_id, status_id, start_date, end_date);

-- Create trigger for updated_at
CREATE TRIGGER trigger_construction_permits_updated_at
    BEFORE UPDATE ON construction_permits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE construction_permits IS 'Home improvement approvals with fee requirements';
COMMENT ON COLUMN construction_permits.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN construction_permits.household_id IS 'Foreign key to households requesting the permit';
COMMENT ON COLUMN construction_permits.permit_type_id IS 'Type of construction work (references lookup_values)';
COMMENT ON COLUMN construction_permits.description IS 'Detailed description of the construction work';
COMMENT ON COLUMN construction_permits.fee_amount IS 'Required fee for the permit';
COMMENT ON COLUMN construction_permits.fee_paid IS 'Whether the fee has been paid';
COMMENT ON COLUMN construction_permits.approved_by IS 'Admin user who approved the permit';
COMMENT ON COLUMN construction_permits.status_id IS 'Current status of the permit (references lookup_values)';
COMMENT ON COLUMN construction_permits.worker_authorizations IS 'List of authorized workers';
COMMENT ON COLUMN construction_permits.start_date IS 'Planned start date';
COMMENT ON COLUMN construction_permits.end_date IS 'Planned completion date';
COMMENT ON COLUMN construction_permits.completion_notes IS 'Notes upon project completion';