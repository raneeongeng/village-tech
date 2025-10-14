'use client'

import { ReactNode } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (item: T) => ReactNode
  sortable?: boolean
}

export interface TableAction<T> {
  label: string | ((item: T) => string)
  onClick: (item: T) => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | ((item: T) => 'primary' | 'secondary' | 'danger' | 'success')
  disabled?: (item: T) => boolean
  loading?: (item: T) => boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  actions?: TableAction<T>[]
  loading?: boolean
  error?: Error | null
  emptyState?: {
    icon: string
    title: string
    description: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  onSort?: (key: keyof T | string, direction: 'asc' | 'desc') => void
  sortBy?: keyof T | string
  sortDirection?: 'asc' | 'desc'
  onRefresh?: () => void
  className?: string
  itemName?: string // e.g. "households", "villages" for pagination text
}

// =============================================================================
// PAGINATION COMPONENT
// =============================================================================

function Pagination({
  pagination,
  onPageChange,
  itemName = 'items'
}: {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  itemName?: string
}) {
  const { currentPage, totalPages, totalCount, itemsPerPage } = pagination

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-700">
        Showing {startItem}-{endItem} of {totalCount} {itemName}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm border rounded-lg ${
              page === currentPage
                ? 'bg-primary text-white border-primary'
                : 'text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function TableSkeleton<T>({ columns, rowCount = 5 }: { columns: TableColumn<T>[], rowCount?: number }) {
  return (
    <div className="bg-white overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 ${column.width || ''} text-${column.align || 'left'}`}
              >
                {column.header}
              </th>
            ))}
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <tr key={index} className="bg-white border-b animate-pulse">
              {columns.map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-full max-w-[200px]"></div>
                </td>
              ))}
              <td className="px-6 py-4 text-right">
                <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  error = null,
  emptyState,
  pagination,
  onPageChange,
  onSort,
  sortBy,
  sortDirection,
  onRefresh,
  className = '',
  itemName = 'items'
}: ResponsiveTableProps<T>) {

  // Get cell value helper
  const getCellValue = (item: T, column: TableColumn<T>): ReactNode => {
    if (column.render) {
      return column.render(item)
    }

    const value = typeof column.key === 'string' && column.key.includes('.')
      ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
      : item[column.key as keyof T]

    return value as ReactNode || '-'
  }

  // Action button styles
  const getActionButtonClass = (variant: TableAction<T>['variant'] = 'primary', item?: T) => {
    const baseClass = "text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"

    const resolvedVariant = typeof variant === 'function' && item ? variant(item) : variant as string

    switch (resolvedVariant) {
      case 'danger':
        return `${baseClass} text-red-500`
      case 'success':
        return `${baseClass} text-green-500`
      case 'secondary':
        return `${baseClass} text-gray-500`
      default:
        return `${baseClass} text-primary`
    }
  }

  // Handle sort
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return

    const newDirection = sortBy === column.key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column.key, newDirection)
  }

  // Loading state
  if (loading) {
    return <TableSkeleton columns={columns} />
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <span className="material-icons-outlined text-red-500 text-6xl mb-4">error</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load {itemName}</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    const defaultEmptyState = {
      icon: 'inbox',
      title: `No ${itemName} found`,
      description: pagination?.totalCount === 0
        ? `No ${itemName} have been created yet.`
        : "No results match your current filters.",
      action: undefined
    }

    const emptyConfig = emptyState || defaultEmptyState

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <span className="material-icons-outlined text-gray-400 text-6xl mb-4">
          {emptyConfig.icon}
        </span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {emptyConfig.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {emptyConfig.description}
        </p>
        {emptyConfig.action && (
          <button
            onClick={emptyConfig.action.onClick}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            {emptyConfig.action.label}
          </button>
        )}
      </div>
    )
  }

  // Success state
  return (
    <div className={`bg-white overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 ${column.width || ''} text-${column.align || 'left'} ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="material-icons-outlined text-xs">
                      {sortBy === column.key
                        ? (sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down')
                        : 'unfold_more'
                      }
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-3 text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                >
                  {getCellValue(item, column)}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {actions.map((action, actionIndex) => {
                      const label = typeof action.label === 'function' ? action.label(item) : action.label
                      return (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(item)}
                          disabled={action.disabled?.(item) || action.loading?.(item)}
                          className={getActionButtonClass(action.variant, item)}
                        >
                          {action.loading?.(item) ? 'Loading...' : label}
                        </button>
                      )
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          itemName={itemName}
        />
      )}
    </div>
  )
}