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

  if (!session) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <DashboardLayout user={user}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">記事一覧</h1>
        </div>

        <ArticleFilters />
        <ArticleList
          userId={session.user.id}
          folderId={searchParams.folder}
          tag={searchParams.tag}
          sortBy={searchParams.sort}
        />
      </div>
    </DashboardLayout>
  )
}
