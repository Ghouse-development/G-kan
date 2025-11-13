import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import FolderList from '@/components/folders/FolderList'
import CreateFolderButton from '@/components/folders/CreateFolderButton'

export default async function FoldersPage() {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">フォルダ</h1>
          <CreateFolderButton />
        </div>

        <FolderList userId={session?.user?.id || 'demo-user-id'} />
      </div>
    </DashboardLayout>
  )
}
