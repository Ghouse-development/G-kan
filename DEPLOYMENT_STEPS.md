# G-kan デプロイ手順

## 前提条件
- Node.js 18以上
- npm または yarn
- Supabaseアカウント
- OpenAI APIキー

## ステップ1: リポジトリのクローン

```bash
git clone https://github.com/Ghouse-development/G-kan.git
cd G-kan
npm install
```

## ステップ2: Supabase設定

### 2-1. データベースマイグレーション

**方法A: Supabase CLI（推奨）**
```bash
# Supabase CLIインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref dtdtexkwbirnpqkwzzxl

# マイグレーション実行
supabase db push
```

**方法B: Supabaseダッシュボード**
1. https://supabase.com/dashboard にアクセス
2. プロジェクト選択: dtdtexkwbirnpqkwzzxl
3. SQL Editor → New query
4. `supabase/migrations/20250112000000_initial_schema.sql` の内容をコピー&ペースト → Run
5. `supabase/migrations/20250112000001_vector_search.sql` も同様に実行

### 2-2. pgvector拡張の有効化

1. Supabaseダッシュボード → Database → Extensions
2. `vector` を検索して有効化

### 2-3. Storageバケット作成

1. Supabaseダッシュボード → Storage → New bucket
2. 設定:
   - Name: `files`
   - Public bucket: ✅ チェック
3. Create bucket

### 2-4. Storage RLSポリシー設定

1. Storage → files バケット → Policies → New policy
2. ポリシー1（アップロード）:
   - Policy name: `Authenticated users can upload files`
   - Allowed operation: INSERT
   - Target roles: authenticated
   - Policy definition:
   ```sql
   ((bucket_id = 'files'::text) AND (auth.role() = 'authenticated'::text))
   ```

3. ポリシー2（閲覧）:
   - Policy name: `Public can view files`
   - Allowed operation: SELECT
   - Target roles: public
   - Policy definition:
   ```sql
   (bucket_id = 'files'::text)
   ```

4. SQL Editorで追加のRLSポリシー実行:
   - `supabase/storage-setup.sql` の内容を実行

## ステップ3: 環境変数設定

`.env.local` ファイルを編集:

```bash
# Supabase Configuration（すでに設定済み）
NEXT_PUBLIC_SUPABASE_URL=https://dtdtexkwbirnpqkwzzxl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PROJECT_ID=dtdtexkwbirnpqkwzzxl

# OpenAI Configuration（要設定）
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxx  # ←ここに実際のAPIキーを設定
```

OpenAI APIキーの取得:
1. https://platform.openai.com/api-keys にアクセス
2. Create new secret key
3. キーをコピーして `.env.local` に貼り付け

## ステップ4: ローカル起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## ステップ5: 初期管理者設定

1. `/signup` でアカウント作成
2. Supabase SQL Editorで以下を実行:

```sql
-- 自分のメールアドレスを管理者に設定
UPDATE public.users
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## ステップ6: 動作確認

以下の機能を順番にテスト:

- [ ] ログイン成功
- [ ] フォルダ作成
- [ ] 記事作成（タイトル・本文入力）
- [ ] ファイルアップロード（10MB以下）
- [ ] AI重複チェック（OpenAI接続確認）
- [ ] 記事を下書き保存
- [ ] 記事を公開
- [ ] 管理者メニューが表示される
- [ ] 承認待ち画面にアクセス
- [ ] キーワード検索
- [ ] AI検索（自然言語で質問）
- [ ] Q&A作成
- [ ] 通知ベルに通知表示
- [ ] 管理者ダッシュボード表示

## ステップ7: 本番デプロイ（Vercel推奨）

```bash
# Vercel CLIインストール
npm install -g vercel

# デプロイ
vercel

# 環境変数を設定
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_PROJECT_ID

# 再デプロイ
vercel --prod
```

## トラブルシューティング

### AI機能が動かない
- `.env.local` のOpenAI APIキーを確認
- OpenAIアカウントにクレジット残高があるか確認
- サーバーを再起動 (`npm run dev` を再実行)

### ファイルアップロードが失敗する
- Supabase Storageで `files` バケットが作成されているか確認
- バケットがPublicに設定されているか確認
- RLSポリシーが正しく設定されているか確認

### データベースエラーが出る
- マイグレーションが実行されているか確認
- Supabase SQL Editorでテーブルが存在するか確認
- RLSポリシーが有効になっているか確認

### pgvectorエラー
- Database → Extensions → `vector` が有効化されているか確認
- マイグレーション順序を確認（initial_schema → vector_search）

## サポート

問題が解決しない場合:
1. Supabaseダッシュボードのログを確認
2. ブラウザのコンソールエラーを確認
3. GitHubリポジトリのIssuesで質問
