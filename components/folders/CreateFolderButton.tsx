'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreateFolderButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📁')
  const [color, setColor] = useState('#3B82F6')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('ログインしてください')

      const { error: insertError } = await (supabase as any).from('folders').insert({
        name,
        description,
        icon,
        color,
        created_by: user.id,
      })

      if (insertError) throw insertError

      setIsOpen(false)
      setName('')
      setDescription('')
      setIcon('📁')
      setColor('#3B82F6')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'フォルダの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const iconOptions = ['📁', '📂', '📊', '💼', '🏢', '⚙️', '📝', '📋', '📌', '🔖']
  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-narekan-accent"
      >
        ＋ 新規フォルダ
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">新規フォルダ作成</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">フォルダ名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="営業部"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">説明（任意）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="営業部の資料や議事録"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">アイコン</label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-50 ${
                        icon === i ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">色</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-10 rounded-lg border-2 ${
                        color === c ? 'border-gray-800' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border-3 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  style={{ borderWidth: '3px' }}
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-narekan-primary flex-1 disabled:opacity-50"
                >
                  {loading ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
