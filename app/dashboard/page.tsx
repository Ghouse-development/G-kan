import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RecentArticles from '@/components/dashboard/RecentArticles'
import QuickStats from '@/components/dashboard/QuickStats'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <DashboardLayout user={user}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

        <QuickStats userId={session.user.id} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">最近の記事</h2>
          <RecentArticles userId={session.user.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}
