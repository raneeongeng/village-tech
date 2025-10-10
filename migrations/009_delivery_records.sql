-- Create delivery_records table (package and service delivery tracking)
CREATE TABLE delivery_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    courier_info JSONB NOT NULL,
    delivery_type_id UUID NOT NULL REFERENCES lookup_values(id),
    logged_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    guard_house_storage BOOLEAN DEFAULT false NOT NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    arrival_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completion_time TIMESTAMPTZ,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT delivery_records_courier_info_valid CHECK (
        jsonb_typeof(courier_info) = 'object' AND
        courier_info ? 'name' AND
        length(courier_info->>'name') >= 2
    ),
    CONSTRAINT delivery_records_completion_logic CHECK (
        completion_time IS NULL OR completion_time >= arrival_time
    ),
    -- Delivery status completion logic moved to application layer
    -- (Status validation happens at application level for delivery_statuses category)
    -- Guard house storage logic moved to application layer
    -- (Status validation happens at application level for delivery_statuses category)
    CONSTRAINT delivery_records_notes_length CHECK (
        delivery_notes IS NULL OR length(delivery_notes) <= 500
    )

    -- Foreign key constraint to ensure delivery_type_id references lookup_values
    -- (Type validation happens at application level for delivery_types category)

    -- Foreign key constraint to ensure status_id references lookup_values
    -- (Status validation happens at application level for delivery_statuses category)

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create indexes for performance
CREATE INDEX idx_delivery_records_tenant_id ON delivery_records(tenant_id);
CREATE INDEX idx_delivery_records_household_id ON delivery_records(household_id);
CREATE INDEX idx_delivery_records_delivery_type_id ON delivery_records(delivery_type_id);
CREATE INDEX idx_delivery_records_status_id ON delivery_records(status_id);
CREATE INDEX idx_delivery_records_logged_by ON delivery_records(logged_by);
CREATE INDEX idx_delivery_records_received_by ON delivery_records(received_by);
CREATE INDEX idx_delivery_records_guard_house_storage ON delivery_records(guard_house_storage);
CREATE INDEX idx_delivery_records_arrival_time ON delivery_records(arrival_time);
CREATE INDEX idx_delivery_records_completion_time ON delivery_records(completion_time);
-- Index for pending delivery records (subquery removed for performance)
-- Application layer should filter by arrived/stored status from lookup_values
CREATE INDEX idx_delivery_records_pending_delivery ON delivery_records(household_id, status_id);
-- Index for guard house pending deliveries (subquery removed for performance)
-- Application layer should filter by stored status from lookup_values
CREATE INDEX idx_delivery_records_guard_house_pending ON delivery_records(tenant_id, guard_house_storage, status_id);

-- Create trigger for updated_at
CREATE TRIGGER trigger_delivery_records_updated_at
    BEFORE UPDATE ON delivery_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE delivery_records IS 'Package and service delivery tracking';
COMMENT ON COLUMN delivery_records.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN delivery_records.household_id IS 'Foreign key to households receiving the delivery';
COMMENT ON COLUMN delivery_records.courier_info IS 'Courier details (name, company, phone)';
COMMENT ON COLUMN delivery_records.delivery_type_id IS 'Type of delivery (references lookup_values)';
COMMENT ON COLUMN delivery_records.logged_by IS 'Security officer who logged the delivery';
COMMENT ON COLUMN delivery_records.received_by IS 'Household member who received the delivery';
COMMENT ON COLUMN delivery_records.guard_house_storage IS 'Whether delivery is stored at guard house';
COMMENT ON COLUMN delivery_records.status_id IS 'Current status of the delivery (references lookup_values)';
COMMENT ON COLUMN delivery_records.arrival_time IS 'When the delivery arrived';
COMMENT ON COLUMN delivery_records.completion_time IS 'When the delivery was completed';
COMMENT ON COLUMN delivery_records.delivery_notes IS 'Additional notes about the delivery';