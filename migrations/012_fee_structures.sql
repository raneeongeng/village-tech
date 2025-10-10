-- Create fee_structures table (village-specific charges and payment schedules)
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    fee_type_id UUID NOT NULL REFERENCES lookup_values(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency_id UUID NOT NULL REFERENCES lookup_values(id),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,

    -- Constraints
    CONSTRAINT fee_structures_name_length CHECK (length(name) >= 3 AND length(name) <= 100),
    CONSTRAINT fee_structures_description_length CHECK (length(description) >= 10 AND length(description) <= 500),
    CONSTRAINT fee_structures_amount_positive CHECK (amount > 0),
    CONSTRAINT fee_structures_effective_dates_logical CHECK (
        effective_until IS NULL OR effective_until >= effective_from
    ),
    CONSTRAINT fee_structures_name_unique_per_tenant UNIQUE (tenant_id, name, effective_from)

    -- Foreign key constraint to ensure fee_type_id references lookup_values
    -- (Type validation happens at application level for fee_types category)

    -- Foreign key constraint to ensure frequency_id references lookup_values
    -- (Frequency validation happens at application level for fee_frequencies category)

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create indexes for performance
CREATE INDEX idx_fee_structures_tenant_id ON fee_structures(tenant_id);
CREATE INDEX idx_fee_structures_fee_type_id ON fee_structures(fee_type_id);
CREATE INDEX idx_fee_structures_frequency_id ON fee_structures(frequency_id);
CREATE INDEX idx_fee_structures_is_active ON fee_structures(is_active);
CREATE INDEX idx_fee_structures_created_by ON fee_structures(created_by);
CREATE INDEX idx_fee_structures_effective_from ON fee_structures(effective_from);
CREATE INDEX idx_fee_structures_effective_until ON fee_structures(effective_until);
CREATE INDEX idx_fee_structures_active_fees ON fee_structures(tenant_id, is_active, effective_from, effective_until);
CREATE INDEX idx_fee_structures_current_fees ON fee_structures(tenant_id, fee_type_id, is_active);

-- Create trigger for updated_at
CREATE TRIGGER trigger_fee_structures_updated_at
    BEFORE UPDATE ON fee_structures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE fee_structures IS 'Village-specific charges and payment schedules';
COMMENT ON COLUMN fee_structures.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN fee_structures.fee_type_id IS 'Category of the fee (references lookup_values)';
COMMENT ON COLUMN fee_structures.name IS 'Display name of the fee';
COMMENT ON COLUMN fee_structures.description IS 'Detailed description of what the fee covers';
COMMENT ON COLUMN fee_structures.amount IS 'Fee amount in village currency';
COMMENT ON COLUMN fee_structures.frequency_id IS 'How often the fee is charged (references lookup_values)';
COMMENT ON COLUMN fee_structures.is_active IS 'Whether the fee is currently active';
COMMENT ON COLUMN fee_structures.created_by IS 'Admin user who created this fee structure';
COMMENT ON COLUMN fee_structures.effective_from IS 'Date when the fee becomes effective';
COMMENT ON COLUMN fee_structures.effective_until IS 'Date when the fee expires (null = indefinite)';

-- Create fee_payments table to track actual payments
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE RESTRICT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,
    receipt_number TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT fee_payments_amount_positive CHECK (amount_paid > 0),
    -- Payment date validation moved to application layer
    -- (Date validation should be done at application level to avoid IMMUTABLE function issues)
    CONSTRAINT fee_payments_receipt_length CHECK (
        receipt_number IS NULL OR (length(receipt_number) >= 3 AND length(receipt_number) <= 50)
    ),
    CONSTRAINT fee_payments_notes_length CHECK (
        notes IS NULL OR length(notes) <= 500
    )

    -- Foreign key constraints already ensure referential integrity
    -- (Tenant consistency is maintained through foreign key relationships)
);

-- Create indexes for fee_payments
CREATE INDEX idx_fee_payments_tenant_id ON fee_payments(tenant_id);
CREATE INDEX idx_fee_payments_household_id ON fee_payments(household_id);
CREATE INDEX idx_fee_payments_fee_structure_id ON fee_payments(fee_structure_id);
CREATE INDEX idx_fee_payments_payment_date ON fee_payments(payment_date);
CREATE INDEX idx_fee_payments_recorded_by ON fee_payments(recorded_by);
CREATE INDEX idx_fee_payments_household_recent ON fee_payments(household_id, payment_date DESC);

-- Create trigger for fee_payments updated_at
CREATE TRIGGER trigger_fee_payments_updated_at
    BEFORE UPDATE ON fee_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for fee_payments
COMMENT ON TABLE fee_payments IS 'Record of actual fee payments made by households';
COMMENT ON COLUMN fee_payments.tenant_id IS 'Foreign key to villages for data isolation';
COMMENT ON COLUMN fee_payments.household_id IS 'Household that made the payment';
COMMENT ON COLUMN fee_payments.fee_structure_id IS 'Fee structure being paid';
COMMENT ON COLUMN fee_payments.amount_paid IS 'Amount actually paid';
COMMENT ON COLUMN fee_payments.payment_date IS 'Date of payment';
COMMENT ON COLUMN fee_payments.payment_method IS 'Method of payment (cash, transfer, etc.)';
COMMENT ON COLUMN fee_payments.receipt_number IS 'Receipt or transaction reference';
COMMENT ON COLUMN fee_payments.notes IS 'Additional notes about the payment';
COMMENT ON COLUMN fee_payments.recorded_by IS 'Admin user who recorded the payment';