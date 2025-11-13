# G-kan 完全セットアップ手順（100点達成）

## 所要時間: 5分

このガイドに従えば、G-kanを完全に動作させることができます。

---

## 前提条件

- Supabaseダッシュボードへのアクセス権
- プロジェクトID: `dtdtexkwbirnpqkwzzxl`

---

## ステップ1: pgvector拡張機能を有効化（30秒）

### 1.1 SQL Editorを開く
https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/sql/new

### 1.2 以下のSQLを実行
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 1.3 確認
実行後、結果に `vector` 拡張が表示されればOK

---

## ステップ2: データベースマイグレーション実行（2分）

### 2.1 SQL Editorで新しいクエリを開く
https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/sql/new

### 2.2 ファイルを開く
ローカルの `C:\claudecode\G-kan\supabase\ALL_IN_ONE_SETUP.sql` を開く

### 2.3 内容をコピー
ファイル全体の内容をコピー（約500行）

### 2.4 SQL Editorに貼り付けて実行
1. SQL Editorに貼り付け
2. "Run" ボタンをクリック
3. 成功メッセージを確認

### 2.5 確認
```sql
-- テーブル数を確認
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- 結果: 14 が返ればOK
```

---

## ステップ3: Storage バケット作成（1分）

### 3.1 Storageページを開く
https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/storage/buckets

### 3.2 バケット確認
`article-files` バケットが存在するか確認

### 3.3 存在しない場合は作成
1. "New bucket" をクリック
2. Name: `article-files`
3. Public: OFF（チェックなし）
4. "Create bucket" をクリック

---

## ステップ4: Storage RLSポリシー設定（1分）

### 4.1 Policiesページを開く
https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/storage/policies

### 4.2 article-files バケットを選択
左側のリストから `article-files` を選択

### 4.3 以下の3つのポリシーを追加

#### ポリシー1: 読み取り（SELECT）
1. "New policy" をクリック
2. "For full customization" を選択
3. 以下の内容を入力：

```sql
Policy name: Authenticated users can read files
Allowed operation: SELECT
Target roles: authenticated

USING expression:
bucket_id = 'article-files'
```

#### ポリシー2: アップロード（INSERT）
1. "New policy" をクリック
2. "For full customization" を選択
3. 以下の内容を入力：

```sql
Policy name: Authenticated users can upload files
Allowed operation: INSERT
Target roles: authenticated

WITH CHECK expression:
bucket_id = 'article-files'
```

#### ポリシー3: 削除（DELETE）
1. "New policy" をクリック
2. "For full customization" を選択
3. 以下の内容を入力：

```sql
Policy name: Users can delete their own files
Allowed operation: DELETE
Target roles: authenticated

USING expression:
bucket_id = 'article-files' AND owner = auth.uid()
```

---

## ステップ5: 初期管理者ユーザー作成（30秒）

### 5.1 アプリケーションから新規登録
https://g-kan.vercel.app/signup

### 5.2 管理者アカウント情報を入力
```
メールアドレス: admin@ghouse.co.jp
パスワード: Admin@2025
名前: システム管理者
```

### 5.3 ユーザーを管理者に昇格
SQL Editorで以下を実行：

```sql
-- 登録したユーザーのIDを確認
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- 上記で取得したIDを使って管理者に昇格
UPDATE users
SET role = 'admin'
WHERE email = 'admin@ghouse.co.jp';

-- 確認
SELECT id, email, name, role FROM users WHERE email = 'admin@ghouse.co.jp';
```

---

## ステップ6: 動作確認（30秒）

### 6.1 ログイン
https://g-kan.vercel.app/login

```
メールアドレス: admin@ghouse.co.jp
パスワード: Admin@2025
```

### 6.2 ダッシュボードアクセス
ログイン後、ダッシュボードが表示されることを確認

### 6.3 機能テスト
1. 記事作成ページにアクセス
2. テスト記事を作成
3. 検索機能をテスト

---

## ✅ 完了チェックリスト

- [ ] pgvector拡張機能有効化
- [ ] データベースマイグレーション実行（14テーブル作成）
- [ ] Storageバケット作成（article-files）
- [ ] Storage RLSポリシー設定（3つ）
- [ ] 管理者ユーザー作成
- [ ] ログイン動作確認
- [ ] 記事作成動作確認

---

## トラブルシューティング

### エラー: type "vector" does not exist
**原因**: pgvector拡張機能が有効化されていない
**解決**: ステップ1を実行

### エラー: relation "public.articles" does not exist
**原因**: データベースマイグレーションが未実行
**解決**: ステップ2を実行

### エラー: Storage bucket not found
**原因**: article-filesバケットが作成されていない
**解決**: ステップ3を実行

### エラー: 新規登録時に "Failed to create user profile"
**原因**: usersテーブルのRLSポリシーまたはトリガーの問題
**解決**:
```sql
-- RLSポリシーを確認
SELECT * FROM pg_policies WHERE tablename = 'users';

-- トリガーを確認
SELECT * FROM pg_trigger WHERE tgname LIKE '%user%';
```

---

## 補足情報

### デフォルトアカウント一覧

セットアップ後、以下のアカウントが使用可能：

| メール | パスワード | 役割 | 説明 |
|--------|-----------|------|------|
| admin@ghouse.co.jp | Admin@2025 | admin | システム管理者 |

**追加ユーザー**: `/signup` から新規登録可能

### Storage使用量
- **無料枠**: 1GB
- **推奨**: 本番運用時は Pro プランへアップグレード

### OpenAI設定（オプション）
AI機能を使用する場合：

```bash
# Vercel環境変数に追加
echo "sk-proj-YOUR_OPENAI_KEY" > /tmp/env_value.txt
vercel env add OPENAI_API_KEY production < /tmp/env_value.txt
vercel env add OPENAI_API_KEY preview < /tmp/env_value.txt

# 再デプロイ
vercel --prod
```

---

## サポート

問題が発生した場合：
1. `RECOVERY_GUIDE.md` を参照
2. `REQUIREMENTS.md` の「重要事項」を確認
3. GitHub Issuesで質問

---

**作成日**: 2025-11-13
**最終更新**: 2025-11-13
**バージョン**: 1.0
