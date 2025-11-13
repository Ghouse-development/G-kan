import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticleEditor from '@/components/articles/ArticleEditor'

export default async function NewArticlePage() {
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

  // Fetch folders for selection
  const { data: folders } = await supabase
    .from('folders')
    .select('id, name, icon, color')
    .eq('is_archived', false)
    .order('name')

  return (
    <DashboardLayout user={user}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">新規記事作成</h1>
        <ArticleEditor folders={folders || []} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
