export type UserRole = 'jobseeker' | 'employer'

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship'

export type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone: string | null
  location: string | null
  bio: string | null
  degree: string | null
  degree_field: string | null
  experience_years: number | null
  skills: string[]
  languages: string[]
  preferred_job_categories: string[]
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  owner_id: string
  name: string
  description: string | null
  industry: string | null
  location: string | null
  website: string | null
  logo_url: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string | null
  required_skills: string[]
  preferred_skills: string[]
  degree_requirement: string | null
  experience_min: number | null
  experience_max: number | null
  job_category: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  employment_type: EmploymentType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  job_id: string
  user_id: string
  status: ApplicationStatus
  match_score: number | null
  score_breakdown: Record<string, unknown> | null
  cover_letter: string | null
  applied_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  application_id: string
  company_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<User>
      }
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'verified'> & {
          id?: string
          created_at?: string
          updated_at?: string
          verified?: boolean
        }
        Update: Partial<Company>
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'is_active'> & {
          id?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: Partial<Job>
      }
      applications: {
        Row: Application
        Insert: Omit<Application, 'id' | 'applied_at' | 'updated_at' | 'status' | 'match_score' | 'score_breakdown'> & {
          id?: string
          applied_at?: string
          updated_at?: string
          status?: ApplicationStatus
          match_score?: number | null
          score_breakdown?: Record<string, unknown> | null
        }
        Update: Partial<Application>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Conversation>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at' | 'read'> & {
          id?: string
          created_at?: string
          read?: boolean
        }
        Update: Partial<Message>
      }
    }
  }
}
