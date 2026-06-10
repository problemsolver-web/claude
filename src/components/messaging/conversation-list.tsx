'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { ConversationWithDetails } from '@/lib/actions/messages'

interface ConversationListProps {
  conversations: ConversationWithDetails[]
  basePath: string
  activeConversationId?: string
}

export function ConversationList({
  conversations,
  basePath,
  activeConversationId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No conversations yet</h3>
        <p className="text-sm text-gray-500">
          Conversations will appear here once an application is accepted.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`${basePath}/${conversation.id}`}
          className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
            activeConversationId === conversation.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {conversation.other_party_name}
                </p>
                {conversation.unread_count > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {conversation.job_title}
              </p>
              {conversation.last_message && (
                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.last_message}
                </p>
              )}
            </div>
            {conversation.last_message_at && (
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {formatDistanceToNow(new Date(conversation.last_message_at), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
