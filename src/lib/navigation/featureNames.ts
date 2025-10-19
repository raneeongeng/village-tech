/**
 * Feature name mapping for navigation items
 * Maps navigation item IDs to display names and descriptions for coming soon pages
 */

export interface FeatureConfig {
  name: string
  icon: string
  description: string
}

export const FEATURE_CONFIG: Record<string, FeatureConfig> = {
  // Superadmin features
  'villages': {
    name: 'Village List',
    icon: 'holiday_village',
    description: 'Manage villages and tenants across the platform. This comprehensive feature will allow you to create, edit, and oversee all villages in the system.'
  },
  'users': {
    name: 'Users',
    icon: 'group',
    description: 'Comprehensive user management system. Create, edit, and manage user accounts, roles, and permissions across all villages in the platform.'
  },
  'superadmin-payments': {
    name: 'Payments',
    icon: 'payment',
    description: 'Advanced payment processing and billing system. Handle all financial transactions, fees, and billing across villages with integrated reporting.'
  },
  'reports': {
    name: 'Reports',
    icon: 'assessment',
    description: 'Comprehensive analytics and reporting dashboard. Generate detailed insights, export data, and monitor key performance indicators.'
  },

  // Admin Head features
  'household-approvals': {
    name: 'Household Approvals',
    icon: 'approval',
    description: 'Review and approve household applications. Streamline the onboarding process for new residents with comprehensive application management tools.'
  },
  'active-households': {
    name: 'Active Households',
    icon: 'home',
    description: 'Manage active household records and information. View, edit, and maintain comprehensive household data with member management capabilities.'
  },
  'fees-management': {
    name: 'Fees Management',
    icon: 'request_quote',
    description: 'Configure and manage community fees and charges. Set fee structures, manage billing cycles, and handle payment collection workflows.'
  },
  'payment-status': {
    name: 'Payment Status',
    icon: 'payment',
    description: 'Monitor payment statuses and track collections. View outstanding payments, generate payment reports, and manage collection activities.'
  },
  'rules': {
    name: 'Rules',
    icon: 'rule',
    description: 'Create and manage community rules and regulations. Define policies, set guidelines, and ensure residents stay informed of community standards.'
  },
  'announcements': {
    name: 'Announcements',
    icon: 'campaign',
    description: 'Create and manage community announcements. Keep residents informed with important updates, events, and community news.'
  },
  'construction-permits': {
    name: 'Construction Permits',
    icon: 'engineering',
    description: 'Manage construction permits and approvals. Handle permit applications, track construction activities, and ensure compliance with community guidelines.'
  },
  'sticker-approvals': {
    name: 'Sticker Approvals',
    icon: 'approval',
    description: 'Review and approve vehicle and people sticker requests. Process applications, verify documentation, and manage sticker approval workflows.'
  },

  // Admin Officer features
  'household-records': {
    name: 'Household Records',
    icon: 'folder',
    description: 'Comprehensive household record management system. Access, update, and maintain detailed household information and member data.'
  },
  'sticker-requests': {
    name: 'Sticker Requests',
    icon: 'local_offer',
    description: 'Manage vehicle sticker requests and applications. Process new sticker requests, handle renewals, and track sticker inventory.'
  },
  'active-stickers': {
    name: 'Active Stickers',
    icon: 'verified',
    description: 'Track and manage active vehicle stickers. Monitor sticker status, handle renewals, and maintain sticker database records.'
  },
  'officer-construction-permits': {
    name: 'Construction Permits',
    icon: 'engineering',
    description: 'Process and manage construction permit applications. Review submissions, track approval progress, and coordinate with contractors.'
  },
  'manual-payments': {
    name: 'Manual Payments',
    icon: 'payments',
    description: 'Process manual payment transactions. Handle cash payments, payment corrections, and special payment arrangements.'
  },
  'resident-inquiries': {
    name: 'Resident Inquiries',
    icon: 'help',
    description: 'Manage and respond to resident inquiries and support requests. Track communication history and resolution status.'
  },

  // Household Head features
  'members': {
    name: 'Members',
    icon: 'people',
    description: 'Manage your household members and their information. Add, edit, and organize family member details and access permissions.'
  },
  'visitor-management': {
    name: 'Visitor Management',
    icon: 'person_add',
    description: 'Manage visitor access and guest registrations. Pre-register visitors, generate guest passes, and track visitor activities.'
  },
  'active-guest-passes': {
    name: 'Active Guest Passes',
    icon: 'badge',
    description: 'View and manage active guest passes for your visitors. Track pass status, expiration dates, and visitor check-ins.'
  },
  'household-sticker-requests': {
    name: 'Sticker Requests',
    icon: 'local_offer',
    description: 'Submit and track vehicle sticker requests for your household. Apply for new stickers and manage renewals.'
  },
  'service-requests': {
    name: 'Service Requests',
    icon: 'build',
    description: 'Submit and track maintenance and service requests. Report issues, request repairs, and monitor resolution progress.'
  },
  'announcements-rules': {
    name: 'Announcements & Rules',
    icon: 'info',
    description: 'View community announcements and rules. Stay informed about community updates, events, and policy changes.'
  },
  'fee-status': {
    name: 'Fee Status',
    icon: 'receipt',
    description: 'View your fee status and payment history. Check outstanding balances, payment due dates, and transaction records.'
  },

  // Security Officer features
  'sticker-validation': {
    name: 'Sticker Validation',
    icon: 'verified_user',
    description: 'Validate vehicle stickers and access permissions. Scan and verify vehicle stickers to ensure authorized access to the community.'
  },
  'guest-registration': {
    name: 'Guest Registration',
    icon: 'how_to_reg',
    description: 'Register guests and visitors at the security checkpoint. Process visitor information and generate temporary access credentials.'
  },
  'guest-approval-status': {
    name: 'Guest Approval Status',
    icon: 'pending_actions',
    description: 'Check guest approval status and pre-registered visitors. Verify visitor authorization and manage guest access permissions.'
  },
  'guest-pass-scan': {
    name: 'Guest Pass Scan / Entry Log',
    icon: 'qr_code_scanner',
    description: 'Scan guest passes and log visitor entries. Track visitor check-ins, departures, and maintain security entry logs.'
  },
  'delivery-logging': {
    name: 'Delivery Logging',
    icon: 'local_shipping',
    description: 'Log deliveries and package arrivals. Track delivery information, recipient details, and package collection status.'
  },
  'construction-worker-entry': {
    name: 'Construction Worker Entry',
    icon: 'construction',
    description: 'Manage construction worker access and entry logging. Verify worker credentials and track construction site access.'
  },
  'incident-report': {
    name: 'Incident Report',
    icon: 'report',
    description: 'Create and manage security incident reports. Document incidents, track investigations, and maintain security records.'
  },
  'shift-history': {
    name: 'Shift History / Logs',
    icon: 'history',
    description: 'View shift history and security logs. Access previous shift reports, activity logs, and security event records.'
  }
}

