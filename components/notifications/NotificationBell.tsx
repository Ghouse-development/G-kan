'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/supabase'

interface NotificationBellProps {
  userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [userId])

  const fetchNotifications = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.length)
    }
  }

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    fetchNotifications()
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    fetchNotifications()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold">通知</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  すべて既読にする
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                新しい通知はありません
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.link_url) {
                        window.location.href = notification.link_url
                      }
                      setIsOpen(false)
                    }}
                  >
                    <p className="font-medium text-sm">{notification.title}</p>
                    {notification.content && (
                      <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
