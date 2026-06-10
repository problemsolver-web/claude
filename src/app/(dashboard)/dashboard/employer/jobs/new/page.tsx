import { NewJobFormWrapper } from './new-job-form-wrapper'

export default function NewJobPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600 mt-1">
          Fill in the details below to create a new job posting.
        </p>
      </div>

      <NewJobFormWrapper />
    </div>
  )
}
