import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SearchInterface from '@/components/search/SearchInterface'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; mode?: 'keyword' | 'ai' }
}) {
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
        <h1 className="text-3xl font-bold mb-6">🔍 検索</h1>
        <SearchInterface
          userId={session?.user?.id || 'demo-user-id'}
          initialQuery={searchParams.q}
          initialMode={searchParams.mode || 'keyword'}
        />
      </div>
    </DashboardLayout>
  )
}
