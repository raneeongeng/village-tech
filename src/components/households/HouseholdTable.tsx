'use client'

import { useState } from 'react'
import { ResponsiveTable, TableColumn, TableAction } from '@/components/common/ResponsiveTable'
import { HouseholdStatusBadge } from './HouseholdStatusBadge'
import { ApprovalModal } from './ApprovalModal'
import { RejectionModal } from './RejectionModal'
import { useHouseholdActions } from '@/hooks/useHouseholdActions'
import {
  Household,
  HouseholdHead,
  HouseholdsTableProps,
} from '@/types/household'

export function HouseholdTable({
  data,
  loading = false,
  error = null,
  type,
  onViewDetails,
  onApprove,
  onReject,
  onToggleStatus,
}: HouseholdsTableProps) {
  const householdActions = useHouseholdActions()

  // Modal states
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean
    household: { id: string; address: string; household_head: HouseholdHead } | null
  }>({
    isOpen: false,
    household: null,
  })

  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean
    household: { id: string; address: string; household_head: HouseholdHead } | null
  }>({
    isOpen: false,
    household: null,
  })

  // Helper function to get full name
  const getFullName = (head: HouseholdHead) => {
    const parts = [
      head.first_name,
      head.middle_name,
      head.last_name,
      head.suffix,
    ].filter(Boolean)
    return parts.join(' ')
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Table columns configuration
  const columns: TableColumn<Household>[] = [
    {
      key: 'address',
      header: 'Address',
      width: 'min-w-[200px]',
      render: (household) => (
        <div className="font-medium text-gray-900">
          {household.address}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'household_head',
      header: 'Household Head',
      width: 'min-w-[200px]',
      render: (household) => (
        <div>
          <div className="font-medium text-gray-900">
            {getFullName(household.household_head)}
          </div>
          <div className="text-sm text-gray-500">
            {household.household_head.email}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      width: 'min-w-[120px]',
      align: 'center',
      render: (household) => (
        <HouseholdStatusBadge status={household.status} />
      ),
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Applied Date',
      width: 'min-w-[120px]',
      render: (household) => (
        <div className="text-sm text-gray-900">
          {formatDate(household.created_at)}
        </div>
      ),
      sortable: true,
    },
  ]

  // Add member count column for active households
  if (type === 'active') {
    columns.push({
      key: 'member_count',
      header: 'Members',
      width: 'min-w-[80px]',
      align: 'center',
      render: (household) => (
        <div className="text-sm font-medium text-gray-900">
          {household.member_count || 0}
        </div>
      ),
    })
  }

  // Table actions configuration
  const actions: TableAction<Household>[] = [
    {
      label: 'View Details',
      onClick: (household) => onViewDetails(household.id),
      variant: 'primary',
    },
  ]

  // Add type-specific actions
  if (type === 'pending') {
    actions.push(
      {
        label: 'Approve',
        onClick: (household) => {
          setApprovalModal({
            isOpen: true,
            household: {
              id: household.id,
              address: household.address,
              household_head: household.household_head,
            },
          })
        },
        variant: 'success',
        loading: (household) => householdActions.loading[household.id] || false,
      },
      {
        label: 'Reject',
        onClick: (household) => {
          setRejectionModal({
            isOpen: true,
            household: {
              id: household.id,
              address: household.address,
              household_head: household.household_head,
            },
          })
        },
        variant: 'danger',
        loading: (household) => householdActions.loading[household.id] || false,
      }
    )
  }

  if (type === 'active') {
    actions.push({
      label: (household) => household.status.code === 'active' ? 'Deactivate' : 'Activate',
      onClick: (household) => {
        if (onToggleStatus) {
          onToggleStatus(household.id, household.status.code)
        }
      },
      variant: (household) => household.status.code === 'active' ? 'danger' : 'success',
      loading: (household) => householdActions.loading[household.id] || false,
    } as TableAction<Household>)
  }

  // Handle approval confirmation
  const handleApprovalConfirm = async () => {
    if (!approvalModal.household) return

    try {
      const result = await householdActions.approveHousehold(approvalModal.household.id)

      if (result.success) {
        setApprovalModal({ isOpen: false, household: null })
        if (onApprove) {
          onApprove(approvalModal.household.id)
        }
      } else {
        console.error('Failed to approve household:', result.error)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error approving household:', error)
    }
  }

  // Handle rejection confirmation
  const handleRejectionConfirm = async (reason?: string) => {
    if (!rejectionModal.household) return

    try {
      const result = await householdActions.rejectHousehold(rejectionModal.household.id, reason)

      if (result.success) {
        setRejectionModal({ isOpen: false, household: null })
        if (onReject) {
          onReject(rejectionModal.household.id)
        }
      } else {
        console.error('Failed to reject household:', result.error)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error rejecting household:', error)
    }
  }

  // Empty state configuration
  const emptyState = {
    icon: type === 'pending' ? 'pending_actions' : 'home',
    title: `No ${type === 'pending' ? 'pending applications' : 'active households'} found`,
    description: type === 'pending'
      ? 'All household applications have been processed.'
      : 'No active households match your current filters.',
  }

  return (
    <>
      <ResponsiveTable
        data={data}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error}
        emptyState={emptyState}
        itemName={type === 'pending' ? 'applications' : 'households'}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        household={approvalModal.household}
        onConfirm={handleApprovalConfirm}
        onCancel={() => setApprovalModal({ isOpen: false, household: null })}
        loading={approvalModal.household ? (householdActions.loading[approvalModal.household.id] || false) : false}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        household={rejectionModal.household}
        onConfirm={handleRejectionConfirm}
        onCancel={() => setRejectionModal({ isOpen: false, household: null })}
        loading={rejectionModal.household ? (householdActions.loading[rejectionModal.household.id] || false) : false}
      />
    </>
  )
}