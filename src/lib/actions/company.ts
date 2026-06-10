'use server'

import { createClient } from '@/lib/supabase/server'
import type { Company } from '@/types/database'

/**
 * Get the company owned by the current user (employer).
 */
export async function getMyCompany(): Promise<Company | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return null
  }

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', authUser.id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Company
}

/**
 * Create a new company for the current employer user.
 */
export async function createCompany(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user already has a company
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', authUser.id)
    .single()

  if (existingCompany) {
    return { success: false, error: 'You already have a company registered' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const industry = formData.get('industry') as string
  const location = formData.get('location') as string
  const website = formData.get('website') as string

  if (!name) {
    return { success: false, error: 'Company name is required' }
  }

  const { error } = await supabase.from('companies').insert({
    owner_id: authUser.id,
    name,
    description: description || null,
    industry: industry || null,
    location: location || null,
    website: website || null,
    logo_url: null,
  })

  if (error) {
    console.error('Error creating company:', error)
    return { success: false, error: 'Failed to create company. Please try again.' }
  }

  return { success: true }
}

/**
 * Update an existing company owned by the current user.
 */
export async function updateCompany(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { success: false, error: 'Not authenticated' }
  }

  // Find the company owned by this user
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', authUser.id)
    .single()

  if (!company) {
    return { success: false, error: 'Company not found' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const industry = formData.get('industry') as string
  const location = formData.get('location') as string
  const website = formData.get('website') as string

  if (!name) {
    return { success: false, error: 'Company name is required' }
  }

  const { error } = await supabase
    .from('companies')
    .update({
      name,
      description: description || null,
      industry: industry || null,
      location: location || null,
      website: website || null,
    })
    .eq('id', company.id)

  if (error) {
    console.error('Error updating company:', error)
    return { success: false, error: 'Failed to update company. Please try again.' }
  }

  return { success: true }
}
