/speckit.specify

# Feature: Super Admin Dashboard - Real Data Integration

Update the super admin dashboard to match the design and content from `design/superadmin/dashboard.html` and integrate with real Supabase data. Replace all mock data with actual database queries and implement proper error handling and empty state management.

## Background

The current super admin dashboard needs to:
1. Match the visual design from `design/superadmin/dashboard.html`
2. Display real data from Supabase instead of mock values
3. Handle loading states, errors, and empty data gracefully
4. Show 0 values properly when no data exists

## Design Reference

From `design/superadmin/dashboard.html`:

### Layout Structure

**Header (lines 36-55):**
- Logo + "VillageManager" branding (left)
- Search icon (center-right)
- Notification button with badge (icon with red dot)
- User avatar with "super admin" name (right)
- **Note:** Remove "Dashboard" text from header - keep only the icons and branding

**Main Content (lines 56-139):**
- Page title: "Dashboard Overview" (left)
- "Create New Village" button (right)
- 3 stat cards in grid: Total Villages, Active Tenants, Inactive Tenants
- "Recently Created Villages" table with columns: Name, Location, Status, Created At

### Color Scheme

**Use the project's unified color palette:**

```css
Primary – Forest Green: #22574A
  Use for headers, navigation, main branding elements, and primary buttons

Secondary – Sand: #E8DCCA
  Use for background sections, cards, and subtle highlights

Accent – Terracotta: #D96E49
  Use for buttons, links, badges, and key highlights (call-to-action elements)

Background/Text:
  Creamy White: #FCFBF9 (main background color)
  Mid-Gray: #555555 (text color for readability)
```

**Tailwind Configuration:**
```js
colors: {
  primary: '#22574A',      // Forest Green
  secondary: '#E8DCCA',    // Sand
  accent: '#D96E49',       // Terracotta
  background: '#FCFBF9',   // Creamy White
  text: '#555555',         // Mid-Gray
}
```

**Note:** This uses the same color scheme as the sidebar for design consistency across the entire application.

## Requirements

### 1. Dashboard Statistics Cards

**Display 3 cards with real data:**

#### Card 1: Total Villages
- **Label:** "Total Villages"
- **Query:** Count all records from `villages` table
- **Display:** Large number (text-3xl font-bold)
- **Handling:**
  - Loading: Show skeleton/spinner
  - Error: Show "Error loading data" with retry option
  - Zero: Display "0" (not "No data" message)
  - Success: Display count

#### Card 2: Active Tenants
- **Label:** "Active Tenants"
- **Query:** Count from `tenants` table where `status = 'active'`
- **Display:** Large number (text-3xl font-bold)
- **Handling:**
  - Loading: Show skeleton/spinner
  - Error: Show "Error loading data" with retry option
  - Zero: Display "0"
  - Success: Display count

#### Card 3: Inactive Tenants
- **Label:** "Inactive Tenants"
- **Query:** Count from `tenants` table where `status = 'inactive'`
- **Display:** Large number (text-3xl font-bold)
- **Handling:**
  - Loading: Show skeleton/spinner
  - Error: Show "Error loading data" with retry option
  - Zero: Display "0"
  - Success: Display count

**Card Styling (lines 66-77):**
```
- Container: rounded-lg border border-primary/20 bg-white p-6
- Label: text-base font-medium text-gray-500
- Value: mt-2 text-3xl font-bold text-gray-900
```

### 2. Recently Created Villages Table

**Display table with real village data:**

**Query Requirements:**
- Table: `villages`
- Fields: village name, location, status, created_at
- Order: Most recent first (ORDER BY created_at DESC)
- Limit: 5 most recent records
- Filter: All villages

**Columns:**
1. **Name** - Village name
2. **Location** - Village location/address
3. **Status** - Badge showing status (e.g., "Active" in green, "Inactive" in red, "Pending" in yellow)
4. **Created At** - Formatted date (YYYY-MM-DD)

**Status Badge Styling:**
- Active: `bg-green-100 text-green-800` with "Active" text
- Inactive: `bg-red-100 text-red-800` with "Inactive" text
- Pending: `bg-yellow-100 text-yellow-800` with "Pending" text
- All: `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium`

**Table States:**

1. **Loading State:**
   - Show skeleton rows (5 rows with gray animated backgrounds)
   - Maintain table structure

2. **Error State:**
   - Show message in table: "Failed to load villages. [Retry]"
   - Center the message across all columns
   - Provide retry button/link

3. **Empty State (0 villages):**
   - Show message: "No villages created yet."
   - Include icon (e.g., Material Icons "holiday_village")
   - Center the message across all columns
   - Optional: "Create New Village" CTA button

4. **Success State:**
   - Display all rows with data
   - Format dates consistently
   - Show status badges with correct colors

