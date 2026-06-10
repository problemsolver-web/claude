'use client'

import { JobForm } from '@/components/forms/job-form'
import { updateJob } from '@/lib/actions/employer-jobs'
import type { Job } from '@/types/database'

interface EditJobFormProps {
  job: Job
  jobId: string
}

export function EditJobForm({ job, jobId }: EditJobFormProps) {
  async function handleSubmit(formData: FormData) {
    return updateJob(jobId, formData)
  }

  return (
    <JobForm
      job={job}
      onSubmit={handleSubmit}
      submitLabel="Update Job"
    />
  )
}
