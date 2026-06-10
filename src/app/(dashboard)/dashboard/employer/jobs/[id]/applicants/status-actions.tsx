'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { updateApplicationStatus } from '@/lib/actions/employer-applications'
import type { ApplicationStatus } from '@/types/database'

interface StatusActionsProps {
  applicationId: string
  currentStatus: ApplicationStatus
}

export function StatusActions({ applicationId, currentStatus }: StatusActionsProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function promptStatusChange(status: ApplicationStatus) {
    setTargetStatus(status)
    setShowConfirm(true)
    setError(null)
  }

  async function confirmStatusChange() {
    if (!targetStatus) return

    setLoading(true)
    setError(null)

    const result = await updateApplicationStatus(applicationId, targetStatus)

    if (result.success) {
      setShowConfirm(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update status')
    }

    setLoading(false)
  }

  // Determine available actions based on current status
  const actions: { status: ApplicationStatus; label: string; variant: 'primary' | 'secondary' | 'danger' }[] = []

  if (currentStatus === 'pending') {
    actions.push({ status: 'shortlisted', label: 'Shortlist', variant: 'primary' })
    actions.push({ status: 'rejected', label: 'Reject', variant: 'danger' })
  } else if (currentStatus === 'shortlisted') {
    actions.push({ status: 'accepted', label: 'Accept', variant: 'primary' })
    actions.push({ status: 'rejected', label: 'Reject', variant: 'danger' })
  }

  if (actions.length === 0) return null

  const statusLabels: Record<ApplicationStatus, string> = {
    pending: 'Pending',
    shortlisted: 'Shortlisted',
    accepted: 'Accepted',
    rejected: 'Rejected',
  }

  return (
    <>
      <div className="flex gap-1">
        {actions.map(({ status, label, variant }) => (
          <Button
            key={status}
            variant={variant}
            size="sm"
            onClick={() => promptStatusChange(status)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Status Change"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to change this application status to{' '}
            <span className="font-semibold">{targetStatus ? statusLabels[targetStatus] : ''}</span>?
            {targetStatus === 'accepted' && (
              <span className="block mt-2 text-green-700">
                A conversation will be created so you can message this candidate.
              </span>
            )}
            {targetStatus === 'rejected' && (
              <span className="block mt-2 text-red-700">
                This action cannot be undone.
              </span>
            )}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={targetStatus === 'rejected' ? 'danger' : 'primary'}
              onClick={confirmStatusChange}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
