'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { applyToJob } from '@/lib/actions/applications'

interface ApplyButtonProps {
  jobId: string
  alreadyApplied: boolean
}

export function ApplyButton({ jobId, alreadyApplied }: ApplyButtonProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (alreadyApplied || success) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">
            {success ? 'Application submitted!' : 'Already applied'}
          </span>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const result = await applyToJob(jobId, coverLetter || undefined)

    if (result.success) {
      setSuccess(true)
      router.refresh()
    } else {
      setError(result.error || 'Something went wrong')
    }

    setLoading(false)
  }

  if (!showForm) {
    return (
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => setShowForm(true)}
      >
        Apply Now
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cover-letter" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Letter (optional)
        </label>
        <textarea
          id="cover-letter"
          rows={4}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Tell the employer why you are a great fit for this role..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowForm(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
