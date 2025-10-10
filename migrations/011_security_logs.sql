-- Create security_logs table (entry/exit tracking for all personnel)
CREATE TABLE security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    person_type_id UUID NOT NULL REFERENCES lookup_values(id),
    person_id UUID, -- Links to relevant entity (user, guest_pass, etc.)
    logged_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    action_id UUID NOT NULL REFERENCES lookup_values(id),
    method_id UUID NOT NULL REFERENCES lookup_values(id),
    vehicle_info JSONB,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT security_logs_vehicle_info_valid CHECK (
        vehicle_info IS NULL OR jsonb_typeof(vehicle_info) = 'object'
    ),
    CONSTRAINT security_logs_notes_length CHECK (
        notes IS NULL OR length(notes) <= 500
    )
    -- Foreign key constraints already defined in column definitions above
    -- No additional explicit constraints needed as they're redundant
);

-- Create indexes for performance
CREATE INDEX idx_security_logs_tenant_id ON security_logs(tenant_id);
CREATE INDEX idx_security_logs_person_type_id ON security_logs(person_type_id);
CREATE INDEX idx_security_logs_person_id ON security_logs(person_id);
CREATE INDEX idx_security_logs_logged_by ON security_logs(logged_by);
CREATE INDEX idx_security_logs_action_id ON security_logs(action_id);
CREATE INDEX idx_security_logs_method_id ON security_logs(method_id);
CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX idx_security_logs_tenant_timestamp ON security_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_security_logs_person_tracking ON security_logs(tenant_id, person_type_id, person_id, timestamp DESC);
-- Simplified indexes without subqueries for better performance
CREATE INDEX idx_security_logs_recent_entries ON security_logs(tenant_id, action_id, timestamp DESC);
CREATE INDEX idx_security_logs_action_type ON security_logs(tenant_id, action_id, timestamp DESC);

-- Create trigger for updated_at
CREATE TRIGGER trigger_security_logs_updated_at
    BEFORE UPDATE ON security_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE security_logs IS 'Entry/exit tracking for all personnel and vehicles';
COMMENT ON COLUMN security_logs.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN security_logs.person_type_id IS 'Type of person (resident, guest, worker, etc.) (references lookup_values)';
COMMENT ON COLUMN security_logs.person_id IS 'Reference to specific entity (user_id, guest_pass_id, etc.)';
COMMENT ON COLUMN security_logs.logged_by IS 'Security officer who logged the entry/exit';
COMMENT ON COLUMN security_logs.action_id IS 'Type of action (entry, exit, denied) (references lookup_values)';
COMMENT ON COLUMN security_logs.method_id IS 'Method used for validation (references lookup_values)';
COMMENT ON COLUMN security_logs.vehicle_info IS 'Vehicle details if applicable';
COMMENT ON COLUMN security_logs.notes IS 'Additional notes from security officer';
COMMENT ON COLUMN security_logs.timestamp IS 'When the log entry was created';