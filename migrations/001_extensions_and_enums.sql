-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- NORMALIZED REFERENCE TABLES FOR LOOKUP DATA
-- =============================================================================

-- Lookup Categories - Groups all lookup types
CREATE TABLE lookup_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unified Lookup Values - All reference data in one normalized table
CREATE TABLE lookup_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES lookup_categories(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color_code VARCHAR(7), -- Hex color code for UI (optional)
    icon VARCHAR(50), -- Icon class or identifier (optional)
    metadata JSONB, -- Additional flexible data
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint: code must be unique within each category
    CONSTRAINT unique_category_code UNIQUE (category_id, code)
);

-- Create indexes for performance
CREATE INDEX idx_lookup_values_category_active ON lookup_values(category_id, is_active, sort_order);
CREATE INDEX idx_lookup_values_code ON lookup_values(code);
CREATE INDEX idx_lookup_categories_code ON lookup_categories(code);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

CREATE TRIGGER update_lookup_categories_updated_at BEFORE UPDATE ON lookup_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lookup_values_updated_at BEFORE UPDATE ON lookup_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INSERT REFERENCE DATA
-- =============================================================================

-- First, insert all lookup categories
INSERT INTO lookup_categories (code, name, description, sort_order) VALUES
('user_roles', 'User Roles', 'System user roles and permissions', 0),
('village_tenant_statuses', 'Village Tenant Statuses', 'Village operational status types', 1),
('household_statuses', 'Household Statuses', 'Household approval and activity status', 2),
('household_member_relationships', 'Household Member Relationships', 'Family and household relationship types', 3),
('vehicle_sticker_statuses', 'Vehicle Sticker Statuses', 'Vehicle access permit status', 4),
('guest_pass_statuses', 'Guest Pass Statuses', 'Guest access permission status', 5),
('construction_permit_types', 'Construction Permit Types', 'Types of construction activities', 6),
('construction_permit_statuses', 'Construction Permit Statuses', 'Construction permit workflow status', 7),
('delivery_types', 'Delivery Types', 'Categories of deliveries and packages', 8),
('delivery_statuses', 'Delivery Statuses', 'Delivery processing workflow status', 9),
('incident_types', 'Incident Types', 'Categories of reported incidents', 10),
('incident_severities', 'Incident Severities', 'Incident priority and urgency levels', 11),
('incident_statuses', 'Incident Statuses', 'Incident investigation workflow status', 12),
('security_log_person_types', 'Security Log Person Types', 'Types of people accessing the village', 13),
('security_log_actions', 'Security Log Actions', 'Types of security access actions', 14),
('security_log_methods', 'Security Log Methods', 'Methods of access authorization', 15),
('fee_types', 'Fee Types', 'Categories of fees and charges', 16),
('fee_frequencies', 'Fee Frequencies', 'Payment frequency options', 17),
('village_rule_categories', 'Village Rule Categories', 'Categories of community rules', 18);

-- Now insert all lookup values using category references
WITH categories AS (
  SELECT id, code FROM lookup_categories
)
INSERT INTO lookup_values (category_id, code, name, description, sort_order, color_code, icon) VALUES
-- User Roles
((SELECT id FROM categories WHERE code = 'user_roles'), 'superadmin', 'Super Administrator', 'System-wide administrator with access to all villages and settings', 0, '#dc3545', 'shield-check'),
((SELECT id FROM categories WHERE code = 'user_roles'), 'admin_head', 'Admin Head', 'Village administrator with full management permissions within their village', 1, '#007bff', 'person-gear'),
((SELECT id FROM categories WHERE code = 'user_roles'), 'admin_officer', 'Admin Officer', 'Village administrative officer with limited management permissions', 2, '#6f42c1', 'person-badge'),
((SELECT id FROM categories WHERE code = 'user_roles'), 'household_head', 'Household Head', 'Head of household with access to family and property management', 3, '#28a745', 'house-door'),
((SELECT id FROM categories WHERE code = 'user_roles'), 'security_officer', 'Security Officer', 'Security personnel with access to entry/exit logs and validation', 4, '#fd7e14', 'shield-shaded'),

-- Village Tenant Statuses
((SELECT id FROM categories WHERE code = 'village_tenant_statuses'), 'active', 'Active', 'Village is fully operational and accepting residents', 0, '#28a745', 'check-circle'),
((SELECT id FROM categories WHERE code = 'village_tenant_statuses'), 'inactive', 'Inactive', 'Village is temporarily not accepting new residents', 1, '#6c757d', 'pause-circle'),
((SELECT id FROM categories WHERE code = 'village_tenant_statuses'), 'suspended', 'Suspended', 'Village operations are suspended due to compliance issues', 2, '#dc3545', 'x-circle'),

