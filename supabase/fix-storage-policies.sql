-- Fix Storage Policies (エラー回避版)

-- 既存のポリシーを削除（エラーが出ても続行）
DROP POLICY IF EXISTS "Users can view all files" ON files;
DROP POLICY IF EXISTS "Users can upload files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;

-- filesテーブルのポリシーを再作成
-- 1. 読み取り（全員が閲覧可能）
CREATE POLICY "Users can view all files"
ON files FOR SELECT
TO authenticated
USING (true);

-- 2. アップロード（認証済みユーザー）
CREATE POLICY "Users can upload files"
ON files FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- 3. 更新（自分がアップロードしたファイルのみ）
CREATE POLICY "Users can update their own files"
ON files FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by)
WITH CHECK (auth.uid() = uploaded_by);

-- 4. 削除（自分がアップロードしたファイルのみ）
CREATE POLICY "Users can delete their own files"
ON files FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Supabase Storageのポリシー（article-filesバケット）
-- 注意: これはSupabase Dashboardから手動で設定する必要があります
-- storage.objects テーブルに対するポリシー

-- 1. 読み取り
CREATE POLICY IF NOT EXISTS "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'article-files');

-- 2. アップロード
CREATE POLICY IF NOT EXISTS "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-files');

-- 3. 削除
CREATE POLICY IF NOT EXISTS "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-files' AND owner = auth.uid());

-- 確認
SELECT
    tablename,
    policyname,
    cmd AS operation
FROM pg_policies
WHERE tablename IN ('files')
ORDER BY tablename, policyname;
