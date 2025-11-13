import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface QuestionListProps {
  status?: string
  tag?: string
}

export default async function QuestionList({ status, tag }: QuestionListProps) {
  const supabase = await createServerClient()

  let query = supabase
    .from('questions')
    .select(`
      *,
      author:users!questions_author_id_fkey(display_name, avatar_url),
      answers(count)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data: questions } = await query

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        質問がまだありません。最初の質問を投稿しましょう！
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      {questions.map((question: any) => {
        const answerCount = question.answers?.[0]?.count || 0
        const statusColors = {
          open: 'bg-blue-100 text-blue-800',
          resolved: 'bg-green-100 text-green-800',
          closed: 'bg-gray-100 text-gray-800',
        }
        const statusLabels = {
          open: '未解決',
          resolved: '解決済み',
          closed: 'クローズ',
        }

        return (
          <Link
            key={question.id}
            href={`/questions/${question.id}`}
            className="block p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[question.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[question.status as keyof typeof statusLabels]}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600">
                    {question.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {question.content.substring(0, 200)}...
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    👤 {question.author?.display_name || '不明'}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {answerCount}件の回答
                  </span>
                  <span className="flex items-center gap-1">
                    👁️ {question.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    📅{' '}
                    {new Date(question.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {question.tags.map((tagItem: string) => (
                      <span
                        key={tagItem}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        #{tagItem}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
