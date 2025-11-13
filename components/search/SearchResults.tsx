import Link from 'next/link'

interface SearchResultsProps {
  results: any[]
  loading: boolean
  query: string
  mode: 'keyword' | 'ai'
}

export default function SearchResults({ results, loading, query, mode }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">検索中...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-xl text-gray-600 mb-2">検索結果が見つかりませんでした</p>
        <p className="text-sm text-gray-500">
          別のキーワードで検索するか、AI検索モードを試してみてください
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          検索結果: {results.length}件
          {mode === 'ai' && <span className="ml-2 text-sm text-gray-500">(関連度順)</span>}
        </h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {results.map((result: any) => (
          <Link
            key={result.id}
            href={`/articles/${result.id}`}
            className="block p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {result.is_pinned && <span className="text-red-500 text-xl">📌</span>}
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600">
                    {highlightText(result.title, query)}
                  </h3>
                  {mode === 'ai' && result.similarity_score && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      関連度: {Math.round(result.similarity_score * 100)}%
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {highlightText(result.content?.substring(0, 250) || '', query)}...
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    👤 {result.author?.display_name || '不明'}
                  </span>
                  {result.folder && (
                    <span
                      className="flex items-center gap-1 px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: result.folder.color || '#3B82F6' }}
                    >
                      {result.folder.icon} {result.folder.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">👁️ {result.view_count}</span>
                  <span className="flex items-center gap-1">
                    📅{' '}
                    {new Date(result.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {result.tags && result.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {result.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {result.matched_chunk && (
                  <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                    <p className="text-gray-700">
                      ...{highlightText(result.matched_chunk, query)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text

  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  )
}
