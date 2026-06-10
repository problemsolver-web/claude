import { notFound } from 'next/navigation'
import { getEmployerJobById } from '@/lib/actions/employer-jobs'
import { EditJobForm } from './edit-job-form'
import { DeleteJobButton } from '../delete-job-button'

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const job = await getEmployerJobById(id)

  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job Posting</h1>
          <p className="text-gray-600 mt-1">
            Update the details of your job posting.
          </p>
        </div>
        <DeleteJobButton jobId={id} jobTitle={job.title} />
      </div>

      <EditJobForm job={job} jobId={id} />
    </div>
  )
}
