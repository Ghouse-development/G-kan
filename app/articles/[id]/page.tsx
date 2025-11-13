import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticleView from '@/components/articles/ArticleView'

export default async function ArticlePage({ params }: { params: { id: string } }) {
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

  // Fetch article with author and folder info
  const { data: article } = await supabase
    .from('articles')
    .select(`
      *,
      author:users!articles_author_id_fkey(id, display_name, avatar_url, department),
      folder:folders(id, name, icon, color)
    `)
    .eq('id', params.id)
    .single()

  if (!article) {
    notFound()
  }

  // Increment view count
  await (supabase as any)
    .from('articles')
    .update({ view_count: ((article as any).view_count || 0) + 1 })
    .eq('id', params.id)

  // Fetch reactions
  const { data: reactions } = await supabase
    .from('reactions')
    .select('*')
    .eq('target_type', 'article')
    .eq('target_id', params.id)

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      author:users!comments_author_id_fkey(display_name, avatar_url)
    `)
    .eq('target_type', 'article')
    .eq('target_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <DashboardLayout user={user}>
      <ArticleView
        article={article}
        reactions={reactions || []}
        comments={comments || []}
        currentUserId={session.user.id}
      />
    </DashboardLayout>
  )
}
