import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import QuestionEditor from '@/components/questions/QuestionEditor'

export default async function NewQuestionPage() {
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
        <h1 className="text-3xl font-bold mb-6">新規質問</h1>
        <QuestionEditor userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
