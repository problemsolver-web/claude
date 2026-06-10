import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMessages, getConversationDetails } from '@/lib/actions/messages'
import { ChatWindow } from '@/components/messaging/chat-window'
import Link from 'next/link'

export default async function EmployerChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const details = await getConversationDetails(conversationId)
  if (!details) {
    redirect('/dashboard/employer/messages')
  }

  const { messages, hasMore } = await getMessages(conversationId, 0)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link
          href="/dashboard/employer/messages"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to messages
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[600px] flex flex-col overflow-hidden">
        <ChatWindow
          conversationId={conversationId}
          initialMessages={messages}
          currentUserId={authUser.id}
          hasMore={hasMore}
          otherPartyName={details.otherPartyName}
          jobTitle={details.jobTitle}
        />
      </div>
    </div>
  )
}
