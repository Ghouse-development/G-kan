import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProfileSettings from '@/components/settings/ProfileSettings'
import NotificationSettings from '@/components/settings/NotificationSettings'

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <DashboardLayout user={user}>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">⚙️ 設定</h1>

        <div className="space-y-8">
          <ProfileSettings user={user} />
          <NotificationSettings user={user} />
        </div>
      </div>
    </DashboardLayout>
  )
}
