# Design Reference Analysis: login.html to React Components

## Structure Overview

The design reference (`design/login.html`) follows a two-column layout with form on the left and branding on the right.

### HTML Structure → React Component Mapping

```html
<!-- Main Container -->
<div class="flex flex-col md:flex-row min-h-screen">
  <!-- Left Column: Form Section (order-2 md:order-1) -->
  <div class="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 order-2 md:order-1">
    <!-- Form Content -->
  </div>

  <!-- Right Column: Branding Section (order-1 md:order-2) -->
  <div class="w-full md:w-1/2 flex items-center justify-center bg-primary/10 order-1 md:order-2 p-8 lg:p-12">
    <!-- Branding Content -->
  </div>
</div>
```

### Component Breakdown

#### 1. Main Login Page (`src/app/(auth)/login/page.tsx`)
- **Container**: Two-column flex layout
- **Responsive**: Stacked on mobile, side-by-side on desktop
- **Order**: Form first on mobile, branding first on desktop

#### 2. LoginForm Component (`src/app/(auth)/login/components/LoginForm.tsx`)
- **Location**: Left column on desktop
- **Contains**:
  - Welcome header ("Welcome back")
  - Subtitle ("Log in to your Village Management dashboard")
  - Email input field
  - Password input field with "Forgot password?" link
  - Submit button
  - Divider with "Or continue with"
  - Social authentication buttons (GitHub, Email icons)
  - Sign up link at bottom

#### 3. BrandingArea Component (`src/app/(auth)/login/components/BrandingArea.tsx`)
- **Location**: Right column on desktop
- **Contains**:
  - Diamond icon in circle background
  - "Village Manager" heading (adapted from "Tenant Management")
  - Description text about the platform

#### 4. SocialAuth Component (`src/app/(auth)/login/components/SocialAuth.tsx`)
- **Purpose**: Placeholder for future OAuth integration
- **Contains**: Grid of social provider buttons (currently GitHub and Email icons)

### Design Token Migration

#### Colors (Design → VMP)
```css
/* Design Reference */
--primary: #1173d4 (Blue)
--background-light: #f6f7f8 (Light Gray)

/* VMP Colors */
--primary: #22574A (Forest Green)
--secondary: #E8DCCA (Warm Beige)
--accent: #D96E49 (Terracotta Orange)
--background: #FCFBF9 (Off White)
--text: #555555 (Charcoal Gray)
```

#### Typography
- **Font Family**: Inter (maintained from design reference)
- **Headings**: Poppins (VMP addition)
- **Weights**: 400, 500, 600, 700

#### Layout Specifications
- **Form Container**: `max-w-md` (448px max width)
- **Input Padding**: `px-4 py-3`
- **Border Radius**: `rounded-lg` (0.5rem)
- **Button**: Full width with `py-3 px-4` padding
- **Spacing**: `space-y-6` between form sections

### Responsive Behavior

#### Mobile (< 768px)
- Single column layout
- Form appears first (order-2 → order-1)
- Branding below form
- Reduced padding (`p-8`)

#### Desktop (≥ 768px)
- Two-column layout (50/50 split)
- Branding on right (order-1)
- Form on left (order-2)
- Increased padding (`lg:p-12`)

### Key Styling Classes to Preserve

#### Form Elements
```css
/* Input Fields */
.input-field {
  @apply appearance-none block w-full px-4 py-3 rounded-lg
         bg-white/50 border border-gray-300
         placeholder-gray-400 text-gray-900
         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
}

/* Submit Button */
.btn-primary {
  @apply w-full flex justify-center py-3 px-4 border border-transparent
         rounded-lg shadow-sm text-sm font-bold text-white
         bg-primary hover:bg-primary/90
         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary;
}

/* Social Auth Buttons */
.social-btn {
  @apply w-full inline-flex justify-center py-3 px-4
         border border-gray-300 rounded-lg shadow-sm
         bg-white/50 text-sm font-medium text-gray-700
         hover:bg-gray-50;
}
```

### Branding Adaptation

#### Original (Tenant Management)
- Title: "Tenant Management"
- Description: "A unified dashboard for Superadmins to manage tenants, roles, and system-wide settings with ease."
- Icon: Diamond/geometric shape

#### VMP Adaptation (Village Manager)
- Title: "Village Manager"
- Description: "A unified platform for villages and communities to manage residents, security, and operations with ease."
- Icon: Village/community-themed icon (to be designed)

### Implementation Priority

1. **Phase 1**: Create basic component structure matching HTML layout
2. **Phase 2**: Apply VMP color palette while preserving visual hierarchy
3. **Phase 3**: Integrate with React Hook Form and Supabase Auth
4. **Phase 4**: Add responsive behavior and animations
5. **Phase 5**: Implement accessibility features and keyboard navigation

### Visual Compliance Checklist

- [ ] Two-column layout preserved
- [ ] Mobile order switching implemented
- [ ] Form styling matches design reference
- [ ] Button and input styling consistent
- [ ] Color palette migrated to VMP colors
- [ ] Typography hierarchy maintained
- [ ] Responsive breakpoints aligned
- [ ] Branding updated for Village Manager context