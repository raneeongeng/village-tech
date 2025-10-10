-- Create village_rules table (community guidelines and regulations)
CREATE TABLE village_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    category_id UUID NOT NULL REFERENCES lookup_values(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    effective_from DATE NOT NULL,
    previous_version_id UUID REFERENCES village_rules(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,

    -- Constraints
    CONSTRAINT village_rules_title_length CHECK (length(title) >= 5 AND length(title) <= 200),
    CONSTRAINT village_rules_content_length CHECK (length(content) >= 20 AND length(content) <= 5000),
    CONSTRAINT village_rules_version_positive CHECK (version > 0),
    -- Effective date validation moved to application layer
    -- (Date validation should be done at application level to avoid IMMUTABLE function issues)
    CONSTRAINT village_rules_no_self_reference CHECK (id != previous_version_id)

    -- Foreign key constraint to ensure category_id references lookup_values
    -- (Category validation happens at application level for village_rule_categories)

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create unique constraint for active rules per category/title within tenant
CREATE UNIQUE INDEX idx_village_rules_active_unique
ON village_rules (tenant_id, category_id, title, is_active);

-- Create indexes for performance
CREATE INDEX idx_village_rules_tenant_id ON village_rules(tenant_id);
CREATE INDEX idx_village_rules_category_id ON village_rules(category_id);
CREATE INDEX idx_village_rules_is_active ON village_rules(is_active);
CREATE INDEX idx_village_rules_created_by ON village_rules(created_by);
CREATE INDEX idx_village_rules_effective_from ON village_rules(effective_from);
CREATE INDEX idx_village_rules_previous_version_id ON village_rules(previous_version_id);
CREATE INDEX idx_village_rules_version ON village_rules(version);
CREATE INDEX idx_village_rules_active_rules ON village_rules(tenant_id, category_id, is_active, effective_from);
CREATE INDEX idx_village_rules_rule_history ON village_rules(tenant_id, title, version, effective_from);

-- Create trigger for updated_at
CREATE TRIGGER trigger_village_rules_updated_at
    BEFORE UPDATE ON village_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle rule versioning
CREATE OR REPLACE FUNCTION create_rule_version()
RETURNS TRIGGER AS $$
BEGIN
    -- If updating an active rule, create new version instead
    IF TG_OP = 'UPDATE' AND OLD.is_active = true AND (OLD.title != NEW.title OR OLD.content != NEW.content) THEN
        -- Deactivate old version
        UPDATE village_rules SET is_active = false WHERE id = OLD.id;

        -- Create new version
        INSERT INTO village_rules (
            tenant_id, category_id, title, content, version, is_active,
            created_by, effective_from, previous_version_id, updated_by
        ) VALUES (
            NEW.tenant_id, NEW.category_id, NEW.title, NEW.content,
            OLD.version + 1, true, NEW.updated_by, NEW.effective_from, OLD.id, NEW.updated_by
        );

        RETURN NULL; -- Prevent the original update
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic versioning
CREATE TRIGGER trigger_village_rules_versioning
    BEFORE UPDATE ON village_rules
    FOR EACH ROW
    EXECUTE FUNCTION create_rule_version();

-- Add comments for documentation
COMMENT ON TABLE village_rules IS 'Community guidelines and regulations with versioning';
COMMENT ON COLUMN village_rules.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN village_rules.category_id IS 'Category of the rule (general, security, etc.) (references lookup_values)';
COMMENT ON COLUMN village_rules.title IS 'Brief title of the rule';
COMMENT ON COLUMN village_rules.content IS 'Full text of the rule or regulation';
COMMENT ON COLUMN village_rules.version IS 'Version number for rule tracking';
COMMENT ON COLUMN village_rules.is_active IS 'Whether this version is currently active';
COMMENT ON COLUMN village_rules.created_by IS 'Admin user who created this rule';
COMMENT ON COLUMN village_rules.effective_from IS 'Date when the rule becomes effective';
COMMENT ON COLUMN village_rules.previous_version_id IS 'Link to previous version of this rule';

-- Create view for current active rules
CREATE VIEW current_village_rules AS
SELECT
    id,
    tenant_id,
    category_id,
    title,
    content,
    version,
    created_by,
    effective_from,
    created_at,
    updated_at
FROM village_rules
WHERE is_active = true
ORDER BY tenant_id, category_id, title;

COMMENT ON VIEW current_village_rules IS 'View showing only currently active village rules';