**Table Styling (lines 82-134):**
```
- Container: mt-4 overflow-hidden rounded-lg border border-primary/20
- Table: min-w-full divide-y divide-primary/20
- Header: bg-background-light, text-xs font-medium uppercase text-gray-500
- Body: bg-white, divide-y divide-primary/20
- Cells: px-6 py-4 text-sm
```

### 3. Database Schema Requirements

**Assumed tables structure:**

**villages table:**
```sql
id: uuid (primary key)
name: text
created_at: timestamp
... other fields
```

**tenants table:**
```sql
id: uuid (primary key)
name: text (or first_name + last_name)
village_id: uuid (foreign key to villages)
status: enum ('active', 'inactive')
created_at: timestamp
... other fields
```

**Note:** If schema differs, adjust queries accordingly. Document any schema changes needed.

### 4. Data Fetching Implementation

**Use Supabase client for all queries:**

**Example Statistics Query:**
```typescript
// Total Villages
const { count: totalVillages, error: villagesError } = await supabase
  .from('villages')
  .select('*', { count: 'exact', head: true });

// Active Tenants
const { count: activeTenants, error: activeError } = await supabase
  .from('tenants')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active');

// Inactive Tenants
const { count: inactiveTenants, error: inactiveError } = await supabase
  .from('tenants')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'inactive');
```

**Example Table Query:**
```typescript
const { data: recentVillages, error: villagesError } = await supabase
  .from('villages')
  .select(`
    id,
    name,
    location,
    status,
    created_at
  `)
  .order('created_at', { ascending: false })
  .limit(5);
```

**Fetching Strategy:**
- Use React hooks (useState, useEffect) or Next.js server components
- Fetch data on component mount
- Show loading state immediately
- Handle errors with user-friendly messages
- Allow retry on error

### 5. Error Handling

**Error Types to Handle:**

1. **Network Errors:**
   - Message: "Unable to connect. Please check your connection."
   - Action: [Retry] button

2. **Permission Errors:**
   - Message: "You don't have permission to view this data."
   - Action: Contact admin or logout

3. **Query Errors:**
   - Message: "Failed to load data. Please try again."
   - Action: [Retry] button

4. **Timeout Errors:**
   - Message: "Request timed out. Please try again."
   - Action: [Retry] button

**Error Display:**
- Stats cards: Show error message in place of number
- Table: Show error message row with retry option
- Use red/warning color for error states
- Log errors to console for debugging

### 6. Empty State Handling

**When data is empty (not error, just no records):**

