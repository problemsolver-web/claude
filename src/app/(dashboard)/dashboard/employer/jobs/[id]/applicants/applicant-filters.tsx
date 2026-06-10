'use client'

import { useRouter } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ApplicantFiltersProps {
  jobId: string
  currentStatus: string
  currentMinScore: string
  currentDegree: string
  currentSkill: string
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

const degreeOptions = [
  { value: '', label: 'All Degrees' },
  { value: 'high_school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
]

const scoreOptions = [
  { value: '', label: 'Any Score' },
  { value: '80', label: '80%+' },
  { value: '60', label: '60%+' },
  { value: '40', label: '40%+' },
]

export function ApplicantFilters({
  jobId,
  currentStatus,
  currentMinScore,
  currentDegree,
  currentSkill,
}: ApplicantFiltersProps) {
  const router = useRouter()

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    const status = formData.get('status') as string
    const minScore = formData.get('minScore') as string
    const degree = formData.get('degree') as string
    const skill = formData.get('skill') as string

    if (status) params.set('status', status)
    if (minScore) params.set('minScore', minScore)
    if (degree) params.set('degree', degree)
    if (skill) params.set('skill', skill)

    const queryString = params.toString()
    router.push(`/dashboard/employer/jobs/${jobId}/applicants${queryString ? `?${queryString}` : ''}`)
  }

  function clearFilters() {
    router.push(`/dashboard/employer/jobs/${jobId}/applicants`)
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
          <Select
            label="Status"
            name="status"
            options={statusOptions}
            defaultValue={currentStatus}
          />
          <Select
            label="Min Score"
            name="minScore"
            options={scoreOptions}
            defaultValue={currentMinScore}
          />
          <Select
            label="Degree"
            name="degree"
            options={degreeOptions}
            defaultValue={currentDegree}
          />
          <Input
            label="Skill"
            name="skill"
            placeholder="e.g. React"
            defaultValue={currentSkill}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">Filter</Button>
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
