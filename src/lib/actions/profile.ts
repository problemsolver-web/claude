'use server'

import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types/database'

/**
 * Get the current user's profile.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return null
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  return (profile as User) || null
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { success: false, error: 'Not authenticated' }
  }

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const location = formData.get('location') as string
  const bio = formData.get('bio') as string
  const degree = formData.get('degree') as string
  const degreeField = formData.get('degree_field') as string
  const experienceYears = formData.get('experience_years') as string
  const skillsRaw = formData.get('skills') as string
  const languagesRaw = formData.get('languages') as string
  const categoriesRaw = formData.get('preferred_job_categories') as string

  // Parse comma-separated arrays
  const skills = skillsRaw
    ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const languages = languagesRaw
    ? languagesRaw.split(',').map(l => l.trim()).filter(Boolean)
    : []
  const preferredJobCategories = categoriesRaw
    ? categoriesRaw.split(',').map(c => c.trim()).filter(Boolean)
    : []

  const updateData: Partial<User> = {
    full_name: fullName || undefined,
    phone: phone || null,
    location: location || null,
    bio: bio || null,
    degree: degree || null,
    degree_field: degreeField || null,
    experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
    skills,
    languages,
    preferred_job_categories: preferredJobCategories,
  }

  // Remove undefined fields
  const cleanData = Object.fromEntries(
    Object.entries(updateData).filter(([, v]) => v !== undefined)
  )

  // Explicitly prevent role escalation: never allow role to be changed via profile update.
  // Even if the field is somehow injected into the payload, strip it here.
  delete cleanData.role

  const { error } = await supabase
    .from('users')
    .update(cleanData)
    .eq('id', authUser.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Failed to update profile. Please try again.' }
  }

  return { success: true }
}
