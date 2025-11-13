'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function ArticleFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'created'

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`/articles?${params.toString()}`)
  }

  const sortOptions = [
    { value: 'created', label: '新着順' },
    { value: 'updated', label: '更新順' },
    { value: 'popular', label: '人気順' },
    { value: 'title', label: 'タイトル順' },
  ]

  return (
    <div className="mb-6 flex items-center gap-4">
      <label className="text-sm font-medium text-gray-700">並び順:</label>
      <div className="flex gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              currentSort === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
