-- Supabase Storage設定
-- Supabaseダッシュボードで実行するか、CLIで適用してください

-- 1. Storageバケット作成（ダッシュボードで実行推奨）
-- Storage → New bucket → Name: files → Public: Yes

-- 2. ファイルテーブル用のRLSポリシー
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- ファイルの閲覧（全ユーザー）
CREATE POLICY "Users can view all files"
ON public.files FOR SELECT
TO authenticated
USING (true);

-- ファイルのアップロード（認証済みユーザー）
CREATE POLICY "Users can upload files"
ON public.files FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- 自分がアップロードしたファイルの削除
CREATE POLICY "Users can delete own files"
ON public.files FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- 3. Storage Bucket用のRLSポリシー
-- 注意: これはStorage UIで設定する必要があります
--
-- Bucket: files
-- ポリシー名: "Authenticated users can upload files"
-- 許可操作: INSERT
-- 対象: authenticated
-- ポリシー定義:
-- ((bucket_id = 'files'::text) AND (auth.role() = 'authenticated'::text))
--
-- ポリシー名: "Public can view files"
-- 許可操作: SELECT
-- 対象: public
-- ポリシー定義:
-- (bucket_id = 'files'::text)
