# G-kan リカバリー・トラブルシューティングガイド

## 目次
1. [概要](#概要)
2. [よくあるエラーと解決方法](#よくあるエラーと解決方法)
3. [環境別トラブルシューティング](#環境別トラブルシューティング)
4. [データリカバリー手順](#データリカバリー手順)
5. [緊急時の対応](#緊急時の対応)
6. [バックアップとロールバック](#バックアップとロールバック)

---

## 概要

このガイドは、G-kanシステムで発生する可能性のあるエラーや問題に対する診断と解決方法をまとめたものです。

### 前提条件
- 管理者権限を持つアカウント
- Supabaseダッシュボードへのアクセス権
- Vercelダッシュボードへのアクセス権
- ローカル開発環境（必要に応じて）

---

## よくあるエラーと解決方法

### 1. Middleware Invocation Failed

#### 症状
```
MIDDLEWARE_INVOCATION_FAILED
A server error has occurred
```

#### 原因
- Vercel環境変数が未設定または不正
- Supabaseキーの期限切れ
- ミドルウェアコードのエラー

#### 診断方法
```bash
# 環境変数を確認
vercel env ls

# 期待される環境変数:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

#### 解決方法

**ステップ1**: 環境変数を再設定
```bash
# .env.localファイルから値を取得
cat .env.local

# Vercelに設定
echo "YOUR_SUPABASE_URL" > /tmp/env_value.txt
vercel env add NEXT_PUBLIC_SUPABASE_URL production < /tmp/env_value.txt
vercel env add NEXT_PUBLIC_SUPABASE_URL preview < /tmp/env_value.txt

echo "YOUR_ANON_KEY" > /tmp/env_value.txt
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < /tmp/env_value.txt
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview < /tmp/env_value.txt

echo "YOUR_SERVICE_ROLE_KEY" > /tmp/env_value.txt
vercel env add SUPABASE_SERVICE_ROLE_KEY production < /tmp/env_value.txt
vercel env add SUPABASE_SERVICE_ROLE_KEY preview < /tmp/env_value.txt
```

**ステップ2**: 再デプロイ
```bash
vercel --prod --yes
```

**ステップ3**: 動作確認
```bash
curl -I https://g-kan.vercel.app
# 期待: HTTP/1.1 200 OK
```

---

### 2. OpenAI API Key Error

#### 症状
```
Error: Missing credentials. Please pass an `apiKey`
Failed to collect page data for /api/check-duplicate
```

#### 原因
- OpenAI APIキーが未設定
- モジュールレベルでOpenAIクライアントが初期化されている（コードエラー）

#### 診断方法
```bash
# 環境変数確認
vercel env ls | grep OPENAI

# ローカルで確認
grep OPENAI_API_KEY .env.local
```

#### 解決方法

**方法1**: APIキーを設定（AI機能を使う場合）
```bash
echo "sk-proj-YOUR_KEY_HERE" > /tmp/env_value.txt
vercel env add OPENAI_API_KEY production < /tmp/env_value.txt
vercel env add OPENAI_API_KEY preview < /tmp/env_value.txt
vercel --prod --yes
```

**方法2**: AI機能を無効化（OpenAIなしで動作）
- OpenAI APIキーなしでも基本機能は動作します
- AI自然言語検索とAI重複チェックのみ使用不可

**コード修正が必要な場合**:
`lib/ai/openai.ts`を確認:
```typescript
// 正しい実装（遅延初期化）
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured.')
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// 間違った実装（モジュールレベル初期化）
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) // ❌
```

---

### 3. Database Connection Error

#### 症状
```
Error: Could not find the table "articles"
relation "public.articles" does not exist
```

#### 原因
- データベースマイグレーションが未実行
- テーブルが削除された
- RLSポリシーによるアクセス拒否

#### 診断方法
```sql
-- Supabase SQL Editorで実行
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- 期待される14テーブル:
-- users, departments, folders, articles, article_versions,
-- article_embeddings, article_views, questions, answers,
-- approvals, files, tags, article_tags, activities
```

#### 解決方法

**ステップ1**: マイグレーション実行
```bash
# Supabase CLIを使用
npx supabase db push

# または、Supabase Dashboardから手動実行:
# 1. https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/sql/new
# 2. supabase/ALL_IN_ONE_SETUP.sql の内容を貼り付け
# 3. Run をクリック
```

**ステップ2**: テーブル作成確認
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
-- 期待: 14
```

**ステップ3**: RLS確認
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- 全てrowsecurity = true であること
```

---

### 4. Authentication Error

#### 症状
```
Error: Invalid login credentials
Error: User already registered
```

#### 原因
- 不正なメール/パスワード
- Supabase認証設定の問題
- RLSポリシーによるユーザー作成制限

#### 診断方法
```sql
-- Supabase SQL Editorで実行
SELECT * FROM auth.users;
-- ユーザーが存在するか確認
```

#### 解決方法

**ケース1**: パスワードリセット
```bash
# Supabase Dashboard → Authentication → Users
# 該当ユーザーを選択 → "Send password reset email"
```

**ケース2**: 手動ユーザー作成
```sql
-- usersテーブルにレコード追加（authユーザー作成後）
INSERT INTO public.users (id, email, name, role, department_id)
VALUES (
  'AUTH_USER_UUID',
  'user@example.com',
  'ユーザー名',
  'member',
  NULL
);
```

**ケース3**: RLSポリシー修正
```sql
-- usersテーブルのINSERTポリシー確認
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 必要に応じてポリシー再作成
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
CREATE POLICY "Users can create their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);
```

---

### 5. File Upload Error

#### 症状
```
Error: Storage bucket not found
Error: Unauthorized file access
```

#### 原因
- Storageバケット未作成
- Storage RLSポリシー未設定
- ファイルサイズ制限超過

#### 診断方法
```bash
# Supabase Dashboard → Storage
# "article-files" バケットが存在するか確認
```

#### 解決方法

**ステップ1**: バケット作成
```bash
# Supabase Dashboard → Storage → New bucket
# Name: article-files
# Public: OFF
```

**ステップ2**: RLSポリシー設定
Supabase Dashboard → Storage → article-files → Policies

**ポリシー1**: SELECT (読み取り)
```sql
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'article-files');
```

**ポリシー2**: INSERT (アップロード)
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-files');
```

**ポリシー3**: DELETE (削除)
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article-files' AND
  owner = auth.uid()
);
```

**ステップ3**: ファイルサイズ制限確認
```javascript
// app/api/upload/route.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
```

---

### 6. TypeScript Build Error

#### 症状
```
Type error: No overload matches this call
Property 'xxx' does not exist on type 'never'
```

#### 原因
- Supabase型推論の不完全性
- Next.js 14との型互換性問題

#### 解決方法

**方法1**: 型アサーション使用（推奨）
```typescript
// エラー
const { data } = await supabase.from('articles').select()

// 修正
const { data } = await (supabase as any).from('articles').select()
```

**方法2**: 型定義再生成
```bash
npx supabase gen types typescript --project-id dtdtexkwbirnpqkwzzxl > types/supabase.ts
```

**方法3**: tsconfig.json調整
```json
{
  "compilerOptions": {
    "strict": false,  // 一時的に無効化
    "skipLibCheck": true
  }
}
```

---

### 7. Edge Runtime Warning

#### 症状
```
⚠ Supabase client is configured to use the Auth context, which is not available in Edge Runtime
```

#### 診断
- これは**警告**であり、エラーではありません
- アプリケーションは正常に動作します
- Supabaseと Vercel Edge Runtimeの既知の互換性問題

#### 対応
**対応不要**: この警告は無視しても問題ありません。

**説明**: Supabaseは一部のNode.js APIを使用していますが、Vercel Edge Runtimeはそれらをサポートしていません。ただし、実際のランタイムでは影響がないため、警告のみが表示されます。

---

### 8. Favicon 500 Error

#### 症状
```
Failed to load resource: the server responded with a status of 500 ()
/favicon.ico:1
```

#### 原因
- faviconファイルが存在しない

#### 解決方法
```bash
# app/icon.svg を作成（Next.js 14で自動変換）
# 既に作成済みの場合、以下で確認:
ls app/icon.svg

# なければ作成:
cat > app/icon.svg << 'EOF'
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#3B82F6"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-family="system-ui" font-size="18" font-weight="700">G</text>
</svg>
EOF

# 再デプロイ
git add app/icon.svg
git commit -m "fix: Add favicon"
git push
vercel --prod
```

---

## 環境別トラブルシューティング

### ローカル開発環境

#### 問題: npm run dev が起動しない

**診断**:
```bash
# Node.jsバージョン確認
node -v  # 推奨: v18以上

# 依存関係確認
npm list

# ポート確認
netstat -ano | findstr :3000
```

**解決**:
```bash
# 依存関係再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュクリア
rm -rf .next
npm run dev
```

#### 問題: 環境変数が読み込まれない

**診断**:
```bash
# .env.localファイル確認
cat .env.local

# ファイルが存在するか
ls -la | grep .env
```

**解決**:
```bash
# .env.localテンプレートから作成
cp .env.local.example .env.local

# または手動作成
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://dtdtexkwbirnpqkwzzxl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
OPENAI_API_KEY=YOUR_OPENAI_KEY
EOF

# サーバー再起動
npm run dev
```

---

### Vercel本番環境

#### 問題: デプロイは成功するがアプリが動作しない

**診断**:
```bash
# デプロイ状態確認
vercel inspect https://g-kan.vercel.app

# ログ確認
vercel logs https://g-kan.vercel.app --follow
```

**解決**:
```bash
# 環境変数を再確認
vercel env ls

# 不足している場合は追加
echo "VALUE" > /tmp/env_value.txt
vercel env add VAR_NAME production < /tmp/env_value.txt

# 強制再デプロイ
vercel --prod --force
```

#### 問題: ビルドは成功するが実行時エラー

**診断**:
```bash
# ビルドログ確認
vercel inspect DEPLOYMENT_URL

# Runtime logsを確認
# Vercel Dashboard → Deployments → 該当デプロイ → Runtime Logs
```

**解決**:
- Middlewareのエラーを確認
- Supabase接続を確認
- 環境変数の値を再確認（特にURL形式）

---

### Supabase環境

#### 問題: RLSポリシーでアクセス拒否

**診断**:
```sql
-- ポリシー確認
SELECT * FROM pg_policies WHERE tablename = 'articles';

-- 現在のユーザーID確認
SELECT auth.uid();

-- 実際にクエリを実行
SELECT * FROM articles WHERE id = 'SOME_ID';
```

**解決**:
```sql
-- RLS一時的に無効化（デバッグ用）
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- 問題を特定後、再有効化
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- ポリシー再作成
DROP POLICY IF EXISTS "policy_name" ON articles;
CREATE POLICY "policy_name"
ON articles FOR SELECT
TO authenticated
USING (true);  -- 必要に応じて条件を調整
```

#### 問題: pgvector拡張機能が見つからない

**診断**:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**解決**:
```sql
-- 拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- 確認
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## データリカバリー手順

### 1. データベース全体のバックアップ

#### 手動バックアップ
```bash
# Supabase Dashboardから:
# Settings → Database → Download backup

# またはpg_dumpを使用:
pg_dump -h db.dtdtexkwbirnpqkwzzxl.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_$(date +%Y%m%d).sql
```

#### 自動バックアップ設定
Supabaseは毎日自動バックアップを実行しています:
- **保存期間**: 7日間（Freeプラン）
- **場所**: Supabase Dashboard → Database → Backups

---

### 2. 特定テーブルのリストア

```sql
-- articlesテーブルの復元
BEGIN;

-- 既存データを一時テーブルに移動
CREATE TABLE articles_backup AS SELECT * FROM articles;

-- データを復元（バックアップSQLから）
-- ... INSERT文を実行 ...

-- 確認後コミット
COMMIT;

-- または問題があればロールバック
ROLLBACK;
```

---

### 3. ユーザーデータの復元

```sql
-- 特定ユーザーのデータを復元
INSERT INTO users (id, email, name, role, department_id)
VALUES (
  'user-uuid',
  'user@example.com',
  'ユーザー名',
  'member',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();
```

---

### 4. ファイルのリカバリー

```bash
# Supabase Storageから手動ダウンロード
# Dashboard → Storage → article-files → ファイルを選択 → Download

# または、APIを使用
curl -X GET \
  "https://dtdtexkwbirnpqkwzzxl.supabase.co/storage/v1/object/article-files/FILE_PATH" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -o downloaded_file
```

---

## 緊急時の対応

### システム全体がダウンした場合

#### ステップ1: 状態確認（3分）
```bash
# Vercelステータス
curl -I https://g-kan.vercel.app

# Supabaseステータス
curl -I https://dtdtexkwbirnpqkwzzxl.supabase.co

# 外部ステータスページ
# https://www.vercel-status.com
# https://status.supabase.com
```

#### ステップ2: エラーログ収集（5分）
```bash
# Vercelログ
vercel logs https://g-kan.vercel.app --output logs.txt

# Supabaseログ
# Dashboard → Logs → API / Database
```

#### ステップ3: 緊急修正（10分）
```bash
# 前回の正常なデプロイにロールバック
vercel rollback

# 確認
curl -I https://g-kan.vercel.app
```

#### ステップ4: 根本原因調査（30分）
- エラーログを分析
- 最近の変更を確認
- データベースの状態を確認

---

### データベースが応答しない場合

#### ステップ1: Supabase接続確認
```bash
# psqlで接続テスト
psql "postgresql://postgres:[PASSWORD]@db.dtdtexkwbirnpqkwzzxl.supabase.co:5432/postgres"
```

#### ステップ2: 接続数確認
```sql
SELECT count(*) FROM pg_stat_activity;

-- 上限に達している場合
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid <> pg_backend_pid()
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes';
```

#### ステップ3: Supabaseサポート連絡
- Email: support@supabase.io
- Dashboard → Support
- 緊急時: Twitterで @supabase にメンション

---

### 大量のエラーが発生している場合

#### 即座にロールバック
```bash
# 安全な前バージョンにロールバック
vercel rollback

# 前回のデプロイURLを使用
vercel alias set PREVIOUS_DEPLOYMENT_URL g-kan.vercel.app
```

#### Rate Limit対策
```typescript
// middleware.tsに追加
import { rateLimit } from '@/lib/rate-limit'

export async function middleware(req: NextRequest) {
  // Rate limiting
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await rateLimit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // 既存のmiddleware処理...
}
```

---

## バックアップとロールバック

### 定期バックアップスケジュール

#### 毎日（自動）
- Supabaseデータベース自動バックアップ
- Vercelデプロイ履歴（自動保存）

#### 毎週（推奨手動）
```bash
# データベース完全バックアップ
npx supabase db dump -f backups/db_$(date +%Y%m%d).sql

# Storageファイル一覧
# Dashboard → Storage → article-files → Export metadata
```

#### 毎月（推奨手動）
- 全Storageファイルのダウンロード
- .env設定のバックアップ
- ドキュメントのアーカイブ

---

### ロールバック手順

#### Git レベルのロールバック
```bash
# 前回のコミットに戻る
git log --oneline  # コミット履歴確認
git revert HEAD    # 最新コミットを取り消し

# または特定のコミットに戻る
git reset --hard COMMIT_HASH
git push --force origin master

# Vercel自動デプロイ
# （GitHubと連携している場合、自動的に再デプロイされる）
```

#### Vercel デプロイレベルのロールバック
```bash
# デプロイ履歴確認
vercel ls

# 特定のデプロイをプロモート
vercel promote DEPLOYMENT_URL

# または
vercel alias set PREVIOUS_DEPLOYMENT_URL g-kan.vercel.app
```

#### データベースレベルのロールバック
```sql
-- トランザクション使用（推奨）
BEGIN;

-- 変更操作...
UPDATE articles SET status = 'draft' WHERE id = '123';

-- 問題があれば
ROLLBACK;

-- 問題なければ
COMMIT;
```

```bash
# バックアップからの完全復元
psql "postgresql://..." < backups/db_20251113.sql
```

---

## 連絡先・サポート

### 内部サポート
- **開発者**: Claude Code
- **ドキュメント**: このリポジトリ内のMDファイル
- **GitHub Issues**: https://github.com/Ghouse-development/G-kan/issues

### 外部サポート
- **Vercel**: https://vercel.com/support
- **Supabase**: support@supabase.io
- **OpenAI**: https://help.openai.com

### 緊急連絡フロー
1. ローカルで問題を再現
2. エラーログを収集
3. トラブルシューティングガイド実行
4. GitHub Issueを作成
5. 必要に応じて外部サポートに連絡

---

## チェックリスト

### 日常運用チェックリスト
- [ ] Vercelデプロイステータス確認
- [ ] Supabase Database健全性確認
- [ ] エラーログ確認（Vercel + Supabase）
- [ ] Storage使用量確認
- [ ] ユーザーフィードバック確認

### 週次チェックリスト
- [ ] データベースバックアップ実行
- [ ] 環境変数の有効性確認
- [ ] セキュリティアップデート確認
- [ ] パフォーマンスメトリクス確認

### 月次チェックリスト
- [ ] 完全バックアップ実行
- [ ] ドキュメント更新
- [ ] 依存関係アップデート
- [ ] セキュリティ監査

---

## バージョン履歴

- **v1.0** (2025-11-13): 初版作成
- リカバリー手順追加予定
