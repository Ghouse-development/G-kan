'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/supabase'

interface NotificationSettingsProps {
  user: User | null
}

export default function NotificationSettings({ user }: NotificationSettingsProps) {
  const router = useRouter()
  const settings = (user?.notification_settings as any) || { email: true, in_app: true }
  const [emailNotifications, setEmailNotifications] = useState(settings.email !== false)
  const [inAppNotifications, setInAppNotifications] = useState(settings.in_app !== false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('users')
        .update({
          notification_settings: {
            email: emailNotifications,
            in_app: inAppNotifications,
          },
        })
        .eq('id', user?.id)

      if (error) throw error

      setMessage({ type: 'success', text: '通知設定を更新しました' })
      router.refresh()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '更新に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold mb-6">通知設定</h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium">メール通知</p>
              <p className="text-sm text-gray-600">新しいコメントやリアクションをメールで受け取る</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium">アプリ内通知</p>
              <p className="text-sm text-gray-600">システム内で通知を表示する</p>
            </div>
            <input
              type="checkbox"
              checked={inAppNotifications}
              onChange={(e) => setInAppNotifications(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
