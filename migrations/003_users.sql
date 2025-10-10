-- Create users table (platform users with role-based access)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES lookup_values(id),
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    suffix TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_first_name_length CHECK (length(trim(first_name)) >= 1 AND length(trim(first_name)) <= 100),
    CONSTRAINT users_middle_name_length CHECK (middle_name IS NULL OR (length(trim(middle_name)) >= 1 AND length(trim(middle_name)) <= 100)),
    CONSTRAINT users_last_name_length CHECK (length(trim(last_name)) >= 1 AND length(trim(last_name)) <= 100),
    CONSTRAINT users_suffix_length CHECK (suffix IS NULL OR (length(trim(suffix)) >= 1 AND length(trim(suffix)) <= 20)),

    -- Foreign key constraint to lookup_values for role validation
    CONSTRAINT users_role_fkey FOREIGN KEY (role_id) REFERENCES lookup_values(id),

    -- Unique constraint: email unique within tenant
    UNIQUE(tenant_id, email)
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role_id);

-- Name search indexes
CREATE INDEX idx_users_first_name ON users(first_name);
CREATE INDEX idx_users_last_name ON users(last_name);
CREATE INDEX idx_users_full_name ON users(first_name, last_name);

-- Create trigger for updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Platform users with role-based access within village tenants';
COMMENT ON COLUMN users.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN users.email IS 'User email address (unique within tenant)';
COMMENT ON COLUMN users.role_id IS 'User role determining access permissions (references lookup_values)';
COMMENT ON COLUMN users.first_name IS 'User first/given name (required)';
COMMENT ON COLUMN users.middle_name IS 'User middle name or initial (optional)';
COMMENT ON COLUMN users.last_name IS 'User last/family name (required)';
COMMENT ON COLUMN users.suffix IS 'Name suffix like Jr., Sr., III (optional)';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';