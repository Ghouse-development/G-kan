import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface ArticleListProps {
  userId: string
  folderId?: string
  tag?: string
  sortBy?: string
}

export default async function ArticleList({ userId, folderId, tag, sortBy }: ArticleListProps) {
  const supabase = await createServerClient()

  let query = supabase
    .from('articles')
    .select(`
      *,
      author:users!articles_author_id_fkey(display_name, avatar_url),
      folder:folders(id, name, color, icon)
    `)
    .eq('status', 'published')

  // Apply filters
  if (folderId) {
    query = query.eq('folder_id', folderId)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  // Apply sorting
  switch (sortBy) {
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'updated':
      query = query.order('updated_at', { ascending: false })
      break
    case 'title':
      query = query.order('title', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: articles } = await query.limit(50)

  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        記事が見つかりませんでした
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      {articles.map((article: any) => (
        <Link
          key={article.id}
          href={`/articles/${article.id}`}
          className="block p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {article.is_pinned && <span className="text-red-500 text-xl">📌</span>}
                <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600">
                  {article.title}
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {article.content.substring(0, 200)}...
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  👤 {article.author?.display_name || '不明'}
                </span>
                <span
                  className="flex items-center gap-1 px-2 py-1 rounded text-white text-xs"
                  style={{ backgroundColor: article.folder?.color || '#3B82F6' }}
                >
                  {article.folder?.icon} {article.folder?.name || '未分類'}
                </span>
                <span className="flex items-center gap-1">👁️ {article.view_count}</span>
                <span className="flex items-center gap-1">
                  📅{' '}
                  {new Date(article.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {article.tags.map((tagItem: string) => (
                    <span
                      key={tagItem}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    >
                      #{tagItem}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
