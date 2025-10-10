import { test, expect } from '@playwright/test'

test.describe('Login Page Visual Design Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Wait for page to fully load including fonts and images
    await page.waitForLoadState('networkidle')

    // Wait for any custom fonts to load
    await page.waitForFunction(() => document.fonts.ready)
  })

  test.describe('Desktop Layout', () => {
    test('matches design reference layout on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Take screenshot of the entire page
      await expect(page).toHaveScreenshot('login-desktop-full.png', {
        fullPage: true,
        threshold: 0.05, // Allow 5% difference for minor rendering variations
      })
    })

    test('form section matches design reference', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Screenshot of just the form section
      const formSection = page.locator('[data-testid="login-form-section"]')
      await expect(formSection).toHaveScreenshot('login-form-section-desktop.png', {
        threshold: 0.03,
      })
    })

    test('branding section matches design reference', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Screenshot of just the branding section
      const brandingSection = page.locator('[data-testid="login-branding-section"]')
      await expect(brandingSection).toHaveScreenshot('login-branding-section-desktop.png', {
        threshold: 0.03,
      })
    })

    test('form elements styling matches design', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Screenshot of form elements
      const form = page.locator('[data-testid="login-form"]')
      await expect(form).toHaveScreenshot('login-form-elements-desktop.png', {
        threshold: 0.03,
      })
    })

    test('social auth section matches design', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Screenshot of social auth section
      const socialAuth = page.locator('[data-testid="social-auth"]')
      await expect(socialAuth).toHaveScreenshot('social-auth-section-desktop.png', {
        threshold: 0.03,
      })
    })
  })

  test.describe('Mobile Layout', () => {
    test('matches design reference on mobile', async ({ page }) => {
      // Set mobile viewport (iPhone 12 Pro)
      await page.setViewportSize({ width: 390, height: 844 })

      await expect(page).toHaveScreenshot('login-mobile-full.png', {
        fullPage: true,
        threshold: 0.05,
      })
    })

    test('form section adapts correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })

      const formSection = page.locator('[data-testid="login-form-section"]')
      await expect(formSection).toHaveScreenshot('login-form-section-mobile.png', {
        threshold: 0.03,
      })
    })

    test('branding section adapts correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })

      const brandingSection = page.locator('[data-testid="login-branding-section"]')
      await expect(brandingSection).toHaveScreenshot('login-branding-section-mobile.png', {
        threshold: 0.03,
      })
    })
  })

  test.describe('Tablet Layout', () => {
    test('matches design reference on tablet', async ({ page }) => {
      // Set tablet viewport (iPad)
      await page.setViewportSize({ width: 768, height: 1024 })

      await expect(page).toHaveScreenshot('login-tablet-full.png', {
        fullPage: true,
        threshold: 0.05,
      })
    })

    test('form elements scale properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      const form = page.locator('[data-testid="login-form"]')
      await expect(form).toHaveScreenshot('login-form-elements-tablet.png', {
        threshold: 0.03,
      })
    })
  })

  test.describe('Color Palette Compliance', () => {
    test('uses VMP color palette correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Check primary button color
      const submitButton = page.getByRole('button', { name: /log in/i })

      const buttonColor = await submitButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })

      // Should use VMP primary color (#22574A)
      // RGB equivalent: rgb(34, 87, 74)
      expect(buttonColor).toBe('rgb(34, 87, 74)')
    })

    test('background colors match VMP palette', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Check page background
      const pageBackground = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })

      // Should use VMP background color (#FCFBF9)
      // RGB equivalent: rgb(252, 251, 249)
      expect(pageBackground).toBe('rgb(252, 251, 249)')
    })

    test('text colors match VMP specifications', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Check main heading color
      const heading = page.getByRole('heading', { name: /welcome back/i })

      const headingColor = await heading.evaluate((el) => {
        return window.getComputedStyle(el).color
      })

      // Should use VMP text color or appropriate contrast
      expect(headingColor).toMatch(/rgb\(85, 85, 85\)|rgb\(17, 24, 39\)/) // VMP text or gray-900
    })
  })

  test.describe('Typography Compliance', () => {
    test('uses Inter font family correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Check font family on body text
      const emailLabel = page.getByText(/email address/i)

      const fontFamily = await emailLabel.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily
      })

      expect(fontFamily).toContain('Inter')
    })

    test('heading typography matches specifications', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      const mainHeading = page.getByRole('heading', { name: /welcome back/i })

      const fontSize = await mainHeading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })

      const fontWeight = await mainHeading.evaluate((el) => {
        return window.getComputedStyle(el).fontWeight
      })

      // Should match design reference heading size
      expect(fontSize).toMatch(/30px|1.875rem/) // text-3xl
      expect(fontWeight).toMatch(/700|bold/)
    })
  })

  test.describe('Interactive States', () => {
    test('input focus states match design', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Focus the email input
      const emailInput = page.getByLabel(/email address/i)
      await emailInput.focus()

      // Take screenshot of focused input
      await expect(emailInput).toHaveScreenshot('input-focus-state.png', {
        threshold: 0.03,
      })
    })

    test('button hover states match design', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Hover over submit button
      const submitButton = page.getByRole('button', { name: /log in/i })
      await submitButton.hover()

      // Take screenshot of hovered button
      await expect(submitButton).toHaveScreenshot('button-hover-state.png', {
        threshold: 0.03,
      })
    })

    test('error states display correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Trigger validation errors
      await page.getByRole('button', { name: /log in/i }).click()

      // Wait for errors to appear
      await expect(page.getByText(/email is required/i)).toBeVisible()

      // Screenshot form with errors
      const form = page.locator('[data-testid="login-form"]')
      await expect(form).toHaveScreenshot('form-error-states.png', {
        threshold: 0.03,
      })
    })

    test('loading state displays correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Fill form with valid data
      await page.getByLabel(/email address/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')

      // Intercept form submission to control timing
      await page.route('**/auth/v1/token**', async route => {
        // Delay response to capture loading state
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' })
        })
      })

      // Start form submission
      const submitButton = page.getByRole('button', { name: /log in/i })
      await submitButton.click()

      // Take screenshot of loading state
      await expect(submitButton).toHaveScreenshot('button-loading-state.png', {
        threshold: 0.03,
      })
    })
  })

  test.describe('Cross-Browser Consistency', () => {
    test('renders consistently across browsers', async ({ page, browserName }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Take browser-specific screenshot
      await expect(page).toHaveScreenshot(`login-${browserName}-full.png`, {
        fullPage: true,
        threshold: 0.05,
      })
    })
  })

  test.describe('Dark Mode Compliance', () => {
    test('dark mode matches design reference', async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Take screenshot in dark mode
      await expect(page).toHaveScreenshot('login-dark-mode-full.png', {
        fullPage: true,
        threshold: 0.05,
      })
    })

    test('form elements adapt correctly in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.setViewportSize({ width: 1920, height: 1080 })

      const form = page.locator('[data-testid="login-form"]')
      await expect(form).toHaveScreenshot('login-form-dark-mode.png', {
        threshold: 0.03,
      })
    })
  })

  test.describe('Design Element Spacing', () => {
    test('maintains proper spacing between elements', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Check spacing in form section
      const formContainer = page.locator('[data-testid="login-form-container"]')
      await expect(formContainer).toHaveScreenshot('form-spacing-desktop.png', {
        threshold: 0.03,
      })
    })

    test('responsive spacing adapts correctly', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })

      // Check mobile spacing
      const formContainer = page.locator('[data-testid="login-form-container"]')
      await expect(formContainer).toHaveScreenshot('form-spacing-mobile.png', {
        threshold: 0.03,
      })
    })
  })
})