-- Add household_member role to user_roles lookup values
-- This role is for family members who are not the head of household

WITH user_roles_category AS (
  SELECT id FROM lookup_categories WHERE code = 'user_roles'
)
INSERT INTO lookup_values (category_id, code, name, description, sort_order, color_code, icon)
SELECT
  urc.id,
  'household_member',
  'Household Member',
  'Family member with limited access to household features and services',
  4, -- After household_head (3) and before security_officer (4, which will become 5)
  '#17a2b8', -- Info blue color
  'person'
FROM user_roles_category urc
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values
  WHERE category_id = urc.id AND code = 'household_member'
);

-- Update sort_order for security_officer to be after household_member
UPDATE lookup_values
SET sort_order = 5
WHERE category_id IN (
  SELECT id FROM lookup_categories WHERE code = 'user_roles'
) AND code = 'security_officer';

-- Add comment for documentation
COMMENT ON TABLE lookup_values IS 'Unified lookup values table - includes household_member role for family members';