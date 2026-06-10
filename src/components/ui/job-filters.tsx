'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { JOB_CATEGORIES } from '@/lib/matching/constants'

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentType = searchParams.get('type') || ''
  const currentSearch = searchParams.get('search') || ''

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 on filter change
    params.delete('page')
    router.push(`/dashboard/jobseeker/jobs?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-xs font-medium text-gray-600 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Job title or keyword..."
            defaultValue={currentSearch}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilters('search', (e.target as HTMLInputElement).value)
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== currentSearch) {
                updateFilters('search', e.target.value)
              }
            }}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => updateFilters('category', e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label htmlFor="type" className="block text-xs font-medium text-gray-600 mb-1">
            Employment Type
          </label>
          <select
            id="type"
            value={currentType}
            onChange={(e) => updateFilters('type', e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>
    </div>
  )
}
