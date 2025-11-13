# Vercel デプロイガイド

## 🚀 Vercelへのデプロイ手順

### 前提条件
- Vercelアカウント
- Supabaseプロジェクト設定完了
- OpenAI APIキー（AI機能を使う場合）

---

## 方法1: Vercel CLI（推奨）

### ステップ1: Vercel CLIインストール

```bash
npm install -g vercel
```

### ステップ2: ログイン

```bash
vercel login
```

### ステップ3: プロジェクトをリンク

```bash
vercel link
```

プロンプトに従って:
- Set up and deploy: Yes
- Which scope: あなたのアカウント
- Link to existing project: No
- Project name: g-kan（またはお好みの名前）
- Directory: ./
- Override settings: No

### ステップ4: 環境変数を設定

```bash
# Supabase設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 入力: https://dtdtexkwbirnpqkwzzxl.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add SUPABASE_SERVICE_ROLE_KEY
# 入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add SUPABASE_PROJECT_ID
# 入力: dtdtexkwbirnpqkwzzxl

# OpenAI設定（オプション）
vercel env add OPENAI_API_KEY
# 入力: sk-proj-...
```

各環境変数について、以下を選択:
- Production: Yes
- Preview: Yes
- Development: No

### ステップ5: デプロイ

```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

---

## 方法2: Vercel Dashboard（GUI）

### ステップ1: GitHubリポジトリと連携

1. https://vercel.com/new にアクセス
2. "Import Git Repository" をクリック
3. `Ghouse-development/G-kan` を選択
4. "Import" をクリック

### ステップ2: プロジェクト設定

**Framework Preset**: Next.js（自動検出）

**Root Directory**: `./`

**Build Command**: `npm run build`（デフォルト）

**Output Directory**: `.next`（デフォルト）

**Install Command**: `npm install`（デフォルト）

### ステップ3: 環境変数を設定

**Environment Variables** セクションで以下を追加:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dtdtexkwbirnpqkwzzxl.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview |
| `SUPABASE_PROJECT_ID` | `dtdtexkwbirnpqkwzzxl` | Production, Preview |
| `OPENAI_API_KEY` | `sk-proj-...`（オプション） | Production, Preview |

### ステップ4: デプロイ

"Deploy" ボタンをクリック

---

## デプロイ後の設定

### Supabase Redirect URLs設定

Vercelデプロイ後、以下をSupabaseに追加:

1. https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/auth/url-configuration

2. **Redirect URLs** に追加:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

3. **Site URL** を更新:
   ```
   https://your-app.vercel.app
   ```

---

## トラブルシューティング

### ビルドエラー: "Module not found"

**原因**: 依存関係の問題

**解決**:
```bash
rm -rf node_modules package-lock.json
npm install
vercel --prod
```

### ランタイムエラー: "Environment variables not found"

**原因**: 環境変数が未設定

**解決**:
1. Vercel Dashboard → Settings → Environment Variables
2. 全ての必要な環境変数を追加
3. Redeploy

### API エラー: "Could not find the table"

**原因**: データベースマイグレーション未実行

**解決**:
1. `supabase/ALL_IN_ONE_SETUP.sql` をSupabase SQL Editorで実行
2. デプロイを再試行

### OpenAI エラー: "Invalid API key"

**原因**: OpenAI APIキーが無効または未設定

**解決**:
1. https://platform.openai.com/api-keys で新しいキーを作成
2. Vercelの環境変数を更新
3. Redeploy

---

## パフォーマンス最適化

### 推奨設定

**vercel.json** は既に最適化済み:
- Region: `hnd1`（東京）
- Next.js最適化有効
- 環境変数管理

### キャッシング

Next.jsの自動キャッシングが有効:
- 静的ページ: 自動キャッシュ
- API Routes: デフォルト60秒キャッシュ
- ISR: revalidate設定に従う

---

## モニタリング

### Vercel Analytics

1. Vercel Dashboard → Analytics
2. トラフィック、パフォーマンス、エラー率を確認

### Logs

```bash
vercel logs [deployment-url]
```

または Vercel Dashboard → Deployments → Logs

---

## カスタムドメイン設定

1. Vercel Dashboard → Settings → Domains
2. "Add Domain" をクリック
3. ドメイン名を入力
4. DNSレコードを設定:
   - Type: A
   - Name: @（または www）
   - Value: 76.76.21.21

5. SSL証明書が自動発行される（数分）

---

## 継続的デプロイ

GitHubと連携している場合:
- `master` ブランチへのpush → 本番デプロイ
- その他のブランチ → プレビューデプロイ

手動コントロール:
```bash
# 特定のブランチからデプロイ
git checkout feature-branch
vercel

# 本番デプロイ
git checkout master
vercel --prod
```

---

## コスト見積もり

**Vercel Hobby Plan（無料）:**
- ✅ 商用利用可能
- ✅ 100GB帯域幅/月
- ✅ 6000分ビルド時間/月
- ✅ サーバーレス関数実行時間無制限

**G-kanの推定使用量（150ユーザー）:**
- 帯域幅: ~10GB/月
- ビルド時間: ~30分/月
- **無料プランで十分** ✅

---

## セキュリティ

### 環境変数の保護

- ✅ `.env.local` は `.gitignore` 済み
- ✅ Vercel環境変数は暗号化
- ✅ Service Role Keyは本番環境のみ

### RLS有効化確認

Supabaseで全テーブルのRLSが有効:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

全て `rowsecurity = true` であることを確認

---

## サポート

問題が発生した場合:
1. Vercel Logs を確認
2. Supabase Logs を確認
3. `DEPLOYMENT_STEPS.md` を参照
4. GitHub Issues で質問
