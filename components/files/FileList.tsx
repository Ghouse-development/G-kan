'use client'

import { useEffect, useState } from 'react'

interface FileListProps {
  articleId?: string
}

interface FileItem {
  id: string
  file_name: string
  file_size: number
  file_type: string
  created_at: string
}

export default function FileList({ articleId }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [articleId])

  const fetchFiles = async () => {
    try {
      const url = articleId ? `/api/upload?articleId=${articleId}` : '/api/upload'
      const response = await fetch(url)
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
    if (fileType.includes('image')) return '🖼️'
    return '📎'
  }

  if (loading) {
    return <div className="text-sm text-gray-500">読み込み中...</div>
  }

  if (files.length === 0) {
    return <div className="text-sm text-gray-500">添付ファイルはありません</div>
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl">{getFileIcon(file.file_type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.file_name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
          <button className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700">
            ダウンロード
          </button>
        </div>
      ))}
    </div>
  )
}
