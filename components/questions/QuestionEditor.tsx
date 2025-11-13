'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface QuestionEditorProps {
  userId: string
  question?: any
}

export default function QuestionEditor({ userId, question }: QuestionEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(question?.title || '')
  const [content, setContent] = useState(question?.content || '')
  const [tags, setTags] = useState<string[]>(question?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      if (question) {
        // Update existing question
        const { error: updateError } = await (supabase as any)
          .from('questions')
          .update({
            title,
            content,
            tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', question.id)

        if (updateError) throw updateError

        router.push(`/questions/${question.id}`)
      } else {
        // Create new question
        const { data, error: insertError } = await (supabase as any)
          .from('questions')
          .insert({
            title,
            content,
            tags,
            author_id: userId,
          })
          .select()
          .single()

        if (insertError) throw insertError

        router.push(`/questions/${data.id}`)
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || '質問の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {error && <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例: 有給申請の方法を教えてください"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            質問内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="質問内容を詳しく記載してください..."
            rows={10}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="タグを入力してEnter..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              追加
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm flex items-center gap-2"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? '保存中...' : question ? '更新' : '投稿'}
          </button>
        </div>
      </form>
    </div>
  )
}
