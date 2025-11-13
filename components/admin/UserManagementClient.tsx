'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/supabase'

export default function UserManagementClient({ users }: { users: User[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setLoading(userId)
    try {
      const supabase = createClient()
      await (supabase as any)
        .from('users')
        .update({ is_admin: !currentIsAdmin })
        .eq('id', userId)

      router.refresh()
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ユーザー
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              部署
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              役職
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              登録日
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              権限
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                    {user.display_name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{user.department || '-'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{user.position || '-'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleAdmin(user.id, user.is_admin)}
                  disabled={loading === user.id}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    user.is_admin
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {loading === user.id
                    ? '処理中...'
                    : user.is_admin
                    ? '管理者'
                    : '一般ユーザー'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
