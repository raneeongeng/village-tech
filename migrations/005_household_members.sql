-- Create household_members table (individual residents within households)
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for non-user members
    name TEXT NOT NULL,
    relationship_id UUID NOT NULL REFERENCES lookup_values(id),
    contact_info JSONB DEFAULT '{}' NOT NULL,
    photo_url TEXT,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT household_members_name_length CHECK (length(name) >= 2 AND length(name) <= 100),
    CONSTRAINT household_members_contact_valid CHECK (jsonb_typeof(contact_info) = 'object'),
    CONSTRAINT household_members_photo_url_format CHECK (
        photo_url IS NULL OR photo_url ~* '^https?://.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$'
    ),

    -- Foreign key constraint to lookup_values for relationship validation
    CONSTRAINT household_members_relationship_fkey FOREIGN KEY (relationship_id) REFERENCES lookup_values(id),

    -- Foreign key constraints
    CONSTRAINT household_members_household_fkey FOREIGN KEY (household_id) REFERENCES households(id),
    CONSTRAINT household_members_user_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create unique constraint for one primary member per household
CREATE UNIQUE INDEX idx_household_members_one_primary_per_household
ON household_members (household_id)
WHERE is_primary = true;

-- Create indexes for performance
CREATE INDEX idx_household_members_tenant_id ON household_members(tenant_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_relationship_id ON household_members(relationship_id);
CREATE INDEX idx_household_members_is_primary ON household_members(is_primary);

-- Create trigger for updated_at
CREATE TRIGGER trigger_household_members_updated_at
    BEFORE UPDATE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE household_members IS 'Individual residents within households';
COMMENT ON COLUMN household_members.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN household_members.household_id IS 'Foreign key to households';
COMMENT ON COLUMN household_members.user_id IS 'Optional link to user account (for app access)';
COMMENT ON COLUMN household_members.name IS 'Full name of the household member';
COMMENT ON COLUMN household_members.relationship_id IS 'Relationship to household head (references lookup_values)';
COMMENT ON COLUMN household_members.contact_info IS 'Contact details (phone, email, etc.)';
COMMENT ON COLUMN household_members.photo_url IS 'URL to member photo for identification';
COMMENT ON COLUMN household_members.is_primary IS 'Whether this is the primary household contact';