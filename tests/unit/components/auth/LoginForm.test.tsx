/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/app/(auth)/login/components/LoginForm'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  detectTenantFromSubdomain: jest.fn(),
}))

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock the tenant hook
jest.mock('@/hooks/useTenant', () => ({
  useTenant: () => ({
    currentTenant: null,
    isLoading: false,
    detectTenant: jest.fn(),
  }),
}))

describe('LoginForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Validation', () => {
    it('renders login form with all required fields', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('shows email validation error when email is invalid', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('shows email required error when email is empty', async () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
    })

    it('shows password validation error when password is too short', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument()
      })
    })

    it('shows password required error when password is empty', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('does not show validation errors for valid inputs', async () => {
      const { signIn } = require('@/lib/auth')
      signIn.mockResolvedValueOnce({
        user: { id: '1', email: 'test@example.com' },
        tenant: { id: '1', name: 'Test Village' },
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: Date.now() + 3600000,
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'validpassword123')
      await user.click(submitButton)

      // Should not show validation errors
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls signIn with correct credentials on form submission', async () => {
      const { signIn } = require('@/lib/auth')
      signIn.mockResolvedValueOnce({
        user: { id: '1', email: 'test@example.com' },
        tenant: { id: '1', name: 'Test Village' },
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: Date.now() + 3600000,
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('shows loading state during form submission', async () => {
      const { signIn } = require('@/lib/auth')

      // Create a promise that we can control
      let resolveSignIn: (value: any) => void
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve
      })
      signIn.mockReturnValueOnce(signInPromise)

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should show loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      // Resolve the promise to clean up
      resolveSignIn!({
        user: { id: '1', email: 'test@example.com' },
        tenant: { id: '1', name: 'Test Village' },
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: Date.now() + 3600000,
      })
    })

    it('displays error message when authentication fails', async () => {
      const { signIn } = require('@/lib/auth')
      signIn.mockRejectedValueOnce(new Error('Invalid credentials'))

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })

      // Form should be enabled again
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Design Reference Compliance', () => {
    it('renders with design reference classes', () => {
      render(<LoginForm />)

      // Check for design reference CSS classes
      const formContainer = screen.getByTestId('login-form')
      expect(formContainer).toHaveClass('dr-form-container')
    })

    it('has proper form structure matching design reference', () => {
      render(<LoginForm />)

      // Check form header
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      expect(screen.getByText(/log in to your village manager dashboard/i)).toBeInTheDocument()

      // Check form fields
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()

      // Check forgot password link
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument()

      // Check submit button
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('displays social auth section with placeholders', () => {
      render(<LoginForm />)

      // Check divider
      expect(screen.getByText(/or continue with/i)).toBeInTheDocument()

      // Should have social auth buttons (even if placeholder)
      const socialSection = screen.getByTestId('social-auth')
      expect(socialSection).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('associates error messages with form fields', async () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email address/i)
        const emailError = screen.getByText(/email is required/i)

        expect(emailInput).toHaveAttribute('aria-describedby')
        expect(emailError).toHaveAttribute('id')
      })
    })

    it('supports keyboard navigation', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /log in/i })

      // Tab through elements
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })
})