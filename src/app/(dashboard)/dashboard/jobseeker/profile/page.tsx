import { getCurrentUser } from '@/lib/actions/profile'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load profile. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Keep your profile up to date for better job matches.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </CardHeader>
        <CardBody>
          <ProfileForm user={user} />
        </CardBody>
      </Card>
    </div>
  )
}
