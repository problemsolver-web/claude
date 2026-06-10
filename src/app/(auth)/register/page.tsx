'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'employer'>('jobseeker')

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    try {
      const result = await register(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch {
      // redirect throws, which is expected
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Create your account
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Enter your full name"
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Create a password (min 6 characters)"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`relative flex cursor-pointer items-center justify-center rounded-lg border-2 p-3 text-center transition-colors ${
                selectedRole === 'jobseeker'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="jobseeker"
                checked={selectedRole === 'jobseeker'}
                onChange={() => setSelectedRole('jobseeker')}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-medium">Find a Job</div>
                <div className="text-xs text-gray-500 mt-0.5">Job Seeker</div>
              </div>
            </label>
            <label
              className={`relative flex cursor-pointer items-center justify-center rounded-lg border-2 p-3 text-center transition-colors ${
                selectedRole === 'employer'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="employer"
                checked={selectedRole === 'employer'}
                onChange={() => setSelectedRole('employer')}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-medium">Hire Talent</div>
                <div className="text-xs text-gray-500 mt-0.5">Employer</div>
              </div>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
