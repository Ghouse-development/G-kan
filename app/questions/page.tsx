import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import QuestionList from '@/components/questions/QuestionList'
import Link from 'next/link'

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: { status?: string; tag?: string }
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
          <h1 className="text-3xl font-bold">💬 Q&A</h1>
          <Link
            href="/questions/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + 質問する
          </Link>
        </div>

        <div className="mb-6 flex gap-2">
          <Link
            href="/questions"
            className={`px-4 py-2 rounded-lg ${
              !searchParams.status
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            すべて
          </Link>
          <Link
            href="/questions?status=open"
            className={`px-4 py-2 rounded-lg ${
              searchParams.status === 'open'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            未解決
          </Link>
          <Link
            href="/questions?status=resolved"
            className={`px-4 py-2 rounded-lg ${
              searchParams.status === 'resolved'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            解決済み
          </Link>
        </div>

        <QuestionList status={searchParams.status} tag={searchParams.tag} />
      </div>
    </DashboardLayout>
  )
}
