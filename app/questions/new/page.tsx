import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import QuestionEditor from '@/components/questions/QuestionEditor'

export default async function NewQuestionPage() {
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
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">新規質問</h1>
        <QuestionEditor userId={session?.user?.id || 'demo-user-id'} />
      </div>
    </DashboardLayout>
  )
}
