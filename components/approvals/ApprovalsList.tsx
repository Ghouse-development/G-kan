import { createServerClient } from '@/lib/supabase/server'
import ApprovalCard from './ApprovalCard'

export default async function ApprovalsList({ userId }: { userId: string }) {
  const supabase = await createServerClient()

  // Fetch pending approvals
  const { data: approvals } = await supabase
    .from('approvals')
    .select(`
      *,
      article:articles(
        id,
        title,
        content,
        tags,
        folder:folders(name, color)
      ),
      requested_by_user:users!approvals_requested_by_fkey(display_name, department)
    `)
    .eq('approver_id', userId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })

  if (!approvals || approvals.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        承認待ちの記事はありません
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval: any) => (
        <ApprovalCard key={approval.id} approval={approval} />
      ))}
    </div>
  )
}
