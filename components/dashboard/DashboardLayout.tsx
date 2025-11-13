'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/supabase'
import NotificationBell from '@/components/notifications/NotificationBell'

interface DashboardLayoutProps {
  children: ReactNode
  user: User | null
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: '📊' },
    { name: 'フォルダ', href: '/folders', icon: '📁' },
    { name: '記事一覧', href: '/articles', icon: '📝' },
    { name: 'Q&A', href: '/questions', icon: '💬' },
    { name: '検索', href: '/search', icon: '🔍' },
  ]

  const adminNavigation = user?.is_admin
    ? [
        { name: '承認待ち', href: '/approvals', icon: '✅' },
        { name: '設定', href: '/settings', icon: '⚙️' },
      ]
    : []

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                G-kan
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              )
            })}

            {adminNavigation.length > 0 && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {sidebarOpen && <span className="ml-3">{item.name}</span>}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            {sidebarOpen ? (
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {user?.display_name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.display_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.department || '未設定'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                title="ログアウト"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex-1 max-w-3xl">
            <div className="relative">
              <input
                type="text"
                placeholder="記事を検索..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onFocus={() => router.push('/search')}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <NotificationBell userId={user?.id || ''} />
            <Link
              href="/articles/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              + 新規作成
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
