'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ApprovalCardProps {
  approval: any
}

export default function ApprovalCard({ approval }: ApprovalCardProps) {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Update approval status
      await (supabase as any)
        .from('approvals')
        .update({
          status: 'approved',
          comment,
          responded_at: new Date().toISOString(),
        })
        .eq('id', approval.id)

      // Update article status to published
      await (supabase as any)
        .from('articles')
        .update({
          status: 'published',
          approved_by: approval.approver_id,
          approved_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
        })
        .eq('id', approval.article.id)

      // Create notification
      await (supabase as any).from('notifications').insert({
        user_id: approval.requested_by,
        type: 'approval',
        title: '記事が承認されました',
        content: `「${approval.article.title}」が承認され、公開されました。`,
        link_url: `/articles/${approval.article.id}`,
      })

      router.refresh()
    } catch (error) {
      console.error('Approval failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('この記事を却下してもよろしいですか？')) return

    setLoading(true)
    try {
      const supabase = createClient()

      // Update approval status
      await (supabase as any)
        .from('approvals')
        .update({
          status: 'rejected',
          comment,
          responded_at: new Date().toISOString(),
        })
        .eq('id', approval.id)

      // Create notification
      await (supabase as any).from('notifications').insert({
        user_id: approval.requested_by,
        type: 'approval',
        title: '記事が却下されました',
        content: `「${approval.article.title}」が却下されました。${comment ? `理由: ${comment}` : ''}`,
        link_url: `/articles/${approval.article.id}/edit`,
      })

      router.refresh()
    } catch (error) {
      console.error('Rejection failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              承認待ち
            </span>
            {approval.article.folder && (
              <span
                className="px-3 py-1 text-xs text-white rounded-full"
                style={{ backgroundColor: approval.article.folder.color || '#3B82F6' }}
              >
                {approval.article.folder.name}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">{approval.article.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            申請者: {approval.requested_by_user?.display_name} ({approval.requested_by_user?.department})
          </p>
          <p className="text-sm text-gray-500">
            申請日時: {new Date(approval.requested_at).toLocaleString('ja-JP')}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">記事内容プレビュー</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
            {approval.article.content}
          </p>
          {approval.article.tags && approval.article.tags.length > 0 && (
            <div className="flex gap-2 mt-3">
              {approval.article.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <Link
            href={`/articles/${approval.article.id}`}
            className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700"
            target="_blank"
          >
            全文を確認 →
          </Link>
        </div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-primary-600 hover:text-primary-700 mb-4"
      >
        {showDetails ? '詳細を閉じる ▲' : '詳細を表示 ▼'}
      </button>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          コメント（任意）
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="承認・却下の理由やフィードバックを入力..."
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? '処理中...' : '✓ 承認して公開'}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? '処理中...' : '✗ 却下'}
        </button>
      </div>
    </div>
  )
}
