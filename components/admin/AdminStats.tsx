import { createServerClient } from '@/lib/supabase/server'

export default async function AdminStats() {
  const supabase = await createServerClient()

  // Fetch statistics
  const [
    { count: totalUsers },
    { count: totalArticles },
    { count: totalQuestions },
    { count: totalSearches },
    { data: recentSearches },
    { data: topArticles },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('search_logs').select('*', { count: 'exact', head: true }),
    supabase
      .from('search_logs')
      .select('query, search_type, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('articles')
      .select('id, title, view_count')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'ユーザー数', value: totalUsers || 0, icon: '👥', color: 'bg-blue-500' },
    { label: '記事数', value: totalArticles || 0, icon: '📝', color: 'bg-green-500' },
    { label: 'Q&A数', value: totalQuestions || 0, icon: '💬', color: 'bg-yellow-500' },
    { label: '検索回数', value: totalSearches || 0, icon: '🔍', color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">📊 システム統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-20 flex items-center justify-center text-2xl`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Searches */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">🔍 最近の検索</h3>
          {recentSearches && recentSearches.length > 0 ? (
            <div className="space-y-2">
              {recentSearches.map((search: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1">{search.query}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      search.search_type === 'ai'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {search.search_type === 'ai' ? 'AI' : 'キーワード'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">検索履歴がありません</p>
          )}
        </div>

        {/* Top Articles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">📈 人気記事トップ5</h3>
          {topArticles && topArticles.length > 0 ? (
            <div className="space-y-2">
              {topArticles.map((article: any, index: number) => (
                <div key={article.id} className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-gray-400 w-6">{index + 1}</span>
                  <span className="text-gray-700 truncate flex-1">{article.title}</span>
                  <span className="text-gray-500 whitespace-nowrap">
                    👁️ {article.view_count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">記事がありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
