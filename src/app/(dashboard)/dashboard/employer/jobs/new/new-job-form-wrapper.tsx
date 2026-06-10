'use client'

import { JobForm } from '@/components/forms/job-form'
import { createJob } from '@/lib/actions/employer-jobs'

export function NewJobFormWrapper() {
  return (
    <JobForm
      onSubmit={createJob}
      submitLabel="Post Job"
    />
  )
}
