'use client'

import { format } from 'date-fns'
import type { Message } from '@/types/database'

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'bg-primary-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwnMessage ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`text-xs ${
              isOwnMessage ? 'text-primary-200' : 'text-gray-400'
            }`}
          >
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          {isOwnMessage && (
            <span className="text-xs text-primary-200">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
