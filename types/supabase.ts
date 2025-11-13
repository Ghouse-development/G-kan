export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          department: string | null
          position: string | null
          is_admin: boolean
          notification_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          avatar_url?: string | null
          department?: string | null
          position?: string | null
          is_admin?: boolean
          notification_settings?: Json
        }
        Update: {
          display_name?: string
          avatar_url?: string | null
          department?: string | null
          position?: string | null
          notification_settings?: Json
        }
      }
      folders: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          icon: string | null
          color: string | null
          sort_order: number
          is_archived: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          parent_id?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          parent_id?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_archived?: boolean
        }
      }
      articles: {
        Row: {
          id: string
          folder_id: string
          title: string
          content: string
          content_type: 'markdown' | 'html' | 'plain'
          status: 'draft' | 'published' | 'archived'
          tags: string[]
          version: number
          view_count: number
          is_pinned: boolean
          requires_approval: boolean
          approved_by: string | null
          approved_at: string | null
          author_id: string
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          folder_id: string
          title: string
          content: string
          content_type?: 'markdown' | 'html' | 'plain'
          status?: 'draft' | 'published' | 'archived'
          tags?: string[]
          author_id: string
        }
        Update: {
          title?: string
          content?: string
          content_type?: 'markdown' | 'html' | 'plain'
          status?: 'draft' | 'published' | 'archived'
          tags?: string[]
          is_pinned?: boolean
        }
      }
      questions: {
        Row: {
          id: string
          title: string
          content: string
          status: 'open' | 'resolved' | 'closed'
          tags: string[]
          view_count: number
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          content: string
          author_id: string
          tags?: string[]
        }
        Update: {
          title?: string
          content?: string
          status?: 'open' | 'resolved' | 'closed'
          tags?: string[]
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          content: string
          is_best_answer: boolean
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          question_id: string
          content: string
          author_id: string
        }
        Update: {
          content?: string
          is_best_answer?: boolean
        }
      }
      reactions: {
        Row: {
          id: string
          target_type: 'article' | 'question' | 'answer' | 'comment'
          target_id: string
          reaction_type: 'like' | 'helpful' | 'thanks' | 'star'
          user_id: string
          created_at: string
        }
        Insert: {
          target_type: 'article' | 'question' | 'answer' | 'comment'
          target_id: string
          reaction_type: 'like' | 'helpful' | 'thanks' | 'star'
          user_id: string
        }
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'mention' | 'reaction' | 'comment' | 'approval' | 'new_article'
          title: string
          content: string | null
          link_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          type: 'mention' | 'reaction' | 'comment' | 'approval' | 'new_article'
          title: string
          content?: string | null
          link_url?: string | null
        }
        Update: {
          is_read?: boolean
        }
      }
      search_logs: {
        Row: {
          id: string
          user_id: string | null
          query: string
          search_type: 'keyword' | 'ai' | 'filter'
          results_count: number | null
          clicked_result_id: string | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          query: string
          search_type: 'keyword' | 'ai' | 'filter'
          results_count?: number | null
          clicked_result_id?: string | null
        }
        Update: {
          results_count?: number | null
          clicked_result_id?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          target_type: 'article' | 'question' | 'answer'
          target_id: string
          content: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          target_type: 'article' | 'question' | 'answer'
          target_id: string
          content: string
          author_id: string
        }
        Update: {
          content?: string
        }
      }
      files: {
        Row: {
          id: string
          article_id: string | null
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          thumbnail_path: string | null
          ocr_text: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          article_id?: string | null
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          thumbnail_path?: string | null
          ocr_text?: string | null
          uploaded_by: string
        }
        Update: {
          article_id?: string | null
          file_name?: string
        }
      }
      folder_permissions: {
        Row: {
          id: string
          folder_id: string
          user_id: string | null
          department: string | null
          permission_type: 'view' | 'edit' | 'admin'
          created_at: string
        }
        Insert: {
          folder_id: string
          user_id?: string | null
          department?: string | null
          permission_type: 'view' | 'edit' | 'admin'
        }
        Update: {
          permission_type?: 'view' | 'edit' | 'admin'
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Folder = Database['public']['Tables']['folders']['Row']
export type Article = Database['public']['Tables']['articles']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Answer = Database['public']['Tables']['answers']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
