import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ApprovalsList from '@/components/approvals/ApprovalsList'

export default async function ApprovalsPage() {
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

  // Check if user is admin or has approval permissions
  if (!(user as any)?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">✅ 承認待ち記事</h1>
        <ApprovalsList userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