/**
 * Get feature configuration by navigation item ID
 */
export function getFeatureConfig(itemId: string): FeatureConfig | null {
  return FEATURE_CONFIG[itemId] || null
}

/**
 * Get feature name by navigation item ID
 */
export function getFeatureName(itemId: string): string {
  const config = getFeatureConfig(itemId)
  return config?.name || 'Feature'
}

/**
 * Get feature icon by navigation item ID
 */
export function getFeatureIcon(itemId: string): string {
  const config = getFeatureConfig(itemId)
  return config?.icon || 'construction'
}

/**
 * Get feature description by navigation item ID
 */
export function getFeatureDescription(itemId: string): string {
  const config = getFeatureConfig(itemId)
  return config?.description || 'This feature is currently under development. Check back soon!'
}

/**
 * Check if a navigation item should show coming soon content
 */
export function isComingSoonFeature(itemId: string): boolean {
  // Exclude implemented features
  const implementedFeatures = [
    'dashboard',
    'villages',
    'household-approvals',
    'active-households',
    'members',
    'sticker-approvals'
  ]
  return !implementedFeatures.includes(itemId) && FEATURE_CONFIG.hasOwnProperty(itemId)
}

/**
 * Get page title for header
 */
export function getPageTitle(itemId: string): string {
  if (itemId === 'dashboard') {
    return 'Dashboard'
  }
  return getFeatureName(itemId)
}