'use client'

export function BrandingArea() {
  return (
    <div className="w-full md:w-1/2 flex items-center justify-center bg-primary/10 order-1 md:order-2 p-8 lg:p-12">
      <div className="text-center text-gray-900">
        <div className="inline-block p-4 rounded-full bg-primary/20">
          {/* Village/Community themed icon */}
          <svg
            className="w-16 h-16 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            <path d="M12 7v5l4-2-4-3z" opacity="0.6"/>
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-bold font-heading">Village Manager</h2>
        <p className="mt-2 max-w-sm mx-auto text-gray-600">
          A unified platform for villages and communities to manage residents,
          security, and operations with ease.
        </p>
      </div>
    </div>
  )
}