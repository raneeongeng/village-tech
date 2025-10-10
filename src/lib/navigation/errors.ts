/**
 * Navigation Error Handling for Village Management Platform
 * Provides error handling for permission denied scenarios and navigation failures
 */

import type { NavigationItem, UserRole } from '@/types/navigation';
import type { PermissionValidationResult } from './permissions';

/**
 * Navigation error types
 */
export type NavigationErrorType =
  | 'permission_denied'
  | 'route_not_found'
  | 'invalid_role'
  | 'configuration_error'
  | 'authentication_required'
  | 'network_error';

/**
 * Navigation error details
 */
export interface NavigationError {
  type: NavigationErrorType;
  message: string;
  details?: string;
  item?: NavigationItem;
  userRole?: UserRole;
  requiredPermission?: string;
  code?: string;
  timestamp: Date;
  recoverable: boolean;
  suggestions?: string[];
}

/**
 * Create a permission denied error
 */
export function createPermissionDeniedError(
  item: NavigationItem,
  result: PermissionValidationResult
): NavigationError {
  return {
    type: 'permission_denied',
    message: `Access denied to "${item.label}"`,
    details: result.reason,
    item,
    userRole: result.userRole,
    requiredPermission: result.requiredPermission,
    code: 'NAV_PERMISSION_DENIED',
    timestamp: new Date(),
    recoverable: false,
    suggestions: [
      'Contact your administrator to request access',
      'Verify you are logged in with the correct role',
      'Check if your permissions have been updated'
    ]
  };
}

/**
 * Create a route not found error
 */
export function createRouteNotFoundError(
  path: string,
  userRole?: UserRole
): NavigationError {
  return {
    type: 'route_not_found',
    message: `Route "${path}" not found`,
    details: 'The requested route is not available in the navigation configuration',
    userRole,
    code: 'NAV_ROUTE_NOT_FOUND',
    timestamp: new Date(),
    recoverable: true,
    suggestions: [
      'Check the URL for typos',
      'Navigate using the menu instead',
      'Contact support if you believe this is an error'
    ]
  };
}

/**
 * Create an invalid role error
 */
export function createInvalidRoleError(
  role: string
): NavigationError {
  return {
    type: 'invalid_role',
    message: `Invalid user role: "${role}"`,
    details: 'The user role is not recognized by the navigation system',
    code: 'NAV_INVALID_ROLE',
    timestamp: new Date(),
    recoverable: false,
    suggestions: [
      'Contact your administrator',
      'Log out and log back in',
      'Verify your account status'
    ]
  };
}

/**
 * Create a configuration error
 */
export function createConfigurationError(
  message: string,
  details?: string
): NavigationError {
  return {
    type: 'configuration_error',
    message: `Navigation configuration error: ${message}`,
    details,
    code: 'NAV_CONFIG_ERROR',
    timestamp: new Date(),
    recoverable: false,
    suggestions: [
      'Report this issue to the development team',
      'Try refreshing the page',
      'Contact technical support'
    ]
  };
}

/**
 * Create an authentication required error
 */
export function createAuthenticationRequiredError(): NavigationError {
  return {
    type: 'authentication_required',
    message: 'Authentication required',
    details: 'You must be logged in to access navigation',
    code: 'NAV_AUTH_REQUIRED',
    timestamp: new Date(),
    recoverable: true,
    suggestions: [
      'Please log in to continue',
      'Check if your session has expired',
      'Clear your browser cache and try again'
    ]
  };
}

/**
 * Create a network error
 */
export function createNetworkError(
  details?: string
): NavigationError {
  return {
    type: 'network_error',
    message: 'Network error loading navigation',
    details: details || 'Unable to load navigation configuration',
    code: 'NAV_NETWORK_ERROR',
    timestamp: new Date(),
    recoverable: true,
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Contact support if the problem persists'
    ]
  };
}

/**
 * Error handler for navigation components
 */
export class NavigationErrorHandler {
  private errors: NavigationError[] = [];
  private onError?: (error: NavigationError) => void;

  constructor(onError?: (error: NavigationError) => void) {
    this.onError = onError;
  }

  /**
   * Handle a navigation error
   */
  handleError(error: NavigationError): void {
    this.errors.push(error);

    // Log error for debugging
    console.error('Navigation Error:', {
      type: error.type,
      message: error.message,
      details: error.details,
      code: error.code,
      timestamp: error.timestamp
    });

    // Call custom error handler if provided
    if (this.onError) {
      this.onError(error);
    }

    // In development, show more detailed errors
    if (process.env.NODE_ENV === 'development') {
      console.warn('Navigation Error Details:', error);
    }
  }

  /**
   * Get all recorded errors
   */
  getErrors(): NavigationError[] {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: NavigationErrorType): NavigationError[] {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Clear errors of a specific type
   */
  clearErrorsByType(type: NavigationErrorType): void {
    this.errors = this.errors.filter(error => error.type !== type);
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Check if there are any recoverable errors
   */
  hasRecoverableErrors(): boolean {
    return this.errors.some(error => error.recoverable);
  }

  /**
   * Get the most recent error
   */
  getLatestError(): NavigationError | null {
    return this.errors.length > 0 ? this.errors[this.errors.length - 1] : null;
  }
}

/**
 * Global navigation error handler instance
 */
export const navigationErrorHandler = new NavigationErrorHandler();

/**
 * Error boundary context for navigation components
 */
export interface NavigationErrorContext {
  error: NavigationError | null;
  clearError: () => void;
  handleError: (error: NavigationError) => void;
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: NavigationError): string {
  switch (error.type) {
    case 'permission_denied':
      return `You don't have permission to access "${error.item?.label || 'this item'}"`;
    case 'route_not_found':
      return 'The requested page could not be found';
    case 'invalid_role':
      return 'Your account role is not recognized. Please contact support.';
    case 'authentication_required':
      return 'Please log in to continue';
    case 'configuration_error':
      return 'A system configuration error occurred. Please try again later.';
    case 'network_error':
      return 'Unable to load navigation. Please check your connection.';
    default:
      return 'An unexpected error occurred';
  }
}

/**
 * Get user-friendly suggestions for an error
 */
export function getErrorSuggestions(error: NavigationError): string[] {
  return error.suggestions || [];
}

/**
 * Check if an error is user-actionable
 */
export function isErrorUserActionable(error: NavigationError): boolean {
  return error.recoverable && error.suggestions && error.suggestions.length > 0;
}

/**
 * Create error notification payload
 */
export function createErrorNotification(error: NavigationError): {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
} {
  return {
    title: error.type === 'permission_denied' ? 'Access Denied' : 'Navigation Error',
    message: formatErrorMessage(error),
    type: error.recoverable ? 'warning' : 'error',
    actions: error.recoverable
      ? [
          {
            label: 'Retry',
            action: () => window.location.reload()
          }
        ]
      : undefined
  };
}