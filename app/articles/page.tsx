import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticleList from '@/components/articles/ArticleList'
import ArticleFilters from '@/components/articles/ArticleFilters'

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { folder?: string; tag?: string; sort?: string }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">記事一覧</h1>
        </div>

        <ArticleFilters />
        <ArticleList
          userId={session?.user?.id || 'demo-user-id'}
          folderId={searchParams.folder}
          tag={searchParams.tag}
          sortBy={searchParams.sort}
        />
      </div>
    </DashboardLayout>
  )
}
