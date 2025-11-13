'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface QuestionViewProps {
  question: any
  answers: any[]
  currentUserId: string
}

export default function QuestionView({ question, answers, currentUserId }: QuestionViewProps) {
  const router = useRouter()
  const [answerText, setAnswerText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerText.trim()) return

    setLoading(true)
    try {
      const supabase = createClient()
      await (supabase as any).from('answers').insert({
        question_id: question.id,
        content: answerText,
        author_id: currentUserId,
      })

      setAnswerText('')
      router.refresh()
    } catch (error) {
      console.error('Failed to post answer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkBestAnswer = async (answerId: string) => {
    const supabase = createClient()

    // Unmark all best answers
    await (supabase as any)
      .from('answers')
      .update({ is_best_answer: false })
      .eq('question_id', question.id)

    // Mark this as best answer
    await (supabase as any)
      .from('answers')
      .update({ is_best_answer: true })
      .eq('id', answerId)

    // Update question status to resolved
    await (supabase as any)
      .from('questions')
      .update({ status: 'resolved' })
      .eq('id', question.id)

    router.refresh()
  }

  const handleResolve = async () => {
    const supabase = createClient()
    await (supabase as any)
      .from('questions')
      .update({ status: 'resolved' })
      .eq('id', question.id)

    router.refresh()
  }

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
    <div className="max-w-4xl mx-auto p-8">
      {/* Question Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                statusColors[question.status as keyof typeof statusColors]
              }`}
            >
              {statusLabels[question.status as keyof typeof statusLabels]}
            </span>
            <h1 className="text-4xl font-bold mb-4">{question.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                  {question.author?.display_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium">{question.author?.display_name}</p>
                  <p className="text-xs text-gray-500">{question.author?.department}</p>
                </div>
              </div>

              <span>👁️ {question.view_count} 閲覧</span>

              <span>
                📅{' '}
                {new Date(question.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {question.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/questions?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {question.author_id === currentUserId && question.status === 'open' && (
            <button
              onClick={handleResolve}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✓ 解決済みにする
            </button>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap">{question.content}</div>
        </div>
      </div>

      {/* Answers */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">💬 回答 ({answers.length})</h2>

        {/* Answer Form */}
        <form onSubmit={handleAnswer} className="mb-6">
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="回答を入力..."
            rows={6}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !answerText.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? '送信中...' : '回答する'}
            </button>
          </div>
        </form>

        {/* Answers List */}
        <div className="space-y-4">
          {answers.map((answer: any) => (
            <div
              key={answer.id}
              className={`border rounded-lg p-6 ${
                answer.is_best_answer ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              {answer.is_best_answer && (
                <div className="mb-3 flex items-center gap-2 text-green-700 font-semibold">
                  ✓ ベストアンサー
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {answer.author?.display_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-medium text-sm">{answer.author?.display_name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(answer.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {question.author_id === currentUserId &&
                  !answer.is_best_answer &&
                  question.status !== 'resolved' && (
                    <button
                      onClick={() => handleMarkBestAnswer(answer.id)}
                      className="px-3 py-1 text-sm border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors"
                    >
                      ベストアンサーにする
                    </button>
                  )}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
            </div>
          ))}

          {answers.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              まだ回答がありません。最初の回答を投稿しましょう！
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
