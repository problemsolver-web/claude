import { getConversations } from '@/lib/actions/messages'
import { ConversationList } from '@/components/messaging/conversation-list'
import { Card, CardHeader, CardBody } from '@/components/ui/card'

export default async function JobSeekerMessagesPage() {
  const conversations = await getConversations()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chat with employers who have accepted your applications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        </CardHeader>
        <CardBody className="p-0">
          <ConversationList
            conversations={conversations}
            basePath="/dashboard/jobseeker/messages"
          />
        </CardBody>
      </Card>
    </div>
  )
}
