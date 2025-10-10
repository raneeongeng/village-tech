-- Create villages table (root entity for multi-tenant isolation)
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    settings JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID, -- Will be populated by application logic
    updated_by UUID, -- Will be populated by application logic

    -- Constraints
    CONSTRAINT villages_name_length CHECK (length(name) >= 2 AND length(name) <= 100),
    CONSTRAINT villages_settings_valid CHECK (jsonb_typeof(settings) = 'object'),

    -- Foreign key constraint to lookup_values for status validation
    CONSTRAINT villages_status_fkey FOREIGN KEY (status_id) REFERENCES lookup_values(id)
);

-- Create indexes for performance
CREATE INDEX idx_villages_status_id ON villages(status_id);
CREATE INDEX idx_villages_name ON villages(name);

-- Create trigger for updated_at
CREATE TRIGGER trigger_villages_updated_at
    BEFORE UPDATE ON villages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE villages IS 'Root entity providing multi-tenant isolation for village communities';
COMMENT ON COLUMN villages.name IS 'Unique village name across the platform';
COMMENT ON COLUMN villages.status_id IS 'Village operational status (references lookup_values)';
COMMENT ON COLUMN villages.settings IS 'Village-specific configuration (timezone, currency, etc.)';
COMMENT ON COLUMN villages.created_by IS 'UUID of user who created this tenant';
COMMENT ON COLUMN villages.updated_by IS 'UUID of user who last updated this tenant';