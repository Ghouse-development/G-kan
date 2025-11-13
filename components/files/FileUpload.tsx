'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface FileUploadProps {
  articleId?: string
  onUploadComplete?: (file: any) => void
}

export default function FileUpload({ articleId, onUploadComplete }: FileUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (articleId) {
        formData.append('articleId', articleId)
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      if (onUploadComplete) {
        onUploadComplete(data.file)
      }

      // Reset
      setTimeout(() => {
        setProgress(0)
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'アップロードに失敗しました')
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'アップロード中...' : '📎 ファイルを選択'}
        </label>
        <span className="text-sm text-gray-600">
          対応形式: PDF, Word, Excel, PowerPoint, 画像 (最大10MB)
        </span>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">{progress}% 完了</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>
      )}
    </div>
  )
}
