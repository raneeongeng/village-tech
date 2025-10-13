'use client'

interface VillageDetailsHeaderProps {
  villageName: string
  onBack: () => void
}

export function VillageDetailsHeader({ villageName, onBack }: VillageDetailsHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Go back"
      >
        <span className="material-icons-outlined text-2xl">arrow_back</span>
      </button>
      <div>
        <h1 className="text-2xl font-bold text-primary">Village Tenant Details</h1>
        <p className="text-gray-600 text-sm mt-1">
          Viewing details for {villageName}
        </p>
      </div>
    </div>
  )
}