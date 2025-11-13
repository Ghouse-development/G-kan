# G-kan クイックスタートガイド

このガイドでは、G-kanを最速でセットアップして動作させる方法を説明します。

## 📋 必要なもの

- Node.js 20.x 以上
- Supabaseアカウント（無料）
- OpenAI APIキー（AI検索を使用する場合）

## 🚀 5分でセットアップ

### ステップ1: リポジトリのクローン

```bash
git clone https://github.com/Ghouse-development/G-kan.git
cd G-kan
```

### ステップ2: 依存パッケージのインストール

```bash
npm install
```

### ステップ3: Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)にアクセスしてログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力
   - Name: G-kan
   - Database Password: 安全なパスワードを設定
   - Region: Tokyo（日本の場合）

### ステップ4: データベースのセットアップ

Supabaseダッシュボードで：

1. 左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. 以下のファイルの内容をコピー＆ペーストして実行：
   - `supabase/migrations/20250112000000_initial_schema.sql`
   - `supabase/migrations/20250112000001_vector_search.sql`

**重要**: pgvector拡張機能を有効化

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### ステップ5: 環境変数の設定

`.env.local`ファイルを作成：

```bash
cp .env.example .env.local
```

`.env.local`を編集して、Supabaseの情報を入力：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
OPENAI_API_KEY=your-openai-api-key  # AI検索を使用する場合
```

**Supabase情報の取得方法**:
1. Supabaseダッシュボード > Settings > API
2. Project URLをコピー → `NEXT_PUBLIC_SUPABASE_URL`
3. Project API keysの`anon public`をコピー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `service_role`をコピー → `SUPABASE_SERVICE_ROLE_KEY`

### ステップ6: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 🎉 完了！

これでG-kanが起動しました！

### 初回ログイン

1. http://localhost:3000/signup にアクセス
2. アカウントを作成
3. ダッシュボードにリダイレクトされます

### 最初のユーザーを管理者にする

Supabaseダッシュボードで：

1. Table Editor > users テーブルを開く
2. 作成したユーザーの行を見つける
3. `is_admin`カラムを`true`に変更

## 🔧 よくある問題

### ビルドエラーが出る

```bash
# キャッシュをクリア
rm -rf .next
npm run build
```

### データベース接続エラー

- `.env.local`のSupabase情報が正しいか確認
- Supabaseプロジェクトが起動しているか確認
- マイグレーションSQLを実行したか確認

### AI検索が動作しない

- OpenAI APIキーを設定したか確認
- APIキーが有効か確認
- pgvector拡張機能を有効化したか確認

## 📖 次のステップ

### 1. フォルダを作成

1. サイドバーから「フォルダ」をクリック
2. 「+ 新規フォルダ」ボタンをクリック
3. 名前、アイコン、色を設定

### 2. 記事を作成

1. ヘッダーの「+ 新規作成」をクリック
2. タイトルと本文を入力
3. フォルダを選択
4. 「公開」をクリック

### 3. AI検索を試す

1. サイドバーから「検索」をクリック
2. 「AI自然言語検索」を選択
3. 「有給申請の方法を教えてください」のような質問を入力

### 4. Q&Aを使う

1. サイドバーから「Q&A」をクリック
2. 「+ 質問する」ボタンをクリック
3. 質問を投稿

## 🌟 プロダクション環境へのデプロイ

Vercelへのデプロイが最も簡単です：

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)でインポート
3. 環境変数を設定
4. デプロイ

詳細は `DEPLOYMENT.md` を参照してください。

## 🆘 サポート

問題が発生した場合：

1. README.mdの完全なドキュメントを確認
2. GitHubのIssuesを確認
3. 社内の開発チームに連絡

## 🎨 カスタマイズ

### 色の変更

`tailwind.config.ts`の`colors.primary`を編集：

```typescript
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
    700: '#your-darkest-color',
  },
}
```

### ロゴの変更

`components/dashboard/DashboardLayout.tsx`の「G-kan」テキストを編集

## 📊 推奨設定

### OpenAI API使用量の管理

1. OpenAIダッシュボード > Usage limits
2. 月間使用量の上限を設定
3. アラートを設定

### Supabaseのパフォーマンス

1. Database > Query Performance を定期的に確認
2. 遅いクエリを最適化
3. インデックスを適切に設定

---

**開発**: 株式会社Gハウス
**最終更新**: 2025-01-12

Happy Knowledge Managing! 🎉
