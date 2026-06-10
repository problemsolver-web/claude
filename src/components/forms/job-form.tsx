'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { TagInput } from '@/components/ui/tag-input'
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card'
import type { Job } from '@/types/database'

interface JobFormProps {
  job?: Job | null
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string; jobId?: string }>
  submitLabel: string
}

const employmentTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const jobCategoryOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'operations', label: 'Operations' },
  { value: 'it', label: 'IT' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

const degreeOptions = [
  { value: '', label: 'No specific requirement' },
  { value: 'high_school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
]

export function JobForm({ job, onSubmit, submitLabel }: JobFormProps) {
  const router = useRouter()
  const [requiredSkills, setRequiredSkills] = useState<string[]>(job?.required_skills || [])
  const [preferredSkills, setPreferredSkills] = useState<string[]>(job?.preferred_skills || [])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Override the skills with current state values
    formData.set('required_skills', requiredSkills.join(','))
    formData.set('preferred_skills', preferredSkills.join(','))

    // Handle checkbox: if is_active is not present, set it to 'false'
    if (!formData.has('is_active')) {
      formData.set('is_active', 'false')
    }

    try {
      const result = await onSubmit(formData)
      if (result.success) {
        router.push('/dashboard/employer/jobs')
        router.refresh()
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                name="title"
                defaultValue={job?.title || ''}
                placeholder="e.g. Senior Frontend Developer"
                required
              />
              <Select
                label="Employment Type"
                name="employment_type"
                options={employmentTypeOptions}
                defaultValue={job?.employment_type || 'full-time'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Job Category"
                name="job_category"
                options={jobCategoryOptions}
                placeholder="Select category"
                defaultValue={job?.job_category || ''}
              />
              <Input
                label="Location"
                name="location"
                defaultValue={job?.location || ''}
                placeholder="e.g. Dhaka, Bangladesh"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={5}
                defaultValue={job?.description || ''}
                placeholder="Describe the role, responsibilities, and what makes it exciting..."
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                name="requirements"
                rows={4}
                defaultValue={job?.requirements || ''}
                placeholder="List the requirements for this position..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TagInput
                label="Required Skills"
                name="required_skills"
                value={requiredSkills}
                onChange={setRequiredSkills}
                placeholder="Type a skill and press Enter"
                helperText="Skills that candidates must have"
              />
              <TagInput
                label="Preferred Skills"
                name="preferred_skills"
                value={preferredSkills}
                onChange={setPreferredSkills}
                placeholder="Type a skill and press Enter"
                helperText="Nice-to-have skills"
              />
            </div>

            {/* Education & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Degree Requirement"
                name="degree_requirement"
                options={degreeOptions}
                defaultValue={job?.degree_requirement || ''}
              />
              <Input
                label="Min Experience (years)"
                name="experience_min"
                type="number"
                min="0"
                defaultValue={job?.experience_min?.toString() || ''}
                placeholder="0"
              />
              <Input
                label="Max Experience (years)"
                name="experience_max"
                type="number"
                min="0"
                defaultValue={job?.experience_max?.toString() || ''}
                placeholder="10"
              />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Min Salary (BDT)"
                name="salary_min"
                type="number"
                min="0"
                defaultValue={job?.salary_min?.toString() || ''}
                placeholder="e.g. 30000"
              />
              <Input
                label="Max Salary (BDT)"
                name="salary_max"
                type="number"
                min="0"
                defaultValue={job?.salary_max?.toString() || ''}
                placeholder="e.g. 80000"
              />
            </div>

            {/* Active status (only for edit) */}
            {job && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  value="true"
                  defaultChecked={job.is_active}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Job is active and visible to candidates
                </label>
              </div>
            )}
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/employer/jobs')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
