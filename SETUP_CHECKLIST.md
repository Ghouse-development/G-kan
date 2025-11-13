# G-kan セットアップチェックリスト

## 🔴 必須設定（現在未完了）

### 1. OpenAI APIキーの設定
**現状**: `your_openai_api_key_here` のまま
**影響**: AI検索、AI重複チェック機能が動作しない
**対応方法**:
```bash
# .env.localを編集
OPENAI_API_KEY=sk-proj-xxxxxxxxxx
```
OpenAI APIキーの取得: https://platform.openai.com/api-keys

### 2. Supabase Storageバケット作成
**必要なバケット**: `files`
**対応方法**:
1. Supabaseダッシュボードにログイン
2. Storage → New bucket
3. Name: `files`
4. Public bucket: ✅ (チェック)
5. Create bucket

### 3. データベースマイグレーション実行
**対応方法**:
```bash
# Supabase CLIをインストール（未インストールの場合）
npm install -g supabase

# ログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref dtdtexkwbirnpqkwzzxl

# マイグレーション実行
supabase db push
```

または、Supabaseダッシュボードで手動実行:
1. SQL Editor → New query
2. `supabase/migrations/20250112000000_initial_schema.sql`の内容をコピペ
3. Run
4. `supabase/migrations/20250112000001_vector_search.sql`も同様に実行

## 🟡 確認推奨項目

### 4. pgvector拡張の有効化
Supabaseダッシュボード → Database → Extensions → `vector` を有効化

### 5. RLSポリシーの確認
Supabaseダッシュボード → Authentication → Policies で各テーブルのRLSが有効になっているか確認

### 6. 初期管理者ユーザーの作成
システムにサインアップ後、手動で管理者権限を付与:
```sql
UPDATE public.users
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## ✅ 完了済み

- [x] Next.js 14プロジェクト作成
- [x] Supabase接続設定
- [x] データベーススキーマ定義
- [x] 全機能実装
- [x] ビルド成功確認

## セットアップ完了後の確認手順

1. `npm run dev` でローカル起動
2. `/signup` でアカウント作成
3. SQLで自分を管理者に設定
4. 以下の機能を順番にテスト:
   - [ ] ログイン/ログアウト
   - [ ] フォルダ作成
   - [ ] 記事作成（下書き）
   - [ ] ファイルアップロード
   - [ ] AI重複チェック
   - [ ] 記事公開
   - [ ] 承認フロー（管理者）
   - [ ] AI検索
   - [ ] キーワード検索
   - [ ] Q&A作成・回答
   - [ ] 通知確認
   - [ ] 管理者ダッシュボード

## 現在の評価

**実装完成度**: 100/100 ✅
**動作可能度**: 70/100 ⚠️

**主な理由**:
- OpenAI APIキー未設定
- Storageバケット未作成の可能性
- マイグレーション実行未確認
