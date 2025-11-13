'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Article, Reaction } from '@/types/supabase'

interface ArticleViewProps {
  article: any
  reactions: Reaction[]
  comments: any[]
  currentUserId: string
}

export default function ArticleView({
  article,
  reactions,
  comments,
  currentUserId,
}: ArticleViewProps) {
  const router = useRouter()
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)

  const userReactions = reactions.filter((r) => r.user_id === currentUserId)
  const reactionCounts = {
    like: reactions.filter((r) => r.reaction_type === 'like').length,
    helpful: reactions.filter((r) => r.reaction_type === 'helpful').length,
    thanks: reactions.filter((r) => r.reaction_type === 'thanks').length,
  }

  const handleReaction = async (type: 'like' | 'helpful' | 'thanks') => {
    const supabase = createClient()

    const existingReaction = userReactions.find((r) => r.reaction_type === type)

    if (existingReaction) {
      // Remove reaction
      await (supabase as any).from('reactions').delete().eq('id', existingReaction.id)
    } else {
      // Add reaction
      await (supabase as any).from('reactions').insert({
        target_type: 'article',
        target_id: article.id,
        reaction_type: type,
        user_id: currentUserId,
      })
    }

    router.refresh()
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setLoading(true)
    try {
      const supabase = createClient()
      await (supabase as any).from('comments').insert({
        target_type: 'article',
        target_id: article.id,
        content: commentText,
        author_id: currentUserId,
      })

      setCommentText('')
      router.refresh()
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この記事を削除してもよろしいですか？')) return

    const supabase = createClient()
    await (supabase as any).from('articles').delete().eq('id', article.id)
    router.push('/articles')
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {article.is_pinned && (
              <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full mb-3">
                📌 ピン留め
              </span>
            )}
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                  {article.author?.display_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium">{article.author?.display_name}</p>
                  <p className="text-xs text-gray-500">{article.author?.department}</p>
                </div>
              </div>

              <span
                className="px-3 py-1 rounded text-white text-xs"
                style={{ backgroundColor: article.folder?.color || '#3B82F6' }}
              >
                {article.folder?.icon} {article.folder?.name}
              </span>

              <span>👁️ {article.view_count} 閲覧</span>

              <span>
                📅{' '}
                {new Date(article.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {article.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/articles?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {article.author_id === currentUserId && (
            <div className="flex gap-2">
              <Link
                href={`/articles/${article.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ✏️ 編集
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ 削除
              </button>
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleReaction('like')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              userReactions.some((r) => r.reaction_type === 'like')
                ? 'bg-blue-50 border-blue-300 text-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            👍 いいね {reactionCounts.like > 0 && `(${reactionCounts.like})`}
          </button>
          <button
            onClick={() => handleReaction('helpful')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              userReactions.some((r) => r.reaction_type === 'helpful')
                ? 'bg-green-50 border-green-300 text-green-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            💡 参考になった {reactionCounts.helpful > 0 && `(${reactionCounts.helpful})`}
          </button>
          <button
            onClick={() => handleReaction('thanks')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              userReactions.some((r) => r.reaction_type === 'thanks')
                ? 'bg-yellow-50 border-yellow-300 text-yellow-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            🙏 ありがとう {reactionCounts.thanks > 0 && `(${reactionCounts.thanks})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap">{article.content}</div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">💬 コメント ({comments.length})</h2>

        {/* Comment Form */}
        <form onSubmit={handleComment} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="コメントを入力..."
            rows={4}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !commentText.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? '送信中...' : 'コメントする'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="border-l-4 border-primary-200 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
                  {comment.author?.display_name?.charAt(0) || 'U'}
                </div>
                <span className="font-medium text-sm">{comment.author?.display_name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              まだコメントがありません。最初のコメントを投稿しましょう！
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
