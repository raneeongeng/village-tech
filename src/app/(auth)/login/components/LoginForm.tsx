'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { signIn } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { z } from 'zod'

// Simplified validation schema for direct login
const simpleLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

type SimpleLoginFormData = z.infer<typeof simpleLoginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { refreshSession } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SimpleLoginFormData>({
    resolver: zodResolver(simpleLoginSchema),
    mode: 'onSubmit', // Only validate on submit, not on change
  })

  const onSubmit = async (data: SimpleLoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn({
        email: data.email,
        password: data.password,
      })

      // Refresh the auth session to update global state
      await refreshSession()

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 order-2 md:order-1">
      <div className="w-full max-w-md">
        <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-heading">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-600">
            Log in to your Village Manager dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={`appearance-none block w-full px-4 py-3 rounded-lg bg-white/50 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <span className="text-sm font-medium text-primary opacity-50 cursor-not-allowed">
                Forgot password?
              </span>
            </div>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className={`appearance-none block w-full px-4 py-3 rounded-lg bg-white/50 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Log In'}
          </Button>
        </form>

        {/* Social Auth Placeholder */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white/50 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled
            >
              <span className="sr-only">Continue with GitHub</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.745 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white/50 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled
            >
              <span className="sr-only">Continue with Email</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="#" className="font-medium text-primary hover:text-primary/80">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}