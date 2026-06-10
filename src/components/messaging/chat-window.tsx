'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Message } from '@/types/database'
import { sendMessage, markAsRead, getMessages } from '@/lib/actions/messages'
import { subscribeToMessages } from '@/lib/supabase/realtime'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'

interface ChatWindowProps {
  conversationId: string
  initialMessages: Message[]
  currentUserId: string
  hasMore: boolean
  otherPartyName: string
  jobTitle: string
}

export function ChatWindow({
  conversationId,
  initialMessages,
  currentUserId,
  hasMore: initialHasMore,
  otherPartyName,
  jobTitle,
}: ChatWindowProps) {
  // Messages are stored oldest-first for display
  const [messages, setMessages] = useState<Message[]>(() =>
    [...initialMessages].reverse()
  )
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isInitialScrollRef = useRef(true)

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    })
  }, [])

  // Initial scroll to bottom
  useEffect(() => {
    if (isInitialScrollRef.current) {
      scrollToBottom(false)
      isInitialScrollRef.current = false
    }
  }, [scrollToBottom])

  // Mark messages as read on mount
  useEffect(() => {
    markAsRead(conversationId)
  }, [conversationId])

  // Subscribe to realtime messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
      scrollToBottom(true)

      // Mark as read if the message is from the other party
      if (newMessage.sender_id !== currentUserId) {
        markAsRead(conversationId)
      }
    })

    return unsubscribe
  }, [conversationId, currentUserId, scrollToBottom])

  // Handle sending messages
  async function handleSend(content: string) {
    const result = await sendMessage(conversationId, content)
    if (result.success && result.message) {
      setMessages((prev) => {
        // Avoid duplicate if realtime already added it
        if (prev.some((m) => m.id === result.message!.id)) {
          return prev
        }
        return [...prev, result.message!]
      })
      scrollToBottom(true)
    }
  }

  // Load more (older) messages
  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    const container = messagesContainerRef.current
    const prevScrollHeight = container?.scrollHeight || 0

    const result = await getMessages(conversationId, page)
    const olderMessages = [...result.messages].reverse()

    setMessages((prev) => [...olderMessages, ...prev])
    setHasMore(result.hasMore)
    setPage((p) => p + 1)
    setLoadingMore(false)

    // Restore scroll position after prepending
    requestAnimationFrame(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight
        container.scrollTop = newScrollHeight - prevScrollHeight
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-900">{otherPartyName}</h2>
        <p className="text-xs text-gray-500">{jobTitle}</p>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {hasMore && (
          <div className="text-center mb-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput onSend={handleSend} />
    </div>
  )
}
