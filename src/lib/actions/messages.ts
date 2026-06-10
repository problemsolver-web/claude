'use server'

import { createClient } from '@/lib/supabase/server'
import type { Message } from '@/types/database'

export interface ConversationWithDetails {
  id: string
  application_id: string
  company_id: string
  user_id: string
  created_at: string
  updated_at: string
  other_party_name: string
  job_title: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

export interface MessagesResponse {
  messages: Message[]
  hasMore: boolean
}

/**
 * Get all conversations for the current user.
 * Works for both job seekers and employers.
 */
export async function getConversations(): Promise<ConversationWithDetails[]> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return []
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()

  if (!profile) {
    return []
  }

  // Fetch conversations based on role
  let conversationsQuery

  if (profile.role === 'jobseeker') {
    conversationsQuery = supabase
      .from('conversations')
      .select('*, companies(name), applications(jobs(title))')
      .eq('user_id', authUser.id)
      .order('updated_at', { ascending: false })
  } else {
    // Employer - get company first
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', authUser.id)
      .single()

    if (!company) {
      return []
    }

    conversationsQuery = supabase
      .from('conversations')
      .select('*, users(full_name), applications(jobs(title))')
      .eq('company_id', company.id)
      .order('updated_at', { ascending: false })
  }

  const { data: conversations, error } = await conversationsQuery

  if (error || !conversations) {
    console.error('Error fetching conversations:', error)
    return []
  }

  if (conversations.length === 0) {
    return []
  }

  // Batch queries: fetch last messages and unread counts for all conversations at once
  const conversationIds = conversations.map((c: { id: string }) => c.id)

  // Get last message for each conversation in a single query
  // We fetch all messages ordered by created_at desc, then deduplicate per conversation
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('conversation_id, content, created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false })

  // Build a map of conversation_id -> last message (first occurrence per conversation)
  const lastMessageMap = new Map<string, { content: string; created_at: string }>()
  if (recentMessages) {
    for (const msg of recentMessages) {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, {
          content: msg.content,
          created_at: msg.created_at,
        })
      }
    }
  }

  // Get unread counts for all conversations in a single query
  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .eq('read', false)
    .neq('sender_id', authUser.id)

  // Build a map of conversation_id -> unread count
  const unreadCountMap = new Map<string, number>()
  if (unreadMessages) {
    for (const msg of unreadMessages) {
      unreadCountMap.set(msg.conversation_id, (unreadCountMap.get(msg.conversation_id) || 0) + 1)
    }
  }

  // Build enriched conversation list without per-conversation queries
  const enriched: ConversationWithDetails[] = []

  for (const conv of conversations) {
    const convData = conv as Record<string, unknown>

    // Extract other party name and job title from the joined data
    let otherPartyName = 'Unknown'
    let jobTitle = 'Unknown Position'

    if (profile.role === 'jobseeker') {
      const company = convData.companies as { name: string } | null
      otherPartyName = company?.name || 'Unknown Company'
    } else {
      const user = convData.users as { full_name: string } | null
      otherPartyName = user?.full_name || 'Unknown User'
    }

    const application = convData.applications as { jobs: { title: string } | null } | null
    jobTitle = application?.jobs?.title || 'Unknown Position'

    const lastMsg = lastMessageMap.get(conv.id)

    enriched.push({
      id: conv.id,
      application_id: conv.application_id,
      company_id: conv.company_id,
      user_id: conv.user_id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      other_party_name: otherPartyName,
      job_title: jobTitle,
      last_message: lastMsg?.content || null,
      last_message_at: lastMsg?.created_at || null,
      unread_count: unreadCountMap.get(conv.id) || 0,
    })
  }

  return enriched
}

/**
 * Get messages for a conversation with pagination.
 * Verifies the user is a participant in the conversation.
 * Returns messages newest first (for pagination), but the UI displays oldest first.
 */
export async function getMessages(
  conversationId: string,
  page: number = 0
): Promise<MessagesResponse> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { messages: [], hasMore: false }
  }

  // Verify user is a participant
  const isParticipant = await verifyParticipant(conversationId, authUser.id)
  if (!isParticipant) {
    return { messages: [], hasMore: false }
  }

  const pageSize = 20
  const offset = page * pageSize

  // Fetch one extra item to determine if more pages exist
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize)

  if (error) {
    console.error('Error fetching messages:', error)
    return { messages: [], hasMore: false }
  }

  const allMessages = (messages || []) as Message[]
  // .range() is inclusive on both bounds, so requesting offset to offset+pageSize
  // returns pageSize+1 items when more exist. Slice to return exactly pageSize items.
  const hasMore = allMessages.length > pageSize
  const returnedMessages = hasMore ? allMessages.slice(0, pageSize) : allMessages

  return {
    messages: returnedMessages,
    hasMore,
  }
}

/**
 * Send a message in a conversation.
 * Verifies the user is a participant.
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ success: boolean; message?: Message; error?: string }> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { success: false, error: 'Not authenticated' }
  }

  if (!content.trim()) {
    return { success: false, error: 'Message cannot be empty' }
  }

  // Verify user is a participant
  const isParticipant = await verifyParticipant(conversationId, authUser.id)
  if (!isParticipant) {
    return { success: false, error: 'You are not a participant in this conversation' }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: authUser.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { success: false, error: 'Failed to send message' }
  }

  // Update conversation's updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return { success: true, message: data as Message }
}

/**
 * Mark all messages in a conversation as read for the current user.
 * Only marks messages sent by the other party.
 */
export async function markAsRead(conversationId: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return
  }

  // Verify user is a participant
  const isParticipant = await verifyParticipant(conversationId, authUser.id)
  if (!isParticipant) {
    return
  }

  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('read', false)
    .neq('sender_id', authUser.id)
}

/**
 * Verify that a user is a participant in a conversation.
 * Checks both direct user_id and company ownership.
 */
async function verifyParticipant(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Check if user is the job seeker in the conversation
  const { data: directMatch } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (directMatch) {
    return true
  }

  // Check if user is the employer (company owner) in the conversation
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', userId)
    .single()

  if (!company) {
    return false
  }

  const { data: companyMatch } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('company_id', company.id)
    .single()

  return !!companyMatch
}

/**
 * Get conversation details for chat header.
 */
export async function getConversationDetails(conversationId: string): Promise<{
  otherPartyName: string
  jobTitle: string
  conversationId: string
} | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return null
  }

  const isParticipant = await verifyParticipant(conversationId, authUser.id)
  if (!isParticipant) {
    return null
  }

  // Get user role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()

  if (!profile) {
    return null
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, companies(name), users(full_name), applications(jobs(title))')
    .eq('id', conversationId)
    .single()

  if (!conversation) {
    return null
  }

  const convData = conversation as Record<string, unknown>

  let otherPartyName = 'Unknown'
  if (profile.role === 'jobseeker') {
    const company = convData.companies as { name: string } | null
    otherPartyName = company?.name || 'Unknown Company'
  } else {
    const user = convData.users as { full_name: string } | null
    otherPartyName = user?.full_name || 'Unknown User'
  }

  const application = convData.applications as { jobs: { title: string } | null } | null
  const jobTitle = application?.jobs?.title || 'Unknown Position'

  return {
    otherPartyName,
    jobTitle,
    conversationId,
  }
}