-- Household Statuses
((SELECT id FROM categories WHERE code = 'household_statuses'), 'active', 'Active', 'Household is approved and residents can access village services', 0, '#28a745', 'house-check'),
((SELECT id FROM categories WHERE code = 'household_statuses'), 'inactive', 'Inactive', 'Household is temporarily inactive', 1, '#6c757d', 'house-slash'),
((SELECT id FROM categories WHERE code = 'household_statuses'), 'pending_approval', 'Pending Approval', 'Household application is awaiting administrative approval', 2, '#ffc107', 'hourglass-split'),

-- Household Member Relationships
((SELECT id FROM categories WHERE code = 'household_member_relationships'), 'head', 'Household Head', 'Primary responsible person for the household', 0, '#007bff', 'person-fill'),
((SELECT id FROM categories WHERE code = 'household_member_relationships'), 'spouse', 'Spouse', 'Married partner of the household head', 1, '#e83e8c', 'heart'),
((SELECT id FROM categories WHERE code = 'household_member_relationships'), 'child', 'Child', 'Son or daughter of household members', 2, '#17a2b8', 'emoji-smile'),
((SELECT id FROM categories WHERE code = 'household_member_relationships'), 'parent', 'Parent', 'Father or mother of household members', 3, '#6f42c1', 'person-walking'),
((SELECT id FROM categories WHERE code = 'household_member_relationships'), 'relative', 'Relative', 'Extended family member living in the household', 4, '#20c997', 'people'),
((SELECT id FROM categories WHERE code = 'household_member_relationships'), 'tenant', 'Tenant', 'Non-family member renting space in the household', 5, '#fd7e14', 'person-plus'),

-- Vehicle Sticker Statuses
((SELECT id FROM categories WHERE code = 'vehicle_sticker_statuses'), 'active', 'Active', 'Vehicle sticker is valid and allows entry', 0, '#28a745', 'car-front'),
((SELECT id FROM categories WHERE code = 'vehicle_sticker_statuses'), 'expired', 'Expired', 'Vehicle sticker has passed its expiration date', 1, '#6c757d', 'clock'),
((SELECT id FROM categories WHERE code = 'vehicle_sticker_statuses'), 'revoked', 'Revoked', 'Vehicle sticker has been canceled due to violations or non-payment', 2, '#dc3545', 'slash-circle'),

-- Guest Pass Statuses
((SELECT id FROM categories WHERE code = 'guest_pass_statuses'), 'pending', 'Pending', 'Guest pass request is awaiting household head approval', 0, '#ffc107', 'clock'),
((SELECT id FROM categories WHERE code = 'guest_pass_statuses'), 'approved', 'Approved', 'Guest pass has been approved and is ready for use', 1, '#17a2b8', 'check-square'),
((SELECT id FROM categories WHERE code = 'guest_pass_statuses'), 'active', 'Active', 'Guest pass is currently valid for entry', 2, '#28a745', 'person-check'),
((SELECT id FROM categories WHERE code = 'guest_pass_statuses'), 'expired', 'Expired', 'Guest pass validity period has ended', 3, '#6c757d', 'hourglass'),
((SELECT id FROM categories WHERE code = 'guest_pass_statuses'), 'revoked', 'Revoked', 'Guest pass has been canceled before expiration', 4, '#dc3545', 'person-x'),

-- Construction Permit Types
((SELECT id FROM categories WHERE code = 'construction_permit_types'), 'renovation', 'Renovation', 'Interior or exterior home improvement projects', 0, '#007bff', 'tools'),
((SELECT id FROM categories WHERE code = 'construction_permit_types'), 'addition', 'Addition', 'Adding new rooms or structures to existing property', 1, '#28a745', 'plus-square'),
((SELECT id FROM categories WHERE code = 'construction_permit_types'), 'repair', 'Repair', 'Fixing damaged structures or systems', 2, '#fd7e14', 'wrench'),
((SELECT id FROM categories WHERE code = 'construction_permit_types'), 'landscaping', 'Landscaping', 'Garden, lawn, or outdoor area modifications', 3, '#20c997', 'tree'),

-- Construction Permit Statuses
((SELECT id FROM categories WHERE code = 'construction_permit_statuses'), 'pending', 'Pending', 'Permit application is under review', 0, '#ffc107', 'file-earmark-text'),
((SELECT id FROM categories WHERE code = 'construction_permit_statuses'), 'approved', 'Approved', 'Permit has been approved and work can begin', 1, '#28a745', 'file-earmark-check'),
((SELECT id FROM categories WHERE code = 'construction_permit_statuses'), 'in_progress', 'In Progress', 'Construction work is currently ongoing', 2, '#007bff', 'gear'),
((SELECT id FROM categories WHERE code = 'construction_permit_statuses'), 'completed', 'Completed', 'Construction work has been finished and inspected', 3, '#17a2b8', 'check-all'),
((SELECT id FROM categories WHERE code = 'construction_permit_statuses'), 'rejected', 'Rejected', 'Permit application has been denied', 4, '#dc3545', 'file-earmark-x'),

