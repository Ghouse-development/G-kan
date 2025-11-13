import { createServerClient } from '@/lib/supabase/server'

interface QuickStatsProps {
  userId: string
}

export default async function QuickStats({ userId }: QuickStatsProps) {
  const supabase = await createServerClient()

  // Fetch statistics
  const [
    { count: totalArticles },
    { count: myArticles },
    { count: totalFolders },
    { count: unreadNotifications },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('author_id', userId),
    supabase.from('folders').select('*', { count: 'exact', head: true }),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false),
  ])

  const stats = [
    {
      name: '公開記事',
      value: totalArticles || 0,
      icon: '📄',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      name: '自分の記事',
      value: myArticles || 0,
      icon: '✏️',
      color: 'bg-green-50 text-green-600',
    },
    {
      name: 'フォルダ数',
      value: totalFolders || 0,
      icon: '📁',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      name: '未読通知',
      value: unreadNotifications || 0,
      icon: '🔔',
      color: 'bg-red-50 text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
