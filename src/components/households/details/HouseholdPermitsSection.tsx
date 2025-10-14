'use client'

import { HouseholdPermit } from '@/types/household'

interface HouseholdPermitsSectionProps {
  permits: HouseholdPermit[]
}

export function HouseholdPermitsSection({ permits }: HouseholdPermitsSectionProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration'

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusBadge = (status: HouseholdPermit['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'expired':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'revoked':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getStatusText = (status: HouseholdPermit['status']) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'expired':
        return 'Expired'
      case 'pending':
        return 'Pending'
      case 'revoked':
        return 'Revoked'
      default:
        return 'Unknown'
    }
  }

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false

    const expirationDate = new Date(expiresAt)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    return expirationDate <= thirtyDaysFromNow && expirationDate > new Date()
  }

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Stickers &amp; Permits</h3>

      <div className="overflow-x-auto bg-background border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Type
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Expiration
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Permit Number
              </th>
            </tr>
          </thead>
          <tbody>
            {permits.map((permit, index) => (
              <tr
                key={permit.id}
                className={`${
                  index < permits.length - 1 ? 'border-b border-gray-200' : ''
                } hover:bg-primary/5 transition-colors`}
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {permit.type}
                  {permit.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {permit.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusBadge(permit.status)}>
                    {getStatusText(permit.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {formatDate(permit.expires_at)}
                  {permit.expires_at && isExpiringSoon(permit.expires_at) && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-icons-outlined text-amber-500 text-sm">warning</span>
                      <span className="text-xs text-amber-600">Expires soon</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {permit.permit_number || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {permits.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <span className="material-icons-outlined text-gray-300 text-3xl">description</span>
              <p>No permits or stickers found for this household.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}