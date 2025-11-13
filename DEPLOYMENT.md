# G-kan デプロイメントガイド

このドキュメントでは、G-kanを本番環境にデプロイする手順を説明します。

## 📋 デプロイ前のチェックリスト

- [ ] Supabaseプロジェクトが作成済み
- [ ] データベースマイグレーションが完了
- [ ] OpenAI APIキーを取得済み
- [ ] 環境変数を設定済み
- [ ] 本番用のドメインを準備

## 🚀 Vercelへのデプロイ（推奨）

### 1. Vercelアカウントの準備

[Vercel](https://vercel.com)にサインアップまたはログイン

### 2. GitHubリポジトリの接続

\`\`\`bash
# リポジトリをプッシュ
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### 3. Vercelでプロジェクトをインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリ「G-kan」を選択
3. フレームワーク: **Next.js** を選択
4. 環境変数を設定：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://dtdtexkwbirnpqkwzzxl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_PROJECT_ID=dtdtexkwbirnpqkwzzxl
OPENAI_API_KEY=your_openai_api_key
\`\`\`

5. 「Deploy」をクリック

### 4. カスタムドメインの設定

1. Vercelプロジェクト設定 > Domains
2. カスタムドメインを追加（例: g-kan.ghouse.co.jp）
3. DNSレコードを設定

## 🐳 Dockerでのデプロイ

### Dockerfileの作成

\`\`\`dockerfile
FROM node:20-alpine AS base

# 依存関係のインストール
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 本番環境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### docker-compose.ymlの作成

\`\`\`yaml
version: '3.8'

services:
  g-kan:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_ID}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
\`\`\`

### デプロイコマンド

\`\`\`bash
# ビルド
docker-compose build

# 起動
docker-compose up -d

# ログの確認
docker-compose logs -f
\`\`\`

## 🔧 本番環境の設定

### Supabase設定

1. **認証設定**
   - Site URL: https://g-kan.ghouse.co.jp
   - Redirect URLs: https://g-kan.ghouse.co.jp/auth/callback

2. **Row Level Security (RLS)**
   - すべてのテーブルでRLSが有効になっていることを確認

3. **API制限**
   - Rate Limitingを設定
   - 不正アクセス対策

### OpenAI設定

1. **APIキーの管理**
   - 本番用とテスト用で別のキーを使用
   - 使用量モニタリングの設定

2. **レート制限**
   - 1分あたりのリクエスト数を制限
   - キャッシュの活用

## 📊 モニタリング

### Vercelでのモニタリング

- Analytics: アクセス解析
- Logs: エラーログの確認
- Insights: パフォーマンス分析

### Supabaseでのモニタリング

- Database: クエリパフォーマンス
- Auth: 認証ログ
- Storage: ストレージ使用量

### 推奨モニタリングツール

- **Sentry**: エラートラッキング
- **LogRocket**: セッションリプレイ
- **Datadog**: インフラ監視

## 🔐 セキュリティ対策

### 環境変数の管理

- 本番環境では環境変数サービス（Vercel Secrets等）を使用
- \`.env.local\`は絶対にコミットしない
- 定期的なキーのローテーション

### HTTPS/SSL

- すべての通信をHTTPSで行う
- HSTSヘッダーの設定

### CSP (Content Security Policy)

next.config.jsに追加：

\`\`\`javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
\`\`\`

## 🔄 継続的デプロイ (CI/CD)

### GitHub Actionsの設定

\`.github/workflows/deploy.yml\`:

\`\`\`yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

## 📈 パフォーマンス最適化

### 画像最適化

- Next.js Imageコンポーネントを使用
- WebP形式の画像を優先

### キャッシング

- Supabaseクエリ結果のキャッシング
- OpenAI API呼び出しのキャッシング
- SWR / React Queryの活用

### コード分割

- Dynamic importsの活用
- Route-based code splitting

## 🗄️ バックアップ

### データベースバックアップ

Supabaseは自動バックアップを提供していますが、追加で：

\`\`\`bash
# 定期的なエクスポート
supabase db dump > backup-$(date +%Y%m%d).sql
\`\`\`

### ファイルバックアップ

- Supabase Storageの定期バックアップ
- 重要ファイルの外部保存

## 🔧 トラブルシューティング

### デプロイが失敗する

1. ビルドログを確認
2. 環境変数が正しく設定されているか確認
3. 依存パッケージのバージョン確認

### データベース接続エラー

1. Supabase URLとキーを確認
2. IPホワイトリスト設定を確認
3. RLSポリシーを確認

### AI検索が動作しない

1. OpenAI APIキーを確認
2. pgvector拡張機能が有効か確認
3. embeddings テーブルにデータがあるか確認

## 📞 サポート

デプロイに関する問題は、社内の開発チームまでお問い合わせください。

---

**最終更新**: 2025-01-12
