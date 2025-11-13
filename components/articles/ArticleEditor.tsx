'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Folder {
  id: string
  name: string
  icon: string | null
  color: string | null
}

interface ArticleEditorProps {
  folders: Folder[]
  userId: string
  article?: any
}

export default function ArticleEditor({ folders, userId, article }: ArticleEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(article?.title || '')
  const [content, setContent] = useState(article?.content || '')
  const [folderId, setFolderId] = useState(article?.folder_id || '')
  const [tags, setTags] = useState<string[]>(article?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>(article?.status || 'draft')
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

      if (article) {
        // Update existing article
        const { error: updateError } = await (supabase as any)
          .from('articles')
          .update({
            title,
            content,
            folder_id: folderId,
            tags,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', article.id)

        if (updateError) throw updateError

        router.push(`/articles/${article.id}`)
      } else {
        // Create new article
        const { data, error: insertError } = await (supabase as any)
          .from('articles')
          .insert({
            title,
            content,
            folder_id: folderId,
            tags,
            status,
            author_id: userId,
            published_at: status === 'published' ? new Date().toISOString() : null,
          })
          .select()
          .single()

        if (insertError) throw insertError

        router.push(`/articles/${data.id}`)
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || '記事の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>
      )}

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
            placeholder="記事のタイトルを入力..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            フォルダ <span className="text-red-500">*</span>
          </label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">フォルダを選択...</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.icon} {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            本文 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
            placeholder="記事の内容を入力...&#10;&#10;Markdown記法が使えます。"
            rows={20}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Markdown記法が使えます。**太字**、*斜体*、`コード`、[リンク](URL) など
          </p>
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

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === 'draft'}
                onChange={(e) => setStatus('draft')}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm">下書き保存</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === 'published'}
                onChange={(e) => setStatus('published')}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm">公開</span>
            </label>
          </div>

          <div className="flex gap-3">
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
              {loading ? '保存中...' : article ? '更新' : '作成'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
