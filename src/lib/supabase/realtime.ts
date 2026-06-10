'use client'

import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe to new messages in a conversation.
 * Returns a cleanup function that unsubscribes from the channel.
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
): () => void {
  const supabase = createClient()

  const channel: RealtimeChannel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
