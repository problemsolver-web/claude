'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { deleteJob } from '@/lib/actions/employer-jobs'

interface DeleteJobButtonProps {
  jobId: string
  jobTitle: string
}

export function DeleteJobButton({ jobId, jobTitle }: DeleteJobButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const result = await deleteJob(jobId)

    if (result.success) {
      router.push('/dashboard/employer/jobs')
      router.refresh()
    } else {
      setError(result.error || 'Failed to delete job')
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
        Delete
      </Button>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Delete Job Posting"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold">&quot;{jobTitle}&quot;</span>?
            This will also remove all associated applications. This action cannot be undone.
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
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Job'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
