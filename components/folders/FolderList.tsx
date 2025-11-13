import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Folder } from '@/types/supabase'

interface FolderWithCounts extends Folder {
  article_count?: number
}

export default async function FolderList({ userId }: { userId: string }) {
  const supabase = await createServerClient()

  // Fetch folders the user has access to
  const { data: folders } = await supabase
    .from('folders')
    .select(`
      *,
      folder_permissions!inner(user_id, department, permission_type)
    `)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })

  // Get article counts for each folder
  const foldersWithCounts: FolderWithCounts[] = await Promise.all(
    (folders || []).map(async (folder: any) => {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('folder_id', folder.id)
        .eq('status', 'published')

      return {
        ...folder,
        article_count: count || 0,
      }
    })
  )

  if (!foldersWithCounts || foldersWithCounts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        フォルダがまだありません。最初のフォルダを作成しましょう！
      </div>
    )
  }

  // Organize folders into tree structure
  const rootFolders = foldersWithCounts.filter((f) => !f.parent_id)
  const childFoldersMap = new Map<string, FolderWithCounts[]>()

  foldersWithCounts.forEach((folder) => {
    if (folder.parent_id) {
      if (!childFoldersMap.has(folder.parent_id)) {
        childFoldersMap.set(folder.parent_id, [])
      }
      childFoldersMap.get(folder.parent_id)!.push(folder)
    }
  })

  const FolderCard = ({ folder, depth = 0 }: { folder: FolderWithCounts; depth?: number }) => {
    const childFolders = childFoldersMap.get(folder.id) || []

    return (
      <>
        <Link
          href={`/folders/${folder.id}`}
          className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {folder.icon && <span className="text-2xl">{folder.icon}</span>}
                <h3 className="text-xl font-semibold">{folder.name}</h3>
                <span
                  className="px-3 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: folder.color || '#3B82F6' }}
                >
                  {folder.article_count} 記事
                </span>
              </div>
              {folder.description && (
                <p className="text-gray-600 text-sm">{folder.description}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(folder.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
        </Link>

        {childFolders.map((child) => (
          <FolderCard key={child.id} folder={child} depth={depth + 1} />
        ))}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {rootFolders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} />
      ))}
    </div>
  )
}
