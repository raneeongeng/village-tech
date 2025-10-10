'use client'

interface InlineComingSoonProps {
  featureName: string;
  icon?: string;
  description?: string;
}

export default function InlineComingSoon({
  featureName,
  icon = 'construction',
  description = 'This feature is currently under development. Check back soon!'
}: InlineComingSoonProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[500px] p-8">
      <div className="text-center space-y-6 max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center">
          <span
            className="material-icons-outlined text-primary"
            style={{ fontSize: '80px' }}
            aria-label={`${featureName} feature under development`}
          >
            {icon}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-primary">
          Coming Soon
        </h1>

        {/* Feature Name */}
        <h2 className="text-xl font-semibold text-text">
          {featureName}
        </h2>

        {/* Description */}
        <p className="text-base text-gray-600 leading-relaxed">
          {description}
        </p>

        {/* Optional Progress Indicator */}
        <div className="pt-4">
          <div className="inline-flex items-center px-4 py-2 bg-secondary/30 rounded-full">
            <span className="material-icons-outlined text-primary mr-2 text-sm">
              schedule
            </span>
            <span className="text-sm font-medium text-primary">
              In Development
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Responsive version for mobile/tablet
export function InlineComingSoonResponsive({
  featureName,
  icon = 'construction',
  description = 'This feature is currently under development. Check back soon!'
}: InlineComingSoonProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] md:min-h-[500px] p-4 md:p-8">
      <div className="text-center space-y-4 md:space-y-6 max-w-sm md:max-w-md mx-auto">
        {/* Icon - responsive sizing */}
        <div className="flex justify-center">
          <span
            className="material-icons-outlined text-primary block md:hidden"
            style={{ fontSize: '48px' }}
            aria-label={`${featureName} feature under development`}
          >
            {icon}
          </span>
          <span
            className="material-icons-outlined text-primary hidden md:block lg:hidden"
            style={{ fontSize: '64px' }}
            aria-label={`${featureName} feature under development`}
          >
            {icon}
          </span>
          <span
            className="material-icons-outlined text-primary hidden lg:block"
            style={{ fontSize: '80px' }}
            aria-label={`${featureName} feature under development`}
          >
            {icon}
          </span>
        </div>

        {/* Title - responsive sizing */}
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Coming Soon
        </h1>

        {/* Feature Name - responsive sizing */}
        <h2 className="text-lg md:text-xl font-semibold text-text">
          {featureName}
        </h2>

        {/* Description - responsive sizing */}
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          {description}
        </p>

        {/* Progress Indicator */}
        <div className="pt-2 md:pt-4">
          <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-secondary/30 rounded-full">
            <span className="material-icons-outlined text-primary mr-2 text-sm">
              schedule
            </span>
            <span className="text-xs md:text-sm font-medium text-primary">
              In Development
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}