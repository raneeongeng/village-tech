/speckit.specify

# Feature: Fix Role-Based Navigation Content in Sidebar

The sidebar navigation is currently showing the same navigation items for all user roles. When logging in as `admin_head`, the sidebar displays the `superadmin` navigation items (Dashboard, Village List, Users, Payments, Reports) instead of the correct `admin_head` items.

## Problem

**Current Behavior:**
- Login as `admin_head` → Shows superadmin navigation items
- Login as any role → Shows same superadmin navigation items
- Role-based navigation configuration is not being applied correctly

**Expected Behavior:**
- Login as `admin_head` → Shows admin_head navigation items (Dashboard, Household Approvals, Active Households, Fees Management, Payment Status, Rules, Announcements, Construction Permits)
- Each role should see their specific navigation items as defined in the role-based configuration

## Root Cause

The sidebar component is not properly reading or applying the user's role from the authentication session/context to determine which navigation items to display.

## Solution Requirements

### 1. Role Detection
- Read the authenticated user's role from Supabase auth session
- Database role field values: `superadmin`, `admin_head`, `admin_officer`, `household_head`, `security_officer`
- Ensure role is available in the component that renders the sidebar
- Handle cases where role is undefined or invalid (default to minimal navigation or show error)

### 2. Role-Based Navigation Configuration

Create or fix the navigation configuration that maps each role to their navigation items:

#### superadmin Navigation
1. Dashboard - icon: `dashboard`, path: `/dashboard`
2. Village List - icon: `holiday_village`, path: `/villages`
3. Users - icon: `group`, path: `/users`
4. Payments - icon: `payment`, path: `/payments`, badge: true (show count)
5. Reports - icon: `assessment`, path: `/reports`

#### admin_head Navigation
1. Dashboard - icon: `dashboard`, path: `/dashboard`
2. Household Approvals - icon: `approval`, path: `/households/approvals`
3. Active Households - icon: `home`, path: `/households/active`
4. Fees Management - icon: `request_quote`, path: `/fees/management`
5. Payment Status - icon: `payment`, path: `/payments/status`
6. Rules - icon: `rule`, path: `/rules`
7. Announcements - icon: `campaign`, path: `/announcements`
8. Construction Permits - icon: `engineering`, path: `/permits/construction`

#### admin_officer Navigation
1. Dashboard - icon: `dashboard`, path: `/dashboard`
2. Household Records - icon: `folder`, path: `/households/records`
3. Sticker Requests - icon: `local_offer`, path: `/stickers/requests`
4. Active Stickers - icon: `verified`, path: `/stickers/active`
5. Construction Permits - icon: `engineering`, path: `/permits/construction`
6. Manual Payments - icon: `payments`, path: `/payments/manual`
7. Resident Inquiries - icon: `help`, path: `/inquiries`

#### household_head Navigation
1. Dashboard - icon: `dashboard`, path: `/dashboard`
2. Members - icon: `people`, path: `/household/members`
3. Visitor Management - icon: `person_add`, path: `/visitors/management`
4. Active Guest Passes - icon: `badge`, path: `/visitors/passes`
5. Sticker Requests - icon: `local_offer`, path: `/stickers/requests`
6. Service Requests - icon: `build`, path: `/services/requests`
7. Announcements & Rules - icon: `info`, path: `/announcements-rules`
8. Fee Status - icon: `receipt`, path: `/fees/status`

#### security_officer Navigation
1. Dashboard - icon: `dashboard`, path: `/dashboard`
2. Sticker Validation - icon: `verified_user`, path: `/security/stickers/validate`
3. Guest Registration - icon: `how_to_reg`, path: `/security/guests/register`
4. Guest Approval Status - icon: `pending_actions`, path: `/security/guests/approvals`
5. Guest Pass Scan / Entry Log - icon: `qr_code_scanner`, path: `/security/entry-log`
6. Delivery Logging - icon: `local_shipping`, path: `/security/deliveries`
7. Construction Worker Entry - icon: `construction`, path: `/security/construction-entry`
8. Incident Report - icon: `report`, path: `/security/incidents`
9. Shift History / Logs - icon: `history`, path: `/security/shift-logs`

