import { test, expect } from '@playwright/test'

test.describe('Login Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/')
  })

  test.describe('Login Page Access', () => {
    test('redirects unauthenticated users to login page', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/.*\/login/)
    })

    test('redirects from root to login when not authenticated', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveURL(/.*\/login/)
    })

    test('loads login page with correct structure', async ({ page }) => {
      await page.goto('/login')

      // Check page title
      await expect(page).toHaveTitle(/login/i)

      // Check main heading
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

      // Check form elements
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()

      // Check branding area
      await expect(page.getByText(/village manager/i)).toBeVisible()
    })
  })

  test.describe('Form Interaction', () => {
    test('validates required fields', async ({ page }) => {
      await page.goto('/login')

      // Try to submit empty form
      await page.getByRole('button', { name: /log in/i }).click()

      // Check for validation errors
      await expect(page.getByText(/email is required/i)).toBeVisible()
      await expect(page.getByText(/password is required/i)).toBeVisible()
    })

    test('validates email format', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel(/email address/i).fill('invalid-email')
      await page.getByRole('button', { name: /log in/i }).click()

      await expect(page.getByText(/please enter a valid email address/i)).toBeVisible()
    })

    test('validates password length', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('123')
      await page.getByRole('button', { name: /log in/i }).click()

      await expect(page.getByText(/password must be at least 8 characters long/i)).toBeVisible()
    })

    test('shows loading state during submission', async ({ page }) => {
      await page.goto('/login')

      // Fill in valid credentials
      await page.getByLabel(/email address/i).fill('admin@greenville.vmp.app')
      await page.getByLabel(/password/i).fill('password123')

      // Start form submission
      const submitButton = page.getByRole('button', { name: /log in/i })
      await submitButton.click()

      // Check for loading state (this might be quick with mocked responses)
      await expect(submitButton).toBeDisabled()
    })
  })

  test.describe('Authentication Flow', () => {
    test('handles invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel(/email address/i).fill('invalid@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /log in/i }).click()

      // Should show error message
      await expect(page.getByText(/invalid/i)).toBeVisible()

      // Should remain on login page
      await expect(page).toHaveURL(/.*\/login/)
    })

    test('redirects to dashboard after successful login (mocked)', async ({ page }) => {
      // Mock successful authentication
      await page.route('**/auth/v1/token?grant_type=password', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            user: {
              id: 'user-123',
              email: 'admin@greenville.vmp.app',
              role: 'admin-head'
            }
          })
        })
      })

      await page.goto('/login')

      await page.getByLabel(/email address/i).fill('admin@greenville.vmp.app')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /log in/i }).click()

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/)
    })

    test('prevents access to login when already authenticated', async ({ page }) => {
      // Mock existing session
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_at: Date.now() + 3600000
        }))
      })

      await page.goto('/login')

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/)
    })
  })

  test.describe('Design Reference Compliance', () => {
    test('has correct layout structure', async ({ page }) => {
      await page.goto('/login')

      // Check two-column layout on desktop
      const viewport = page.viewportSize()
      if (viewport && viewport.width >= 768) {
        // Check form section
        await expect(page.locator('[data-testid="login-form-section"]')).toBeVisible()

        // Check branding section
        await expect(page.locator('[data-testid="login-branding-section"]')).toBeVisible()
      }
    })

    test('displays correct branding', async ({ page }) => {
      await page.goto('/login')

      // Check for VMP branding instead of original "Tenant Management"
      await expect(page.getByText(/village manager/i)).toBeVisible()
      await expect(page.getByText(/tenant management/i)).not.toBeVisible()

      // Check subtitle
      await expect(page.getByText(/log in to your village manager dashboard/i)).toBeVisible()
    })

    test('has social auth section with placeholders', async ({ page }) => {
      await page.goto('/login')

      // Check divider text
      await expect(page.getByText(/or continue with/i)).toBeVisible()

      // Check social auth buttons exist (even if placeholders)
      const socialSection = page.locator('[data-testid="social-auth"]')
      await expect(socialSection).toBeVisible()
    })

    test('displays forgot password link', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByText(/forgot password/i)).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('adapts layout for mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/login')

      // Form should be visible and functional
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()

      // Branding section should be visible
      await expect(page.getByText(/village manager/i)).toBeVisible()
    })

    test('adapts layout for tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/login')

      // All elements should be properly positioned
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByText(/village manager/i)).toBeVisible()
    })

    test('works correctly on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/login')

      // Should have two-column layout
      const formSection = page.locator('[data-testid="login-form-section"]')
      const brandingSection = page.locator('[data-testid="login-branding-section"]')

      await expect(formSection).toBeVisible()
      await expect(brandingSection).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('supports keyboard navigation', async ({ page }) => {
      await page.goto('/login')

      // Tab through form elements
      await page.keyboard.press('Tab')
      await expect(page.getByLabel(/email address/i)).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.getByLabel(/password/i)).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.getByRole('button', { name: /log in/i })).toBeFocused()
    })

    test('has proper form labels', async ({ page }) => {
      await page.goto('/login')

      // Check that form controls have associated labels
      const emailInput = page.getByLabel(/email address/i)
      const passwordInput = page.getByLabel(/password/i)

      await expect(emailInput).toHaveAttribute('id')
      await expect(passwordInput).toHaveAttribute('id')
    })

    test('has proper heading hierarchy', async ({ page }) => {
      await page.goto('/login')

      // Check for proper heading structure
      const mainHeading = page.getByRole('heading', { name: /welcome back/i })
      await expect(mainHeading).toBeVisible()

      const brandingHeading = page.getByRole('heading', { name: /village manager/i })
      await expect(brandingHeading).toBeVisible()
    })

    test('provides error announcements for screen readers', async ({ page }) => {
      await page.goto('/login')

      // Submit form to trigger validation
      await page.getByRole('button', { name: /log in/i }).click()

      // Error messages should be announced
      const emailError = page.getByText(/email is required/i)
      await expect(emailError).toBeVisible()
      await expect(emailError).toHaveAttribute('role', 'alert')
    })
  })

  test.describe('Performance', () => {
    test('loads within performance budget', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/login')

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Should load within 2 seconds (as per requirements)
      expect(loadTime).toBeLessThan(2000)
    })

    test('has no accessibility violations', async ({ page }) => {
      await page.goto('/login')

      // This would require @axe-core/playwright for full testing
      // For now, we check basic accessibility requirements

      // Check for skip links (if implemented)
      // Check for proper color contrast (visual check)
      // Check for focus indicators

      const emailInput = page.getByLabel(/email address/i)
      await emailInput.focus()

      // Element should have visible focus indicator
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBe(emailInput)
    })
  })
})