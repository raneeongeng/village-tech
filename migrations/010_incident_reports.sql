-- Create incident_reports table (security and community issue documentation)
CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    reported_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    incident_type_id UUID NOT NULL REFERENCES lookup_values(id),
    severity_id UUID NOT NULL REFERENCES lookup_values(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    evidence_urls JSONB DEFAULT '[]' NOT NULL,
    status_id UUID NOT NULL REFERENCES lookup_values(id),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    occurred_at TIMESTAMPTZ NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT incident_reports_title_length CHECK (length(title) >= 5 AND length(title) <= 200),
    CONSTRAINT incident_reports_description_length CHECK (length(description) >= 10 AND length(description) <= 2000),
    CONSTRAINT incident_reports_location_length CHECK (length(location) >= 3 AND length(location) <= 200),
    CONSTRAINT incident_reports_evidence_urls_valid CHECK (
        jsonb_typeof(evidence_urls) = 'array'
    ),
    CONSTRAINT incident_reports_occurred_before_reported CHECK (occurred_at <= reported_at)
    -- Incident resolution logic moved to application layer
    -- (Status validation happens at application level for incident_statuses category)
    -- Resolution notes logic moved to application layer
    -- (Status validation happens at application level for incident_statuses category)

    -- Foreign key constraint to ensure incident_type_id references lookup_values
    -- (Type validation happens at application level for incident_types category)

    -- Foreign key constraint to ensure severity_id references lookup_values
    -- (Severity validation happens at application level for incident_severities category)

    -- Foreign key constraint to ensure status_id references lookup_values
    -- (Status validation happens at application level for incident_statuses category)

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create indexes for performance
CREATE INDEX idx_incident_reports_tenant_id ON incident_reports(tenant_id);
CREATE INDEX idx_incident_reports_reported_by ON incident_reports(reported_by);
CREATE INDEX idx_incident_reports_incident_type_id ON incident_reports(incident_type_id);
CREATE INDEX idx_incident_reports_severity_id ON incident_reports(severity_id);
CREATE INDEX idx_incident_reports_status_id ON incident_reports(status_id);
CREATE INDEX idx_incident_reports_assigned_to ON incident_reports(assigned_to);
CREATE INDEX idx_incident_reports_occurred_at ON incident_reports(occurred_at);
CREATE INDEX idx_incident_reports_reported_at ON incident_reports(reported_at);
CREATE INDEX idx_incident_reports_resolved_at ON incident_reports(resolved_at);
-- Index for open incident reports (subquery removed for performance)
-- Application layer should filter by open/investigating status from lookup_values
CREATE INDEX idx_incident_reports_open_incidents ON incident_reports(tenant_id, status_id, severity_id);
-- Index for high severity incident reports (subquery removed for performance)
-- Application layer should filter by high/critical severity from lookup_values
CREATE INDEX idx_incident_reports_high_severity ON incident_reports(tenant_id, severity_id, status_id);
-- Index for assigned open incident reports (subquery removed for performance)
-- Application layer should filter by open/investigating status from lookup_values
CREATE INDEX idx_incident_reports_assigned_open ON incident_reports(assigned_to, status_id);

-- Create trigger for updated_at
CREATE TRIGGER trigger_incident_reports_updated_at
    BEFORE UPDATE ON incident_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE incident_reports IS 'Security and community issue documentation';
COMMENT ON COLUMN incident_reports.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN incident_reports.reported_by IS 'User who reported the incident';
COMMENT ON COLUMN incident_reports.incident_type_id IS 'Category of the incident (references lookup_values)';
COMMENT ON COLUMN incident_reports.severity_id IS 'Severity level of the incident (references lookup_values)';
COMMENT ON COLUMN incident_reports.title IS 'Brief title of the incident';
COMMENT ON COLUMN incident_reports.description IS 'Detailed description of the incident';
COMMENT ON COLUMN incident_reports.location IS 'Where the incident occurred';
COMMENT ON COLUMN incident_reports.evidence_urls IS 'URLs to photos or documents';
COMMENT ON COLUMN incident_reports.status_id IS 'Current status of the incident (references lookup_values)';
COMMENT ON COLUMN incident_reports.assigned_to IS 'User assigned to handle the incident';
COMMENT ON COLUMN incident_reports.resolution_notes IS 'Notes on how the incident was resolved';
COMMENT ON COLUMN incident_reports.occurred_at IS 'When the incident occurred';
COMMENT ON COLUMN incident_reports.reported_at IS 'When the incident was reported';
COMMENT ON COLUMN incident_reports.resolved_at IS 'When the incident was resolved';