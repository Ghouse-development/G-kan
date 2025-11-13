# G-kan 最速スタートガイド（コピペのみ）

このガイドは、**コピー&ペーストだけ**で完了できるように設計されています。

---

## 所要時間: 3分

1. pgvector有効化（30秒）
2. データベース作成（1分）
3. アカウント作成（1分）
4. ログイン（30秒）

---

## ステップ1: pgvector有効化（30秒）

### 1-1. 以下のURLを開く
```
https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/sql/new
```

### 1-2. 以下のSQLをコピーして貼り付け、"Run" をクリック
```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**確認**: 結果に `vector` が表示されればOK

---

## ステップ2: データベース作成（1分）

### 2-1. 同じSQL Editorで "New query" をクリック

### 2-2. ローカルファイルを開く
```
C:\claudecode\G-kan\supabase\ALL_IN_ONE_SETUP.sql
```

### 2-3. ファイル全体をコピー（Ctrl+A → Ctrl+C）

### 2-4. SQL Editorに貼り付け（Ctrl+V）、"Run" をクリック

### 2-5. 確認
新しいクエリで以下を実行：
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```

**期待値**: 14（14テーブルが作成されている）

---

## ステップ3: アカウント作成（1分）

### 3-1. Authentication画面を開く
```
https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/auth/users
```

### 3-2. "Add user" → "Create a new user" をクリック

### 3-3. 以下を入力
```
Email: admin@ghouse.co.jp
Password: Admin@2025
```

### 3-4. 重要！"Auto Confirm User" のチェックボックスをONにする

### 3-5. "Create user" をクリック

### 3-6. 作成されたユーザーをクリックして、UUIDをコピー
（例: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`）

### 3-7. SQL Editorに戻って、以下を実行（UUIDを書き換える）
```sql
-- ⚠️ 'YOUR_UUID_HERE' を実際のUUIDに置き換えてください
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
VALUES (
  'YOUR_UUID_HERE',
  'admin@ghouse.co.jp',
  'システム管理者',
  'admin',
  NOW(),
  NOW()
);

-- 確認
SELECT id, email, name, role FROM users;
```

---

## ステップ4: ログイン（30秒）

### 4-1. G-kanを開く
```
https://g-kan.vercel.app/login
```

### 4-2. 以下を入力
```
メールアドレス: admin@ghouse.co.jp
パスワード: Admin@2025
```

### 4-3. "ログイン" をクリック

**成功！** ダッシュボードが表示されます。

---

## オプション: Storage RLS設定（1分）

ファイルアップロード機能を使う場合のみ必要です。

### Storage Policies画面を開く
```
https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/storage/policies
```

### article-files バケットで "New policy" を3回実行

#### ポリシー1: 読み取り
```sql
Policy name: Authenticated users can read files
Allowed operation: SELECT
Target roles: authenticated

USING expression:
bucket_id = 'article-files'
```

#### ポリシー2: アップロード
```sql
Policy name: Authenticated users can upload files
Allowed operation: INSERT
Target roles: authenticated

WITH CHECK expression:
bucket_id = 'article-files'
```

#### ポリシー3: 削除
```sql
Policy name: Users can delete their own files
Allowed operation: DELETE
Target roles: authenticated

USING expression:
bucket_id = 'article-files' AND owner = auth.uid()
```

---

## トラブルシューティング

### エラー: type "vector" does not exist
→ ステップ1を実行してください

### エラー: relation "public.users" does not exist
→ ステップ2を実行してください

### エラー: Invalid login credentials
→ ステップ3でUUIDを正しく入力したか確認してください

---

## 完了チェックリスト

- [ ] pgvector拡張有効化
- [ ] 14テーブル作成完了
- [ ] 管理者アカウント作成
- [ ] ログイン成功
- [ ] ダッシュボード表示

---

**これで100点です！🎉**