-- Delivery Types
((SELECT id FROM categories WHERE code = 'delivery_types'), 'package', 'Package', 'Online shopping deliveries and parcels', 0, '#6f42c1', 'box'),
((SELECT id FROM categories WHERE code = 'delivery_types'), 'food', 'Food', 'Restaurant deliveries and grocery orders', 1, '#fd7e14', 'basket'),
((SELECT id FROM categories WHERE code = 'delivery_types'), 'service', 'Service', 'Maintenance, repair, or professional service visits', 2, '#20c997', 'tools'),
((SELECT id FROM categories WHERE code = 'delivery_types'), 'mail', 'Mail', 'Postal service letters and documents', 3, '#007bff', 'envelope'),

-- Delivery Statuses
((SELECT id FROM categories WHERE code = 'delivery_statuses'), 'arrived', 'Arrived', 'Delivery has arrived at the guard house', 0, '#17a2b8', 'truck'),
((SELECT id FROM categories WHERE code = 'delivery_statuses'), 'delivered', 'Delivered', 'Delivery has been handed directly to recipient', 1, '#28a745', 'hand-thumbs-up'),
((SELECT id FROM categories WHERE code = 'delivery_statuses'), 'stored', 'Stored', 'Delivery is being held at the guard house for pickup', 2, '#ffc107', 'archive'),
((SELECT id FROM categories WHERE code = 'delivery_statuses'), 'collected', 'Collected', 'Delivery has been picked up by the recipient', 3, '#6f42c1', 'check2-all'),

-- Incident Types
((SELECT id FROM categories WHERE code = 'incident_types'), 'security', 'Security', 'Security breaches, unauthorized access, or suspicious activity', 0, '#dc3545', 'shield-exclamation'),
((SELECT id FROM categories WHERE code = 'incident_types'), 'noise', 'Noise', 'Noise complaints and disturbances', 1, '#fd7e14', 'volume-up'),
((SELECT id FROM categories WHERE code = 'incident_types'), 'maintenance', 'Maintenance', 'Infrastructure or facility maintenance issues', 2, '#6c757d', 'wrench'),
((SELECT id FROM categories WHERE code = 'incident_types'), 'dispute', 'Dispute', 'Conflicts between residents or with management', 3, '#6f42c1', 'chat-square-text'),
((SELECT id FROM categories WHERE code = 'incident_types'), 'emergency', 'Emergency', 'Medical, fire, or other emergency situations', 4, '#dc3545', 'exclamation-triangle'),

-- Incident Severities
((SELECT id FROM categories WHERE code = 'incident_severities'), 'low', 'Low', 'Minor issues that can be addressed during regular hours', 0, '#28a745', 'circle'),
((SELECT id FROM categories WHERE code = 'incident_severities'), 'medium', 'Medium', 'Moderate issues requiring prompt attention within 24 hours', 1, '#ffc107', 'dash-circle'),
((SELECT id FROM categories WHERE code = 'incident_severities'), 'high', 'High', 'Serious issues requiring immediate attention within 4 hours', 2, '#fd7e14', 'exclamation-circle'),
((SELECT id FROM categories WHERE code = 'incident_severities'), 'critical', 'Critical', 'Emergency situations requiring immediate response', 3, '#dc3545', 'exclamation-triangle-fill'),

-- Incident Statuses
((SELECT id FROM categories WHERE code = 'incident_statuses'), 'open', 'Open', 'Incident has been reported and is awaiting assignment', 0, '#6c757d', 'folder2-open'),
((SELECT id FROM categories WHERE code = 'incident_statuses'), 'investigating', 'Investigating', 'Incident is being actively investigated or resolved', 1, '#007bff', 'search'),
((SELECT id FROM categories WHERE code = 'incident_statuses'), 'resolved', 'Resolved', 'Incident has been resolved and is awaiting closure', 2, '#17a2b8', 'check-circle'),
((SELECT id FROM categories WHERE code = 'incident_statuses'), 'closed', 'Closed', 'Incident has been fully closed and documented', 3, '#28a745', 'check-circle-fill'),

