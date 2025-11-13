'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchResults from './SearchResults'

interface SearchInterfaceProps {
  userId: string
  initialQuery?: string
  initialMode: 'keyword' | 'ai'
}

export default function SearchInterface({
  userId,
  initialQuery = '',
  initialMode,
}: SearchInterfaceProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [searchMode, setSearchMode] = useState<'keyword' | 'ai'>(initialMode)
  const [results, setResults] = useState<any[]>([])
  const [aiAnswer, setAiAnswer] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    setResults([])
    setAiAnswer('')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          mode: searchMode,
          userId,
        }),
      })

      const data = await response.json()

      if (data.results) {
        setResults(data.results)
      }

      if (data.aiAnswer) {
        setAiAnswer(data.aiAnswer)
      }

      // Log search
      router.push(`/search?q=${encodeURIComponent(query)}&mode=${searchMode}`)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      handleSearch({ preventDefault: () => {} } as any)
    }
  }, [])

  return (
    <div>
      {/* Search Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchMode"
                  value="keyword"
                  checked={searchMode === 'keyword'}
                  onChange={(e) => setSearchMode('keyword')}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm font-medium">🔍 キーワード検索</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchMode"
                  value="ai"
                  checked={searchMode === 'ai'}
                  onChange={(e) => setSearchMode('ai')}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm font-medium">🤖 AI自然言語検索</span>
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder={
                  searchMode === 'ai'
                    ? '例: 有給申請の方法を教えてください'
                    : '例: 有給申請'
                }
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? '検索中...' : '検索'}
              </button>
            </div>

            {searchMode === 'ai' && (
              <p className="mt-2 text-sm text-gray-600">
                💡 AI検索では、自然な質問文で検索できます。例えば「○○の方法を教えて」「××について知りたい」など
              </p>
            )}
          </div>
        </form>

        {/* Quick Search Suggestions */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">よく検索されるキーワード:</p>
          <div className="flex flex-wrap gap-2">
            {['有給申請', '経費精算', '勤怠管理', '議事録', '営業資料'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion)
                  setSearchMode('keyword')
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Answer */}
      {searchMode === 'ai' && aiAnswer && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AIの回答
          </h2>
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">{aiAnswer}</div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searched && (
        <SearchResults results={results} loading={loading} query={query} mode={searchMode} />
      )}
    </div>
  )
}
