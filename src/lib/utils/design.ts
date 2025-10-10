/**
 * Design Reference Utilities
 *
 * Utilities for converting design reference elements to VMP-compliant components
 * and managing the migration from the original design color palette to VMP colors.
 */

// Original design reference color palette
export const DESIGN_REFERENCE_COLORS = {
  primary: '#1173d4',           // Original blue
  backgroundLight: '#f6f7f8',   // Original light background
  backgroundDark: '#101922',    // Original dark background
  border: '#d1d5db',            // Border color
  textGray: '#6b7280',          // Text gray
  textGrayDark: '#9ca3af',      // Dark mode text gray
} as const

// VMP color palette
export const VMP_COLORS = {
  primary: '#22574A',           // Forest Green
  secondary: '#E8DCCA',         // Warm Beige
  accent: '#D96E49',            // Terracotta Orange
  background: '#FCFBF9',        // Off White
  text: '#555555',              // Charcoal Gray
} as const

// Color migration mapping
export const COLOR_MIGRATION_MAP = {
  [DESIGN_REFERENCE_COLORS.primary]: VMP_COLORS.primary,
  [DESIGN_REFERENCE_COLORS.backgroundLight]: VMP_COLORS.background,
  // Keep dark background as is for dark mode
  [DESIGN_REFERENCE_COLORS.backgroundDark]: DESIGN_REFERENCE_COLORS.backgroundDark,
} as const

/**
 * Convert design reference color to VMP color
 */
export function migrateColor(originalColor: string): string {
  return COLOR_MIGRATION_MAP[originalColor as keyof typeof COLOR_MIGRATION_MAP] || originalColor
}

/**
 * Get VMP-compliant CSS custom properties
 */
export function getVMPCSSProperties(): Record<string, string> {
  return {
    '--color-primary': VMP_COLORS.primary,
    '--color-secondary': VMP_COLORS.secondary,
    '--color-accent': VMP_COLORS.accent,
    '--color-background': VMP_COLORS.background,
    '--color-text': VMP_COLORS.text,

    // Design reference mappings
    '--dr-primary': VMP_COLORS.primary,
    '--dr-background-light': VMP_COLORS.background,
    '--dr-background-dark': DESIGN_REFERENCE_COLORS.backgroundDark,
  }
}

/**
 * Convert design reference class names to VMP-compliant ones
 */
export function convertDesignClasses(classNames: string): string {
  const classMappings = {
    'bg-primary': 'bg-primary',
    'text-primary': 'text-primary',
    'border-primary': 'border-primary',
    'ring-primary': 'ring-primary',
    'bg-background-light': 'bg-background',
    'from-primary': 'from-primary',
    'to-primary': 'to-primary',
  }

  let convertedClasses = classNames

  Object.entries(classMappings).forEach(([original, converted]) => {
    convertedClasses = convertedClasses.replace(
      new RegExp(`\\b${original}\\b`, 'g'),
      converted
    )
  })

  return convertedClasses
}

/**
 * Design reference component mapping
 */
export const COMPONENT_MAPPING = {
  // Login page structure
  loginContainer: 'dr-split-layout',
  formSection: 'dr-form-section',
  brandingSection: 'dr-branding-section',

  // Form components
  formContainer: 'dr-form-container',
  formHeader: 'dr-form-header',
  form: 'dr-form',
  inputGroup: 'dr-input-group',
  label: 'dr-label',
  input: 'dr-input',
  button: 'dr-button-primary',

  // Branding components
  brandingContent: 'dr-branding-content',
  brandingIcon: 'dr-branding-icon',
  brandingTitle: 'dr-branding-title',
  brandingDescription: 'dr-branding-description',

  // Social auth components
  divider: 'dr-divider',
  socialGrid: 'dr-social-grid',
  socialButton: 'dr-social-button',
} as const

/**
 * Get component class name from design reference mapping
 */
export function getDesignClass(componentType: keyof typeof COMPONENT_MAPPING): string {
  return COMPONENT_MAPPING[componentType]
}

/**
 * Responsive breakpoint utilities matching design reference
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const

/**
 * Typography scale matching design reference with VMP enhancements
 */
