import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import QuestionView from '@/components/questions/QuestionView'

export default async function QuestionPage({ params }: { params: { id: string } }) {
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

  // Fetch question with author info
  const { data: question } = await supabase
    .from('questions')
    .select(`
      *,
      author:users!questions_author_id_fkey(id, display_name, avatar_url, department)
    `)
    .eq('id', params.id)
    .single()

  if (!question) {
    notFound()
  }

  // Increment view count
  await (supabase as any)
    .from('questions')
    .update({ view_count: ((question as any).view_count || 0) + 1 })
    .eq('id', params.id)

  // Fetch answers
  const { data: answers } = await supabase
    .from('answers')
    .select(`
      *,
      author:users!answers_author_id_fkey(display_name, avatar_url)
    `)
    .eq('question_id', params.id)
    .order('is_best_answer', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <DashboardLayout user={user}>
      <QuestionView
        question={question}
        answers={answers || []}
        currentUserId={session.user.id}
      />
    </DashboardLayout>
  )
}
