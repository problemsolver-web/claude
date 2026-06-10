'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get the user's role to redirect appropriately
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication failed' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userProfile = profile as { role: string } | null
  if (userProfile?.role === 'employer') {
    redirect('/dashboard/employer')
  } else {
    redirect('/dashboard/jobseeker')
  }
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as 'jobseeker' | 'employer'

  if (!email || !password || !fullName || !role) {
    return { error: 'All fields are required' }
  }

  const supabase = await createClient()

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  if (authData.user) {
    // Create user profile in the users table
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
      skills: [],
      languages: [],
      preferred_job_categories: [],
    })

    if (profileError) {
      return { error: 'Failed to create user profile. Please try again.' }
    }
  }

  if (role === 'employer') {
    redirect('/dashboard/employer')
  } else {
    redirect('/dashboard/jobseeker')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
