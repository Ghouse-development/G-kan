import { createServerClient } from '@/lib/supabase/server'
import UserManagementClient from './UserManagementClient'

export default async function UserManagement() {
  const supabase = await createServerClient()

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold mb-4">👥 ユーザー管理</h2>
      <UserManagementClient users={users || []} />
    </div>
  )
}
