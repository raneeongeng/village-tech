'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { validateMemberDocument } from '@/lib/validations/people-sticker'
import type { SelectedMember } from '@/lib/validations/people-sticker'

interface MemberStickerCardProps {
  member: SelectedMember
  onSelectionChange: (memberId: string, selected: boolean) => void
  onDocumentUpload: (memberId: string, documentType: 'id' | 'photo', file: File) => void
  onDocumentRemove: (memberId: string, documentType: 'id' | 'photo') => void
  disabled?: boolean
}

export function MemberStickerCard({
  member,
  onSelectionChange,
  onDocumentUpload,
  onDocumentRemove,
  disabled = false
}: MemberStickerCardProps) {
  const [dragOver, setDragOver] = useState<'id' | 'photo' | null>(null)
  const idFileInputRef = useRef<HTMLInputElement>(null)
  const photoFileInputRef = useRef<HTMLInputElement>(null)

  const handleSelectionChange = () => {
    if (!disabled && !member.has_active_sticker) {
      onSelectionChange(member.member_id, !member.selected)
    }
  }

  const handleFileSelect = (documentType: 'id' | 'photo', file: File) => {
    const error = validateMemberDocument(file, documentType)
    if (error) {
      alert(error) // In production, use proper toast/notification
      return
    }
    onDocumentUpload(member.member_id, documentType, file)
  }

  const handleFileInputChange = (documentType: 'id' | 'photo') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(documentType, file)
    }
  }

  const handleDrop = (documentType: 'id' | 'photo') => (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(null)
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(documentType, file)
    }
  }

  const handleDragOver = (documentType: 'id' | 'photo') => (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(documentType)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(null)
  }

  const triggerFileInput = (documentType: 'id' | 'photo') => {
    const inputRef = documentType === 'id' ? idFileInputRef : photoFileInputRef
    inputRef.current?.click()
  }

  const isSelectable = !member.has_active_sticker && !disabled
  const isSelected = member.selected && isSelectable

  return (
    <div
      className={`relative border rounded-lg p-4 transition-all ${
        member.has_active_sticker
          ? 'bg-gray-50 border-gray-200 opacity-75'
          : isSelected
          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Selection Checkbox and Member Info */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            disabled={!isSelectable}
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              !isSelectable ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {member.member_name}
            </h4>
            {member.has_active_sticker && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active Sticker
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {member.relationship}
          </p>
          {member.has_active_sticker && (
            <p className="text-xs text-gray-400 mt-1">
              This member already has an active people sticker
            </p>
          )}
        </div>
      </div>

      {/* Document Upload Areas - Only show if member is selected */}
      {isSelected && (
        <div className="space-y-3">
          {/* ID Document Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ID Document (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                dragOver === 'id'
                  ? 'border-blue-400 bg-blue-50'
                  : member.id_document
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop('id')}
              onDragOver={handleDragOver('id')}
              onDragLeave={handleDragLeave}
              onClick={() => triggerFileInput('id')}
            >
              {member.id_document_uploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-xs text-blue-600">Uploading...</span>
                </div>
              ) : member.id_document ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-green-600">ID uploaded</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDocumentRemove(member.member_id, 'id')
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  <svg className="mx-auto h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Drop ID document or click to upload
                </div>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Photo (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                dragOver === 'photo'
                  ? 'border-blue-400 bg-blue-50'
                  : member.photo
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop('photo')}
              onDragOver={handleDragOver('photo')}
              onDragLeave={handleDragLeave}
              onClick={() => triggerFileInput('photo')}
            >
              {member.photo_uploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-xs text-blue-600">Uploading...</span>
                </div>
              ) : member.photo ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-green-600">Photo uploaded</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDocumentRemove(member.member_id, 'photo')
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  <svg className="mx-auto h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Drop photo or click to upload
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={idFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileInputChange('id')}
        className="hidden"
      />
      <input
        ref={photoFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileInputChange('photo')}
        className="hidden"
      />
    </div>
  )
}