export const TYPOGRAPHY_SCALE = {
  // Design reference sizes
  'text-sm': '0.875rem',      // 14px
  'text-base': '1rem',        // 16px
  'text-lg': '1.125rem',      // 18px
  'text-xl': '1.25rem',       // 20px
  'text-2xl': '1.5rem',       // 24px
  'text-3xl': '1.875rem',     // 30px
  'text-4xl': '2.25rem',      // 36px

  // Line heights
  'leading-tight': '1.25',
  'leading-normal': '1.5',
  'leading-relaxed': '1.625',
} as const

/**
 * Spacing scale matching design reference
 */
export const SPACING_SCALE = {
  'spacing-1': '0.25rem',     // 4px
  'spacing-2': '0.5rem',      // 8px
  'spacing-3': '0.75rem',     // 12px
  'spacing-4': '1rem',        // 16px
  'spacing-6': '1.5rem',      // 24px
  'spacing-8': '2rem',        // 32px
  'spacing-12': '3rem',       // 48px
  'spacing-16': '4rem',       // 64px
} as const

/**
 * Border radius values from design reference
 */
export const BORDER_RADIUS = {
  'rounded-sm': '0.125rem',   // 2px
  'rounded': '0.25rem',       // 4px (default)
  'rounded-md': '0.375rem',   // 6px
  'rounded-lg': '0.5rem',     // 8px
  'rounded-xl': '0.75rem',    // 12px
  'rounded-full': '9999px',   // Full circle
} as const

/**
 * Convert design reference HTML to React component props
 */
export function convertHTMLToReactProps(htmlAttributes: Record<string, string>): Record<string, any> {
  const reactProps: Record<string, any> = {}

  Object.entries(htmlAttributes).forEach(([key, value]) => {
    switch (key) {
      case 'class':
        reactProps.className = convertDesignClasses(value)
        break
      case 'for':
        reactProps.htmlFor = value
        break
      default:
        // Convert kebab-case to camelCase for React props
        const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        reactProps[camelKey] = value
    }
  })

  return reactProps
}

/**
 * Generate CSS-in-JS styles from design reference
 */
export function generateStyleObject(designClasses: string[]): Record<string, string | number> {
  const styles: Record<string, string | number> = {}

  designClasses.forEach(className => {
    switch (className) {
      case 'bg-primary':
        styles.backgroundColor = VMP_COLORS.primary
        break
      case 'text-white':
        styles.color = '#ffffff'
        break
      case 'rounded-lg':
        styles.borderRadius = BORDER_RADIUS['rounded-lg']
        break
      case 'p-4':
        styles.padding = SPACING_SCALE['spacing-4']
        break
      case 'mb-6':
        styles.marginBottom = SPACING_SCALE['spacing-6']
        break
      // Add more mappings as needed
    }
  })

  return styles
}

/**
 * Validate design compliance
 */
export function validateDesignCompliance(element: {
  colors: string[]
  typography: string[]
  spacing: string[]
}): {
  isCompliant: boolean
  violations: string[]
  suggestions: string[]
} {
  const violations: string[] = []
  const suggestions: string[] = []

  // Check color compliance
  element.colors.forEach(color => {
    if (color === DESIGN_REFERENCE_COLORS.primary) {
      violations.push(`Using original design color ${color}`)
      suggestions.push(`Replace with VMP primary color ${VMP_COLORS.primary}`)
    }
  })

  // Check typography compliance
  if (!element.typography.includes('Inter')) {
    violations.push('Missing Inter font family')
    suggestions.push('Add Inter font family for consistency')
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    suggestions,
  }
}

/**
 * Extract design tokens from design reference
 */
export function extractDesignTokens() {
  return {
    colors: VMP_COLORS,
    typography: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      fontSize: TYPOGRAPHY_SCALE,
    },
    spacing: SPACING_SCALE,
    borderRadius: BORDER_RADIUS,
    breakpoints: RESPONSIVE_BREAKPOINTS,
  }
}

/**
 * Generate TailwindCSS configuration from design tokens
 */
export function generateTailwindConfig() {
  const tokens = extractDesignTokens()

  return {
    theme: {
      extend: {
        colors: {
          primary: tokens.colors.primary,
          secondary: tokens.colors.secondary,
          accent: tokens.colors.accent,
          background: tokens.colors.background,
          text: tokens.colors.text,
        },
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize,
        spacing: tokens.spacing,
        borderRadius: tokens.borderRadius,
        screens: tokens.breakpoints,
      },
    },
  }
}