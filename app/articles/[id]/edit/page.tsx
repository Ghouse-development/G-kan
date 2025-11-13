import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticleEditor from '@/components/articles/ArticleEditor'

export default async function EditArticlePage({ params }: { params: { id: string } }) {
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

  // Fetch article
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!article) {
    notFound()
  }

  // Check if user is the author
  if ((article as any).author_id !== session.user.id && !(user as any)?.is_admin) {
    redirect(`/articles/${params.id}`)
  }

  // Fetch folders for selection
  const { data: folders } = await supabase
    .from('folders')
    .select('id, name, icon, color')
    .eq('is_archived', false)
    .order('name')

  return (
    <DashboardLayout user={user}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">記事を編集</h1>
        <ArticleEditor folders={folders || []} userId={session.user.id} article={article} />
      </div>
    </DashboardLayout>
  )
}