### 3. Implementation Steps

**Step 1: Fix Role Fetching**
- Ensure user role is fetched from Supabase auth metadata or user profile
- Make role available in sidebar component via props or context
- Add error handling for missing or invalid roles

**Step 2: Update Navigation Config**
- Create or update `navigationConfig.ts` with role-to-items mapping
- Use TypeScript interface for type safety
- Include: label, icon, path, badge (optional)

**Step 3: Apply Role-Based Rendering**
- Update sidebar component to select navigation items based on user role
- Use configuration from step 2
- Render items dynamically using map function

**Step 4: Test All Roles**
- Test login as each of the 5 roles
- Verify correct navigation items appear
- Verify active state highlights current page
- Verify notification badge only shows for superadmin Payments

### 4. Code Structure

**Navigation Config Type:**
```typescript
interface NavigationItem {
  label: string;
  icon: string;
  path: string;
  badge?: boolean; // if true, fetch and display count
}

interface NavigationConfig {
  superadmin: NavigationItem[];
  admin_head: NavigationItem[];
  admin_officer: NavigationItem[];
  household_head: NavigationItem[];
  security_officer: NavigationItem[];
}
```

**Component Logic:**
```typescript
// Pseudo-code
const userRole = getUserRole(); // from auth context/session
const navigationItems = navigationConfig[userRole] || navigationConfig.superadmin;

return (
  <nav>
    {navigationItems.map(item => (
      <NavigationItem
        key={item.path}
        label={item.label}
        icon={item.icon}
        path={item.path}
        badge={item.badge}
        isActive={currentPath === item.path}
      />
    ))}
  </nav>
);
```

### 5. Verification Checklist

- [ ] Login as `superadmin` → See: Dashboard, Village List, Users, Payments (with badge), Reports
- [ ] Login as `admin_head` → See: Dashboard, Household Approvals, Active Households, Fees Management, Payment Status, Rules, Announcements, Construction Permits
- [ ] Login as `admin_officer` → See: Dashboard, Household Records, Sticker Requests, Active Stickers, Construction Permits, Manual Payments, Resident Inquiries
- [ ] Login as `household_head` → See: Dashboard, Members, Visitor Management, Active Guest Passes, Sticker Requests, Service Requests, Announcements & Rules, Fee Status
- [ ] Login as `security_officer` → See: Dashboard, Sticker Validation, Guest Registration, Guest Approval Status, Guest Pass Scan/Entry Log, Delivery Logging, Construction Worker Entry, Incident Report, Shift History/Logs
- [ ] All items have correct Material Icons Outlined
- [ ] Active page is highlighted with secondary background
- [ ] Hover effects work on all items
- [ ] Notification badge only appears on superadmin Payments item

## Files to Modify

Based on project structure from CLAUDE.md:
- `src/lib/navigation/navigationConfig.ts` - Update role-based config
- `src/components/navigation/Navigation.tsx` - Fix role detection and rendering
- `src/hooks/useNavigation.tsx` - Ensure role is available
- Check Supabase auth implementation for user role metadata

## Technical Notes

1. **Role Source:** User role should come from Supabase auth session metadata or a join with users/profiles table
2. **Fallback:** If role is missing, default to most restrictive (household_head or show error)
3. **Type Safety:** Use TypeScript to ensure role values match database enum
4. **Performance:** Memoize navigation config to avoid recalculating on every render
5. **Security:** Role-based navigation is UI only - ensure backend also validates role permissions

## Success Criteria

✅ Logging in as `admin_head` shows correct 8 navigation items for admin_head role
✅ All 5 roles display their specific navigation items
✅ No role sees another role's navigation items
✅ System handles invalid/missing roles gracefully
✅ Navigation items maintain visual design from previous specification