**Stats Cards:**
- Display "0" as the value
- Keep normal styling (don't show error state)

**Table:**
- Show friendly empty state message
- Include icon (Material Symbol "group_off" or "person_off")
- Center message in table
- Optional: "Create New Village" or "Add First Tenant" CTA
- Keep table header visible

**Empty State Example:**
```jsx
<tr>
  <td colSpan={4} className="px-6 py-12 text-center">
    <span className="material-icons-outlined text-4xl text-gray-400">
      holiday_village
    </span>
    <p className="mt-2 text-gray-600">No villages created yet.</p>
    <button className="mt-4 text-primary hover:underline">
      Create New Village
    </button>
  </td>
</tr>
```

### 7. Loading State

**Statistics Cards:**
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
  <div className="h-8 bg-gray-300 rounded w-12"></div>
</div>
```

**Table Rows (5 skeleton rows):**
```jsx
{[1, 2, 3, 4, 5].map(i => (
  <tr key={i} className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
  </tr>
))}
```

### 8. Header Section

**Update header to match current layout (consistent with sidebar screenshot):**

**Elements:**
- **Branding (left):** "VillageManager" text with logo (text-xl font-bold text-primary)
- **Search Icon (center-right):** Material Icons "search" button
- **Notification Button:** Material Icons "notifications" with red badge dot (indicating notifications)
- **User Avatar (right):** Circular avatar with green background, letter "S", and "super admin" label

**Layout:**
- Full width header with white background
- Border bottom for separation
- Flexbox: space-between alignment
- Height: h-16 (64px)

**Remove:**
- "Dashboard" text page title from header
- Navigation links (Dashboard, Tenants, Villages, Reports) - these are in sidebar instead

**Note:** Header should match the top bar shown in the dashboard screenshot with sidebar.

### 9. Create New Village Button (lines 60-63)

**Button specifications:**
- Text: "Create New Village"
- Icon: Material Symbol "add" (before text)
- Position: Top right, aligned with "Dashboard Overview" title
- Styling: `bg-primary text-white px-5 py-3 rounded-lg hover:bg-primary/90`
- Functionality: Opens modal or navigates to create village page (implement routing or modal in separate spec)

### 10. Date Formatting

**Format created_at dates consistently:**
- Format: YYYY-MM-DD (e.g., "2024-07-26")
- Use JavaScript Date or library like date-fns
- Handle timezone appropriately
- Example: `new Date(created_at).toISOString().split('T')[0]`

### 11. Responsive Design

**From design/superadmin/dashboard.html:**

**Grid (line 65):**
- Mobile (default): 1 column
- Tablet (sm): 2 columns
- Desktop (lg): 3 columns
- Classes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

**Header actions (lines 58-63):**
- Mobile: Stack vertically (flex-col)
- Desktop: Horizontal (flex-row)
- Classes: `flex-col sm:flex-row`

**Table:**
- Horizontal scroll on small screens
- Classes: `overflow-x-auto`

## Implementation Steps

1. **Set up Supabase client** (if not already configured)
2. **Create TypeScript interfaces** for Tenant and Village types
3. **Implement data fetching hooks** or server components
4. **Build StatCard component** with loading/error/empty states
5. **Build TenantTable component** with all states
6. **Update page layout** to match design/superadmin/dashboard.html
7. **Style with Tailwind** using exact classes from HTML
8. **Test all states:** loading, error, empty, success
9. **Test with real data** from Supabase

## Testing Checklist

**Data States:**
- [ ] Loading: All cards and table show skeletons
- [ ] Error: Error messages display with retry buttons
- [ ] Empty: "0" shows in cards, empty message in table
- [ ] Success: Real data displays correctly

**Statistics Cards:**
- [ ] Total Villages shows correct count from database
- [ ] Active Tenants shows correct count (status = 'active')
- [ ] Inactive Tenants shows correct count (status = 'inactive')
- [ ] Cards handle 0 values properly (show "0", not error)

**Table:**
- [ ] Shows 5 most recent villages
- [ ] Village names display correctly
- [ ] Location displays correctly
- [ ] Status badges show correct color (green/red/yellow)
- [ ] Dates format as YYYY-MM-DD
- [ ] Empty state shows when no villages exist
- [ ] Horizontal scroll works on mobile

**Error Handling:**
- [ ] Network error shows appropriate message
- [ ] Retry button refetches data
- [ ] Permission errors show appropriate message
- [ ] Console logs errors for debugging

**Design:**
- [ ] Layout matches design/superadmin/dashboard.html structure
- [ ] Colors match project palette (primary: #22574A, secondary: #E8DCCA, accent: #D96E49)
- [ ] Typography matches (appropriate font, correct sizes)
- [ ] Spacing matches design
- [ ] Responsive grid works (1/2/3 columns)

## Success Criteria

✅ Dashboard displays real data from Supabase (no mock data)
✅ Statistics cards show accurate counts from database
✅ Recently Created Villages table shows real village records
✅ All loading states display properly
✅ All error states show user-friendly messages with retry
✅ Empty states (0 values) display correctly
✅ Header layout matches current design (no "Dashboard" text, only icons and branding)
✅ Design uses unified color palette (Forest Green, Sand, Terracotta)
✅ Responsive layout works on mobile, tablet, desktop
✅ No console errors or warnings
✅ Code is type-safe with TypeScript interfaces

## Files to Create/Modify

- `src/app/dashboard/page.tsx` or `src/pages/dashboard.tsx` - Main dashboard page
- `src/components/dashboard/StatCard.tsx` - Reusable stat card component
- `src/components/dashboard/VillageTable.tsx` - Village table component (replaces TenantTable)
- `src/hooks/useDashboardStats.ts` - Hook for fetching stats
- `src/hooks/useRecentVillages.ts` - Hook for fetching recent villages
- `src/types/dashboard.ts` - TypeScript interfaces for data
- `src/lib/supabase.ts` - Supabase client configuration (if not exists)

## TypeScript Interfaces

```typescript
interface Village {
  id: string;
  name: string;
  location?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  village_id: string;
  villages?: {
    name: string;
  };
}

interface DashboardStats {
  totalVillages: number;
  activeTenants: number;
  inactiveTenants: number;
}

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
```

## Notes

- **No mock data:** All values must come from Supabase
- **Color consistency:** Use the unified color palette (Forest Green #22574A, Sand #E8DCCA, Terracotta #D96E49) across all components for design consistency
- **Material Icons:** Use Material Icons Outlined (consistent with sidebar design)
- **Font:** Use appropriate font family (maintain consistency with overall design)
- **Dark mode:** Implement light mode first, dark mode can be added later
- **Navigation links:** May not be functional yet - focus on Dashboard display first

## Future Enhancements (Out of Scope)

- Real-time updates using Supabase subscriptions
- Dark mode toggle
- Export data functionality
- Filters and search for table
- Pagination for table (when more than 5 tenants)
- Click-through to tenant/village details
- Create New Village modal/page functionality
