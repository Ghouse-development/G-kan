import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface RecentArticlesProps {
  userId: string
}

export default async function RecentArticles({ userId }: RecentArticlesProps) {
  const supabase = await createServerClient()

  const { data: articles } = await supabase
    .from('articles')
    .select(
      `
      *,
      author:users!articles_author_id_fkey(display_name, avatar_url),
      folder:folders(name, color)
    `
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        まだ記事がありません。最初の記事を作成しましょう！
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {articles.map((article: any) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="block hover:bg-gray-50 transition-colors"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {article.is_pinned && <span className="text-red-500">📌</span>}
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {article.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {article.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>👤 {article.author?.display_name || '不明'}</span>
                    <span>📁 {article.folder?.name || '未分類'}</span>
                    <span>👁️ {article.view_count}</span>
                    <span>
                      📅{' '}
                      {new Date(article.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {article.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
