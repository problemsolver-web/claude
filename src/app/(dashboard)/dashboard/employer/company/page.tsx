import { createClient } from '@/lib/supabase/server'
import { CompanyForm } from './company-form'
import type { Company } from '@/types/database'

export default async function CompanyPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  let company: Company | null = null

  if (authUser) {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', authUser.id)
      .single()

    company = data as Company | null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {company ? 'Edit Company Profile' : 'Create Company Profile'}
        </h1>
        <p className="text-gray-600 mt-1">
          {company
            ? 'Update your company information.'
            : 'Set up your company to start posting jobs and receiving applications.'}
        </p>
      </div>

      <CompanyForm company={company} />
    </div>
  )
}
