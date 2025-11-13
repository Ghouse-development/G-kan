-- G-kan Knowledge Management System - Initial Database Schema
-- 初期データベーススキーマ

-- Enable necessary extensions
-- 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (ユーザーテーブル)
-- Extends Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    department TEXT,
    position TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    notification_settings JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders table (フォルダテーブル)
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folder permissions table (フォルダ権限テーブル)
CREATE TABLE IF NOT EXISTS public.folder_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department TEXT,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'edit', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_or_department CHECK (
        (user_id IS NOT NULL AND department IS NULL) OR
        (user_id IS NULL AND department IS NOT NULL)
    )
);

-- Articles table (記事テーブル)
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'html', 'plain')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Article embeddings table (記事埋め込みベクトルテーブル)
-- For AI semantic search
CREATE TABLE IF NOT EXISTS public.article_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI ada-002 dimension
    content_chunk TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, chunk_index)
);

-- Article history table (記事履歴テーブル)
CREATE TABLE IF NOT EXISTS public.article_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    edited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    change_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table (ファイルテーブル)
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    ocr_text TEXT, -- For image OCR
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table (質問テーブル)
-- Q&A feature
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table (回答テーブル)
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_best_answer BOOLEAN DEFAULT FALSE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table (リアクションテーブル)
-- Likes, helpful marks, etc.
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL CHECK (target_type IN ('article', 'question', 'answer', 'comment')),
    target_id UUID NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'thanks', 'star')),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(target_type, target_id, reaction_type, user_id)
);

-- Comments table (コメントテーブル)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL CHECK (target_type IN ('article', 'question', 'answer')),
    target_id UUID NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search logs table (検索ログテーブル)
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    search_type TEXT NOT NULL CHECK (search_type IN ('keyword', 'ai', 'filter')),
    results_count INTEGER,
    clicked_result_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access logs table (アクセスログテーブル)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('article', 'folder', 'file', 'question')),
    resource_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('view', 'create', 'edit', 'delete', 'download')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team dictionary table (チーム辞書テーブル)
-- For search synonym management
CREATE TABLE IF NOT EXISTS public.team_dictionary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term TEXT NOT NULL,
    synonyms TEXT[] NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals table (承認テーブル)
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comment TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Notifications table (通知テーブル)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('mention', 'reaction', 'comment', 'approval', 'new_article')),
    title TEXT NOT NULL,
    content TEXT,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
-- パフォーマンス向上のためのインデックス

CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_created_by ON public.folders(created_by);

CREATE INDEX IF NOT EXISTS idx_folder_permissions_folder_id ON public.folder_permissions(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_permissions_user_id ON public.folder_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_folder_permissions_department ON public.folder_permissions(department);

CREATE INDEX IF NOT EXISTS idx_articles_folder_id ON public.articles(folder_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_article_embeddings_article_id ON public.article_embeddings(article_id);
-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_article_embeddings_vector ON public.article_embeddings USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_article_history_article_id ON public.article_history(article_id);

CREATE INDEX IF NOT EXISTS idx_files_article_id ON public.files(article_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON public.files(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON public.answers(author_id);

CREATE INDEX IF NOT EXISTS idx_reactions_target ON public.reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_target ON public.comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);

CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON public.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_resource ON public.access_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_approvals_article_id ON public.approvals(article_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver_id ON public.approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- Create updated_at trigger function
-- updated_atカラムを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
-- updated_atトリガーの適用
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_dictionary_updated_at BEFORE UPDATE ON public.team_dictionary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- 行レベルセキュリティポリシー

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Folders policies
CREATE POLICY "Users can view folders they have access to" ON public.folders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.folder_permissions fp
            WHERE fp.folder_id = id
            AND (fp.user_id = auth.uid() OR fp.department IN (
                SELECT department FROM public.users WHERE id = auth.uid()
            ))
        ) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Users can create folders if they have admin permission" ON public.folders
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Users can update folders they have admin permission for" ON public.folders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.folder_permissions fp
            WHERE fp.folder_id = id
            AND fp.user_id = auth.uid()
            AND fp.permission_type = 'admin'
        ) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

-- Articles policies
CREATE POLICY "Users can view published articles in accessible folders" ON public.articles
    FOR SELECT USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM public.folder_permissions fp
            WHERE fp.folder_id = folder_id
            AND (fp.user_id = auth.uid() OR fp.department IN (
                SELECT department FROM public.users WHERE id = auth.uid()
            ))
        )
    );

CREATE POLICY "Users can create articles in folders they have edit permission for" ON public.articles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.folder_permissions fp
            WHERE fp.folder_id = folder_id
            AND fp.user_id = auth.uid()
            AND fp.permission_type IN ('edit', 'admin')
        ) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Authors and admins can update their articles" ON public.articles
    FOR UPDATE USING (
        author_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Questions policies
CREATE POLICY "All users can view questions" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON public.questions
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their questions" ON public.questions
    FOR UPDATE USING (author_id = auth.uid());

-- Answers policies
CREATE POLICY "All users can view answers" ON public.answers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON public.answers
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their answers" ON public.answers
    FOR UPDATE USING (author_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Reactions policies
CREATE POLICY "Users can view reactions" ON public.reactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own reactions" ON public.reactions
    FOR ALL USING (user_id = auth.uid());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
