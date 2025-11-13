import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RecentArticles from '@/components/dashboard/RecentArticles'
import QuickStats from '@/components/dashboard/QuickStats'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 一時的に認証チェックを無効化
  // if (!session) {
  //   redirect('/login')
  // }

  // Fetch user data (セッションがない場合はnull)
  const { data: user } = session ? await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single() : { data: null }

  // デモ用のダミーユーザー
  const dummyUser = user || {
    id: 'demo-user-id',
    email: 'demo@ghouse.co.jp',
    display_name: 'デモユーザー',
    avatar_url: null,
    department: null,
    position: null,
    is_admin: true,
    notification_settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <DashboardLayout user={dummyUser}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

        <QuickStats userId={session?.user?.id || 'demo-user-id'} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">最近の記事</h2>
          <RecentArticles userId={session?.user?.id || 'demo-user-id'} />
        </div>
      </div>
    </DashboardLayout>
  )
}