-- Security Log Person Types
((SELECT id FROM categories WHERE code = 'security_log_person_types'), 'resident', 'Resident', 'Household members with permanent access', 0, '#28a745', 'house-door'),
((SELECT id FROM categories WHERE code = 'security_log_person_types'), 'guest', 'Guest', 'Visitors with temporary guest passes', 1, '#17a2b8', 'person'),
((SELECT id FROM categories WHERE code = 'security_log_person_types'), 'worker', 'Worker', 'Construction workers or service providers with permits', 2, '#fd7e14', 'person-gear'),
((SELECT id FROM categories WHERE code = 'security_log_person_types'), 'delivery', 'Delivery', 'Delivery personnel bringing packages or food', 3, '#6f42c1', 'truck'),
((SELECT id FROM categories WHERE code = 'security_log_person_types'), 'visitor', 'Visitor', 'Other authorized visitors not covered by guest passes', 4, '#20c997', 'person-plus'),

-- Security Log Actions
((SELECT id FROM categories WHERE code = 'security_log_actions'), 'entry', 'Entry', 'Person entered the village premises', 0, '#28a745', 'arrow-right-circle'),
((SELECT id FROM categories WHERE code = 'security_log_actions'), 'exit', 'Exit', 'Person left the village premises', 1, '#6c757d', 'arrow-left-circle'),
((SELECT id FROM categories WHERE code = 'security_log_actions'), 'denied', 'Denied', 'Entry was refused due to invalid or missing authorization', 2, '#dc3545', 'x-circle'),

-- Security Log Methods
((SELECT id FROM categories WHERE code = 'security_log_methods'), 'sticker', 'Vehicle Sticker', 'Entry authorized using valid vehicle sticker', 0, '#007bff', 'car-front'),
((SELECT id FROM categories WHERE code = 'security_log_methods'), 'guest_pass', 'Guest Pass', 'Entry authorized using guest pass code', 1, '#17a2b8', 'credit-card'),
((SELECT id FROM categories WHERE code = 'security_log_methods'), 'worker_auth', 'Worker Authorization', 'Entry authorized using construction permit or service authorization', 2, '#fd7e14', 'tools'),
((SELECT id FROM categories WHERE code = 'security_log_methods'), 'manual', 'Manual Override', 'Entry manually authorized by security officer', 3, '#6c757d', 'hand-index'),

-- Fee Types
((SELECT id FROM categories WHERE code = 'fee_types'), 'association', 'Association Fee', 'Regular homeowners association dues', 0, '#007bff', 'building'),
((SELECT id FROM categories WHERE code = 'fee_types'), 'maintenance', 'Maintenance Fee', 'Common area and facility maintenance charges', 1, '#6c757d', 'tools'),
((SELECT id FROM categories WHERE code = 'fee_types'), 'construction', 'Construction Fee', 'Fees related to construction permits and inspections', 2, '#fd7e14', 'hammer'),
((SELECT id FROM categories WHERE code = 'fee_types'), 'sticker', 'Vehicle Sticker Fee', 'Annual or monthly vehicle registration fees', 3, '#28a745', 'car-front'),
((SELECT id FROM categories WHERE code = 'fee_types'), 'penalty', 'Penalty Fee', 'Fines for rule violations or late payments', 4, '#dc3545', 'exclamation-triangle'),

-- Fee Frequencies
((SELECT id FROM categories WHERE code = 'fee_frequencies'), 'one_time', 'One Time', 'Single payment fee', 0, '#6f42c1', 'calendar-event'),
((SELECT id FROM categories WHERE code = 'fee_frequencies'), 'monthly', 'Monthly', 'Fee charged every month', 1, '#007bff', 'calendar-month'),
((SELECT id FROM categories WHERE code = 'fee_frequencies'), 'quarterly', 'Quarterly', 'Fee charged every three months', 2, '#17a2b8', 'calendar-range'),
((SELECT id FROM categories WHERE code = 'fee_frequencies'), 'annual', 'Annual', 'Fee charged once per year', 3, '#28a745', 'calendar-check'),

-- Village Rule Categories
((SELECT id FROM categories WHERE code = 'village_rule_categories'), 'general', 'General', 'General community guidelines and policies', 0, '#6c757d', 'file-text'),
((SELECT id FROM categories WHERE code = 'village_rule_categories'), 'security', 'Security', 'Security protocols and access control rules', 1, '#dc3545', 'shield'),
((SELECT id FROM categories WHERE code = 'village_rule_categories'), 'construction', 'Construction', 'Building, renovation, and construction guidelines', 2, '#fd7e14', 'tools'),
((SELECT id FROM categories WHERE code = 'village_rule_categories'), 'vehicles', 'Vehicles', 'Vehicle registration, parking, and traffic rules', 3, '#007bff', 'car-front'),
((SELECT id FROM categories WHERE code = 'village_rule_categories'), 'conduct', 'Conduct', 'Behavioral expectations and community conduct rules', 4, '#28a745', 'person-check');