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

  // 一時的に認証チェックを無効化
  // if (!session) {
  //   redirect('/login')
  // }

  const { data: user } = session ? await supabase
    .from('users')
    .select('*')
    .eq('id', session?.user?.id || 'demo-user-id')
    .single() : { data: null }

  // デモ用のダミーユーザー
  const dummyUser = user || {
    id: 'demo-user-id',
    email: 'demo@ghouse.co.jp',
    name: 'デモユーザー',
    role: 'admin',
  }

  return (
    <DashboardLayout user={dummyUser}>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">⚙️ 設定</h1>

        <div className="space-y-8">
          <ProfileSettings user={dummyUser} />
          <NotificationSettings user={dummyUser} />
        </div>
      </div>
    </DashboardLayout>
  )
}
