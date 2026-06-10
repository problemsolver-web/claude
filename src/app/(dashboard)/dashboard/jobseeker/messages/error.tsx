'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Messages page error:', error)
  }, [error])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
      <svg className="w-12 h-12 text-red-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load messages</h3>
      <p className="text-gray-500 mb-4">
        Something went wrong while loading your messages. Please try again.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
