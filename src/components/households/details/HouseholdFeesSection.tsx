'use client'

import { HouseholdFee } from '@/types/household'

interface HouseholdFeesSectionProps {
  fees: HouseholdFee[]
}

export function HouseholdFeesSection({ fees }: HouseholdFeesSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusBadge = (status: HouseholdFee['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'waived':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getStatusText = (status: HouseholdFee['status']) => {
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'pending':
        return 'Pending'
      case 'overdue':
        return 'Overdue'
      case 'waived':
        return 'Waived'
      default:
        return 'Unknown'
    }
  }

  const getAmountDisplay = (fee: HouseholdFee) => {
    if (fee.status === 'paid') {
      return formatCurrency(0)
    }
    if (fee.status === 'waived') {
      return 'Waived'
    }
    return formatCurrency(fee.amount)
  }

  const isOverdue = (dueDate: string, status: HouseholdFee['status']) => {
    if (status === 'paid' || status === 'waived') return false
    return new Date(dueDate) < new Date()
  }

  const totalOutstanding = fees
    .filter(fee => fee.status === 'pending' || fee.status === 'overdue')
    .reduce((sum, fee) => sum + fee.amount, 0)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fees</h3>
        {totalOutstanding > 0 && (
          <div className="text-sm">
            <span className="text-gray-500">Outstanding Balance: </span>
            <span className="font-semibold text-red-600">
              {formatCurrency(totalOutstanding)}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-background border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Fee Type
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Amount Due
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee, index) => (
              <tr
                key={fee.id}
                className={`${
                  index < fees.length - 1 ? 'border-b border-gray-200' : ''
                } hover:bg-primary/5 transition-colors ${
                  isOverdue(fee.due_date, fee.status) ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {fee.fee_type}
                  {fee.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {fee.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusBadge(fee.status)}>
                    {getStatusText(fee.status)}
                  </span>
                  {fee.paid_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Paid on {formatDate(fee.paid_at)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {getAmountDisplay(fee)}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {formatDate(fee.due_date)}
                  {isOverdue(fee.due_date, fee.status) && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-icons-outlined text-red-500 text-sm">schedule</span>
                      <span className="text-xs text-red-600">Overdue</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {fees.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <span className="material-icons-outlined text-gray-300 text-3xl">receipt</span>
              <p>No fees found for this household.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}