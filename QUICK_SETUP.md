# G-kan クイックセットアップガイド

このガイドに従えば、**10分以内**にG-kanを動作させることができます。

## ✅ 自動で完了していること

- ✅ Storageバケット `files` 作成済み

## 📋 手動で必要な設定（3ステップ）

### ステップ1: pgvector拡張を有効化（1分）

1. Supabaseダッシュボードを開く: https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl
2. 左メニュー → **Database** → **Extensions**
3. 検索ボックスに「vector」と入力
4. `vector` の右側にある **Enable** をクリック

### ステップ2: データベースマイグレーション実行（3分）

#### 2-1. 初期スキーマ実行

1. Supabaseダッシュボード → **SQL Editor** → **New query**
2. 以下のファイルの内容をコピー:
   ```
   C:\claudecode\G-kan\supabase\migrations\20250112000000_initial_schema.sql
   ```
3. SQL Editorに貼り付け
4. **Run** ボタンをクリック
5. 成功メッセージを確認

#### 2-2. ベクトル検索機能追加

1. SQL Editor → **New query**（新しいクエリを作成）
2. 以下のファイルの内容をコピー:
   ```
   C:\claudecode\G-kan\supabase\migrations\20250112000001_vector_search.sql
   ```
3. SQL Editorに貼り付け
4. **Run** ボタンをクリック
5. 成功メッセージを確認

### ステップ3: Storage RLSポリシー設定（2分）

1. Supabaseダッシュボード → **Storage** → **files** バケット
2. **Policies** タブをクリック
3. **New policy** → **For full customization** を選択
4. 以下の2つのポリシーを作成:

#### ポリシー1: ファイルアップロード

- Policy name: `Authenticated users can upload files`
- Allowed operation: **INSERT**
- Target roles: **authenticated**
- USING expression:
  ```sql
  (bucket_id = 'files'::text)
  ```
- WITH CHECK expression:
  ```sql
  (bucket_id = 'files'::text)
  ```

#### ポリシー2: ファイル閲覧

- Policy name: `Anyone can view files`
- Allowed operation: **SELECT**
- Target roles: **public**
- USING expression:
  ```sql
  (bucket_id = 'files'::text)
  ```

## 🚀 起動確認

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## ✨ 完了！

以下の機能がすぐに使えます:

- ✅ ユーザー登録・ログイン
- ✅ フォルダ管理
- ✅ 記事作成・編集
- ✅ **ファイルアップロード**（設定完了！）
- ✅ キーワード検索
- ✅ Q&A機能
- ✅ コメント・リアクション
- ⚠️ AI検索（OpenAI APIキー必要）
- ⚠️ AI重複チェック（OpenAI APIキー必要）

## 🔑 OpenAI機能を有効化（オプション）

AI検索とAI重複チェックを使いたい場合:

1. OpenAI APIキーを取得: https://platform.openai.com/api-keys
2. `.env.local` を編集:
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxx
   ```
3. サーバーを再起動: `npm run dev`

## 📊 初回ログイン後

1. `/signup` でアカウント作成
2. Supabase SQL Editorで以下を実行し、自分を管理者に設定:

```sql
UPDATE public.users
SET is_admin = true
WHERE email = 'your-email@example.com';
```

3. ログアウトして再ログインすると、管理者メニューが表示されます

## ❓ トラブルシューティング

### エラー: "relation public.users does not exist"
→ ステップ2のマイグレーションが未実行です。SQL Editorで実行してください。

### エラー: "function match_article_embeddings does not exist"
→ ステップ1のpgvector拡張が未有効、またはステップ2-2が未実行です。

### ファイルアップロードできない
→ ステップ3のStorage RLSポリシーを設定してください。

### AI検索が動かない
→ OpenAI APIキーを`.env.local`に設定してサーバーを再起動してください。

## 📚 詳細情報

- 完全な手順: [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)
- チェックリスト: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- プロジェクト概要: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
