import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AdminStats from '@/components/admin/AdminStats'
import UserManagement from '@/components/admin/UserManagement'

export default async function AdminPage() {
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

  // Check if user is admin
  if (!(user as any)?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">🔧 管理者ダッシュボード</h1>

        <div className="space-y-8">
          <AdminStats />
          <UserManagement />
        </div>
      </div>
    </DashboardLayout>
  )
}
