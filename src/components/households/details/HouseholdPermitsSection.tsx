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
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Stickers &amp; Permits</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200">
            <tr className="text-sm text-gray-600">
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Expiration</th>
              <th className="py-3 px-4 font-medium">Permit Number</th>
            </tr>
          </thead>
          <tbody>
            {permits.map((permit, index) => (
              <tr
                key={permit.id}
                className={`${
                  index < permits.length - 1 ? 'border-b border-gray-200' : ''
                } hover:bg-gray-50`}
              >
                <td className="py-4 px-4">
                  <p className="font-medium text-gray-900">{permit.type}</p>
                  {permit.description && (
                    <p className="text-sm text-gray-600">{permit.description}</p>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className={getStatusBadge(permit.status)}>
                    {getStatusText(permit.status)}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {formatDate(permit.expires_at)}
                  {permit.expires_at && isExpiringSoon(permit.expires_at) && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-icons-outlined text-amber-500 text-sm">warning</span>
                      <span className="text-xs text-amber-600">Expires soon</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {permit.permit_number || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {permits.length === 0 && (
          <div className="py-8 text-center text-gray-500">
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