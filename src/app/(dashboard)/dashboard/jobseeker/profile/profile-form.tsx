'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfile } from '@/lib/actions/profile'
import { JOB_CATEGORIES } from '@/lib/matching/constants'
import type { User } from '@/types/database'

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="full_name"
          defaultValue={user.full_name}
          required
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={user.phone || ''}
          placeholder="+880 1XXX-XXXXXX"
        />
      </div>

      <Input
        label="Location"
        name="location"
        defaultValue={user.location || ''}
        placeholder="e.g., Dhaka, Bangladesh"
      />

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={user.bio || ''}
          placeholder="Tell employers about yourself..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Education */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
              Degree Level
            </label>
            <select
              id="degree"
              name="degree"
              defaultValue={user.degree || ''}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select degree</option>
              <option value="ssc">SSC</option>
              <option value="hsc">HSC</option>
              <option value="diploma">Diploma</option>
              <option value="bachelors">Bachelors</option>
              <option value="masters">Masters</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <Input
            label="Field of Study"
            name="degree_field"
            defaultValue={user.degree_field || ''}
            placeholder="e.g., Computer Science"
          />
        </div>
      </div>

      {/* Experience */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Experience</h3>
        <Input
          label="Years of Experience"
          name="experience_years"
          type="number"
          min="0"
          max="50"
          defaultValue={user.experience_years?.toString() || ''}
          placeholder="0"
        />
      </div>

      {/* Skills */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Skills & Languages</h3>
        <Input
          label="Skills"
          name="skills"
          defaultValue={user.skills.join(', ')}
          placeholder="e.g., JavaScript, React, Node.js, Python"
          helperText="Separate skills with commas"
        />
        <div className="mt-4">
          <Input
            label="Languages"
            name="languages"
            defaultValue={user.languages.join(', ')}
            placeholder="e.g., Bengali, English, Hindi"
            helperText="Separate languages with commas"
          />
        </div>
      </div>

      {/* Preferred Job Categories */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Job Preferences</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Job Categories
          </label>
          <p className="text-xs text-gray-500 mb-2">Select categories that interest you (hold Ctrl/Cmd to select multiple)</p>
          <CategorySelector defaultCategories={user.preferred_job_categories} />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

function CategorySelector({ defaultCategories }: { defaultCategories: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultCategories)

  const toggleCategory = (value: string) => {
    setSelected(prev => {
      const next = prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
      return next
    })
  }

  return (
    <>
      <input
        type="hidden"
        name="preferred_job_categories"
        value={selected.join(', ')}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
        {JOB_CATEGORIES.map((cat) => (
          <label
            key={cat.value}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
              selected.includes(cat.value)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(cat.value)}
              onChange={() => toggleCategory(cat.value)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            {cat.label}
          </label>
        ))}
      </div>
    </>
  )
}
