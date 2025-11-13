-- ================================================================
-- G-kan 一括セットアップSQL
-- ================================================================
-- このファイルをSupabase SQL Editorで実行すると、
-- データベースのセットアップが一度に完了します。
--
-- 実行手順:
-- 1. https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/sql/new
-- 2. このファイルの内容を全てコピー
-- 3. SQL Editorに貼り付け
-- 4. 「Run」ボタンをクリック
--
-- 注意: pgvector拡張は別途有効化が必要です
-- Database → Extensions → "vector" を有効化してください
-- ================================================================

-- ================================================================
-- 1. UUID拡張の有効化
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 2. テーブル作成
-- ================================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    department TEXT,
    position TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders table
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    author_id UUID NOT NULL REFERENCES public.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table (Q&A)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    author_id UUID NOT NULL REFERENCES public.users(id),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_best_answer BOOLEAN DEFAULT FALSE,
    author_id UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (article_id IS NOT NULL AND question_id IS NULL) OR
        (article_id IS NULL AND question_id IS NOT NULL)
    )
);

-- Reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'thanks')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_id, reaction_type),
    UNIQUE(user_id, question_id, reaction_type),
    UNIQUE(user_id, answer_id, reaction_type),
    CHECK (
        (article_id IS NOT NULL AND question_id IS NULL AND answer_id IS NULL) OR
        (article_id IS NULL AND question_id IS NOT NULL AND answer_id IS NULL) OR
        (article_id IS NULL AND question_id IS NULL AND answer_id IS NOT NULL)
    )
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search logs table
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    query TEXT NOT NULL,
    search_type TEXT CHECK (search_type IN ('keyword', 'ai')),
    result_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folder permissions table
CREATE TABLE IF NOT EXISTS public.folder_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department TEXT,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (user_id IS NOT NULL AND department IS NULL) OR
        (user_id IS NULL AND department IS NOT NULL)
    )
);

-- Approvals table
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.users(id),
    approver_id UUID NOT NULL REFERENCES public.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comment TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article embeddings table (for vector search)
CREATE TABLE IF NOT EXISTS public.article_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. インデックス作成
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_articles_folder_id ON public.articles(folder_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_question_id ON public.comments(question_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Vector search index
CREATE INDEX IF NOT EXISTS idx_article_embeddings_vector ON public.article_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ================================================================
-- 4. RLS (Row Level Security) ポリシー
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_embeddings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Folders policies
CREATE POLICY "Users can view all folders" ON public.folders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create folders" ON public.folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own folders" ON public.folders FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own folders" ON public.folders FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Articles policies
CREATE POLICY "Users can view published articles" ON public.articles FOR SELECT TO authenticated USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "Users can create articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own articles" ON public.articles FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own articles" ON public.articles FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Questions policies
CREATE POLICY "Users can view all questions" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own questions" ON public.questions FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own questions" ON public.questions FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Answers policies
CREATE POLICY "Users can view all answers" ON public.answers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create answers" ON public.answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own answers" ON public.answers FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own answers" ON public.answers FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Users can view all comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Reactions policies
CREATE POLICY "Users can view all reactions" ON public.reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own reactions" ON public.reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON public.reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Search logs policies
CREATE POLICY "Users can view own search logs" ON public.search_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create search logs" ON public.search_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Folder permissions policies
CREATE POLICY "Users can view folder permissions" ON public.folder_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Folder owners can manage permissions" ON public.folder_permissions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.folders WHERE id = folder_id AND created_by = auth.uid())
);

-- Approvals policies
CREATE POLICY "Users can view approvals" ON public.approvals FOR SELECT TO authenticated USING (
    auth.uid() = requester_id OR auth.uid() = approver_id
);
CREATE POLICY "Users can create approval requests" ON public.approvals FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Approvers can update approvals" ON public.approvals FOR UPDATE TO authenticated USING (auth.uid() = approver_id);

-- Files policies
CREATE POLICY "Users can view all files" ON public.files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload files" ON public.files FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete own files" ON public.files FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

-- Article embeddings policies
CREATE POLICY "Users can view article embeddings" ON public.article_embeddings FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage embeddings" ON public.article_embeddings FOR ALL TO authenticated USING (true);

-- ================================================================
-- 5. ベクトル検索関数（pgvector拡張が必要）
-- ================================================================
-- 注意: この関数はpgvector拡張が有効化されている必要があります
-- Database → Extensions → "vector" を有効化してください

CREATE OR REPLACE FUNCTION match_article_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  article_id uuid,
  content_chunk text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.article_id,
    ae.content_chunk,
    1 - (ae.embedding <=> query_embedding) as similarity
  FROM public.article_embeddings ae
  WHERE 1 - (ae.embedding <=> query_embedding) > match_threshold
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ================================================================
-- 完了！
-- ================================================================
-- セットアップが完了しました。
--
-- 次のステップ:
-- 1. Storage RLSポリシーの設定（QUICK_SETUP.mdを参照）
-- 2. OpenAI APIキーの設定（.env.local）
-- 3. npm run dev でアプリを起動
-- ================================================================
