'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { createCompany, updateCompany } from '@/lib/actions/company'
import type { Company } from '@/types/database'

interface CompanyFormProps {
  company: Company | null
}

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const action = company ? updateCompany : createCompany
      const result = await action(formData)

      if (result.success) {
        router.push('/dashboard/employer')
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
        <CardBody>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Input
              label="Company Name"
              name="name"
              defaultValue={company?.name || ''}
              placeholder="e.g. TechCorp Bangladesh"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={company?.description || ''}
                placeholder="Tell candidates about your company, mission, and culture..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Industry"
                name="industry"
                defaultValue={company?.industry || ''}
                placeholder="e.g. Technology, Finance"
              />
              <Input
                label="Location"
                name="location"
                defaultValue={company?.location || ''}
                placeholder="e.g. Dhaka, Bangladesh"
              />
            </div>

            <Input
              label="Website"
              name="website"
              type="url"
              defaultValue={company?.website || ''}
              placeholder="https://yourcompany.com"
            />
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/employer')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (company ? 'Update Company' : 'Create Company')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
