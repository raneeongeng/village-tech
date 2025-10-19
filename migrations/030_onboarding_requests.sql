-- Create onboarding_requests table (flexible staging system for all types of requests)
CREATE TABLE onboarding_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    request_type_id UUID NOT NULL REFERENCES lookup_values(id),
    workflow_status_id UUID NOT NULL REFERENCES lookup_values(id),
    requester_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Flexible data storage for any request type
    request_data JSONB NOT NULL,
    reviewer_notes TEXT,

    -- Workflow timestamps
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Target record information (populated when request is completed)
    target_table TEXT,
    target_record_id UUID,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT onboarding_requests_data_not_empty CHECK (jsonb_typeof(request_data) = 'object'),
    CONSTRAINT onboarding_requests_reviewer_timestamp_consistency CHECK (
        (reviewer_id IS NULL AND reviewed_at IS NULL) OR
        (reviewer_id IS NOT NULL AND reviewed_at IS NOT NULL)
    ),
    CONSTRAINT onboarding_requests_completion_consistency CHECK (
        (target_record_id IS NULL AND target_table IS NULL AND completed_at IS NULL) OR
        (target_record_id IS NOT NULL AND target_table IS NOT NULL AND completed_at IS NOT NULL)
    ),
    CONSTRAINT onboarding_requests_target_table_valid CHECK (
        target_table IS NULL OR
        target_table IN ('households', 'stickers', 'household_members', 'users')
    )
);

-- Create indexes for performance
CREATE INDEX idx_onboarding_requests_tenant_id ON onboarding_requests(tenant_id);
CREATE INDEX idx_onboarding_requests_request_type_id ON onboarding_requests(request_type_id);
CREATE INDEX idx_onboarding_requests_workflow_status_id ON onboarding_requests(workflow_status_id);
CREATE INDEX idx_onboarding_requests_requester_id ON onboarding_requests(requester_id);
CREATE INDEX idx_onboarding_requests_reviewer_id ON onboarding_requests(reviewer_id);
CREATE INDEX idx_onboarding_requests_submitted_at ON onboarding_requests(submitted_at DESC);
CREATE INDEX idx_onboarding_requests_tenant_status ON onboarding_requests(tenant_id, workflow_status_id);
CREATE INDEX idx_onboarding_requests_tenant_type_status ON onboarding_requests(tenant_id, request_type_id, workflow_status_id);
-- Note: This index will be created after lookup_values are inserted
-- CREATE INDEX idx_onboarding_requests_pending_review ON onboarding_requests(tenant_id, workflow_status_id, submitted_at ASC);

-- Create trigger for updated_at
CREATE TRIGGER trigger_onboarding_requests_updated_at
    BEFORE UPDATE ON onboarding_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE onboarding_requests IS 'Flexible staging system for all types of requests (households, stickers, members, etc.)';
COMMENT ON COLUMN onboarding_requests.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN onboarding_requests.request_type_id IS 'Type of request (references lookup_values in request_types category)';
COMMENT ON COLUMN onboarding_requests.workflow_status_id IS 'Current workflow status (references lookup_values in workflow_statuses category)';
COMMENT ON COLUMN onboarding_requests.requester_id IS 'User who submitted the request';
COMMENT ON COLUMN onboarding_requests.reviewer_id IS 'Admin user reviewing the request';
COMMENT ON COLUMN onboarding_requests.request_data IS 'Flexible JSONB data containing all request details specific to the request type';
COMMENT ON COLUMN onboarding_requests.reviewer_notes IS 'Notes from reviewer (approval/rejection reasons, feedback)';
COMMENT ON COLUMN onboarding_requests.submitted_at IS 'When the request was submitted for review';
COMMENT ON COLUMN onboarding_requests.reviewed_at IS 'When the request was reviewed by admin';
COMMENT ON COLUMN onboarding_requests.completed_at IS 'When the request was completed and target record created';
COMMENT ON COLUMN onboarding_requests.target_table IS 'Table name where the final record was created';
COMMENT ON COLUMN onboarding_requests.target_record_id IS 'ID of the record created in the target table';

-- Add new lookup categories for the onboarding system
INSERT INTO lookup_categories (code, name, description, sort_order) VALUES
('request_types', 'Request Types', 'Types of onboarding and administrative requests', 21),
('workflow_statuses', 'Workflow Statuses', 'Status values for request workflow management', 22);

-- Add lookup values for request types and workflow statuses
WITH categories AS (
  SELECT id, code FROM lookup_categories
)
INSERT INTO lookup_values (category_id, code, name, description, sort_order, color_code, icon) VALUES
-- Request Types
((SELECT id FROM categories WHERE code = 'request_types'), 'household_registration', 'Household Registration', 'New household application and registration', 0, '#007bff', 'house-plus'),
((SELECT id FROM categories WHERE code = 'request_types'), 'sticker_vehicle_request', 'Vehicle Sticker Request', 'Request for vehicle access sticker', 1, '#28a745', 'car-front'),
((SELECT id FROM categories WHERE code = 'request_types'), 'sticker_people_request', 'People Sticker Request', 'Request for personal identification sticker', 2, '#17a2b8', 'person-badge'),
((SELECT id FROM categories WHERE code = 'request_types'), 'sticker_construction_request', 'Construction Sticker Request', 'Request for construction worker access sticker', 3, '#fd7e14', 'tools'),
((SELECT id FROM categories WHERE code = 'request_types'), 'sticker_visitor_request', 'Visitor Sticker Request', 'Request for temporary visitor access sticker', 4, '#6f42c1', 'person-plus'),
((SELECT id FROM categories WHERE code = 'request_types'), 'household_member_addition', 'Household Member Addition', 'Request to add new member to existing household', 5, '#20c997', 'people'),

-- Workflow Statuses
((SELECT id FROM categories WHERE code = 'workflow_statuses'), 'draft', 'Draft', 'Request is being prepared by requester', 0, '#6c757d', 'file-earmark-text'),
((SELECT id FROM categories WHERE code = 'workflow_statuses'), 'submitted', 'Submitted', 'Request has been submitted and awaiting review', 1, '#ffc107', 'upload'),
((SELECT id FROM categories WHERE code = 'workflow_statuses'), 'under_review', 'Under Review', 'Request is being actively reviewed by admin', 2, '#007bff', 'eye'),
((SELECT id FROM categories WHERE code = 'workflow_statuses'), 'approved', 'Approved', 'Request has been approved and ready for completion', 3, '#28a745', 'check-circle'),
((SELECT id FROM categories WHERE code = 'workflow_statuses'), 'rejected', 'Rejected', 'Request has been denied with reasons provided', 4, '#dc3545', 'x-circle'),
((SELECT id FROM categories WHERE code = 'workflow_statuses'), 'completed', 'Completed', 'Request has been finalized and target record created', 5, '#17a2b8', 'check-all'),
((SELECT id FROM categories WHERE code = 'workflow_statuses'), 'cancelled', 'Cancelled', 'Request was cancelled by the requester', 6, '#6c757d', 'dash-circle');

-- Create a general pending review index (will cover most queries efficiently)
CREATE INDEX idx_onboarding_requests_pending_review ON onboarding_requests(tenant_id, workflow_status_id, submitted_at ASC);