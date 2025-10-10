'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ComingSoonProps {
  featureName: string;
  description?: string;
  icon?: string;
  estimatedDate?: string;
}

export function ComingSoon({
  featureName,
  description = "This feature is currently under development. Check back soon!",
  icon = "construction",
  estimatedDate
}: ComingSoonProps) {
  const router = useRouter()

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main content area - account for sidebar */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-8">
            <span
              className="material-icons-outlined text-primary inline-block"
              style={{ fontSize: '96px' }}
              aria-label={`${featureName} feature under development`}
            >
              {icon}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-primary mb-4">
            Coming Soon
          </h1>

          {/* Feature Name */}
          <h2 className="text-2xl font-semibold text-text mb-4">
            {featureName}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            {description}
          </p>

          {/* Estimated Date (if provided) */}
          {estimatedDate && (
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-secondary/50 rounded-full">
                <span className="material-icons-outlined text-primary mr-2 text-sm">
                  schedule
                </span>
                <span className="text-sm font-medium text-primary">
                  Expected: {estimatedDate}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={handleBackToDashboard}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors duration-200 font-medium"
            >
              Back to Dashboard
            </button>

            <div className="text-sm text-gray-500">
              <p>
                Return to <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link> to access available features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Responsive styles for mobile
export function ComingSoonMobile({
  featureName,
  description = "This feature is currently under development. Check back soon!",
  icon = "construction",
  estimatedDate
}: ComingSoonProps) {
  const router = useRouter()

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto text-center pt-16">
        {/* Icon - smaller on mobile */}
        <div className="mb-6">
          <span
            className="material-icons-outlined text-primary inline-block md:hidden"
            style={{ fontSize: '64px' }}
            aria-label={`${featureName} feature under development`}
          >
            {icon}
          </span>
          <span
            className="material-icons-outlined text-primary hidden md:inline-block"
            style={{ fontSize: '96px' }}
            aria-label={`${featureName} feature under development`}
          >
            {icon}
          </span>
        </div>

        {/* Title - smaller on mobile */}
        <h1 className="text-2xl md:text-4xl font-bold text-primary mb-4">
          Coming Soon
        </h1>

        {/* Feature Name */}
        <h2 className="text-xl md:text-2xl font-semibold text-text mb-4">
          {featureName}
        </h2>

        {/* Description */}
        <p className="text-base md:text-lg text-gray-600 mb-6">
          {description}
        </p>

        {/* Estimated Date (if provided) */}
        {estimatedDate && (
          <div className="mb-6">
            <div className="inline-flex items-center px-3 py-2 bg-secondary/50 rounded-full">
              <span className="material-icons-outlined text-primary mr-2 text-sm">
                schedule
              </span>
              <span className="text-sm font-medium text-primary">
                Expected: {estimatedDate}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleBackToDashboard}
            className="w-full md:w-auto bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors duration-200 font-medium"
          >
            Back to Dashboard
          </button>

          <div className="text-sm text-gray-500">
            <p>
              Return to <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link> to access available features
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export default responsive component
export default function ResponsiveComingSoon(props: ComingSoonProps) {
  return (
    <>
      {/* Desktop/Tablet version */}
      <div className="hidden sm:block">
        <ComingSoon {...props} />
      </div>

      {/* Mobile version */}
      <div className="block sm:hidden">
        <ComingSoonMobile {...props} />
      </div>
    </>
  )
}