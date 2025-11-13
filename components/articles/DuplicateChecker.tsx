'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DuplicateCheckerProps {
  title: string
  content: string
}

export default function DuplicateChecker({ title, content }: DuplicateCheckerProps) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const checkDuplicate = async () => {
    if (!title && !content) return

    setChecking(true)
    try {
      const response = await fetch('/api/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Duplicate check failed:', error)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={checkDuplicate}
        disabled={checking || (!title && !content)}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {checking ? '🔍 チェック中...' : '🤖 AI重複チェック'}
      </button>

      {result && (
        <div
          className={`p-4 rounded-lg border-2 ${
            result.hasDuplicate
              ? 'bg-red-50 border-red-300'
              : result.similarArticles.length > 0
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-green-50 border-green-300'
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">
              {result.hasDuplicate ? '⚠️' : result.similarArticles.length > 0 ? '💡' : '✅'}
            </span>
            <div className="flex-1">
              <p className="font-semibold mb-1">
                {result.hasDuplicate
                  ? '重複の可能性があります'
                  : result.similarArticles.length > 0
                  ? '類似記事が見つかりました'
                  : '重複なし'}
              </p>
              <p className="text-sm">
                {result.message || '類似した記事は見つかりませんでした。'}
              </p>
            </div>
          </div>

          {result.similarArticles && result.similarArticles.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium">類似記事:</p>
              {result.similarArticles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  target="_blank"
                  className="block p-3 bg-white rounded border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{article.title}</p>
                      <p className="text-xs text-gray-500">
                        作成者: {article.author?.display_name}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {Math.round(article.similarity * 100)}% 類似
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
