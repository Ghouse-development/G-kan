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
        <h1 className="text-3xl font-bold mb-6">🔍 検索</h1>
        <SearchInterface
          userId={session.user.id}
          initialQuery={searchParams.q}
          initialMode={searchParams.mode || 'keyword'}
        />
      </div>
    </DashboardLayout>
  )
}
