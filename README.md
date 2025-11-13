# G-kan - ナレッジマネジメントシステム

株式会社Gハウスの社内ナレッジを一元管理し、AI自然言語検索で誰でも簡単に情報にアクセスできるシステムです。

## 🎯 主な機能

### 1. 高精度な検索 ✅
- **キーワード検索**: 従来型の検索で素早く情報を検索
- **AI自然言語検索**: 「有給申請の方法を教えて」のような自然な質問で検索可能
- OpenAI GPT-4による回答生成
- ベクトル埋め込みによるセマンティック検索

### 2. ナレッジの集約 ✅
- フォルダ階層による整理
- 記事・ファイル・議事録の一元管理
- タグによる横断的な分類
- Markdown対応のリッチテキストエディタ
- 記事のバージョン管理・編集履歴

### 3. アクセス制御 ✅
- フォルダ単位の権限管理（閲覧/編集/管理）
- ユーザー・部署単位での権限設定
- 行レベルセキュリティ（RLS）による堅牢なデータ保護

### 4. コラボレーション ✅
- 記事へのコメント機能
- リアクション（いいね・参考になった・ありがとう）
- ピン留め機能で重要な記事を強調
- リアルタイム通知ベル
- 通知設定のカスタマイズ

### 5. Q&A機能 ✅
- 社内版知恵袋として質問投稿
- 回答機能
- ベストアンサーの選択
- 質問ステータス管理（未解決/解決済み）
- タグによる質問の分類

### 6. ユーザー設定 ✅
- プロフィール情報の編集
- 通知設定（メール/アプリ内）
- 表示名・部署・役職の管理

### 7. 承認フロー（今後実装予定）
- 記事公開前の承認プロセス
- フォルダごとに承認フローのオン/オフ設定

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage)
- **AI機能**: OpenAI GPT-4, text-embedding-ada-002
- **ベクトル検索**: pgvector

## 📋 前提条件

- Node.js 20.x 以上
- npm 10.x 以上
- Supabaseアカウント
- OpenAI APIキー（AI検索機能を使用する場合）

## 🚀 セットアップ手順

### 1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/Ghouse-development/G-kan.git
cd G-kan
\`\`\`

### 2. 依存パッケージのインストール

\`\`\`bash
npm install
\`\`\`

### 3. 環境変数の設定

\`.env.local\`ファイルを作成し、以下の内容を設定：

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dtdtexkwbirnpqkwzzxl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_PROJECT_ID=dtdtexkwbirnpqkwzzxl

# OpenAI Configuration (for AI search)
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

### 4. Supabaseデータベースのセットアップ

Supabaseダッシュボードで以下のマイグレーションを実行：

1. **初期スキーマ**: \`supabase/migrations/20250112000000_initial_schema.sql\`
2. **ベクトル検索**: \`supabase/migrations/20250112000001_vector_search.sql\`

または、Supabase CLIを使用：

\`\`\`bash
# Supabase CLIのインストール（未インストールの場合）
npm install -g supabase

# プロジェクトのリンク
supabase link --project-ref dtdtexkwbirnpqkwzzxl

# マイグレーションの実行
supabase db push
\`\`\`

### 5. pgvector拡張機能の有効化

Supabaseダッシュボード > SQL Editorで以下を実行：

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

### 6. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 📁 プロジェクト構造

\`\`\`
G-kan/
├── app/                      # Next.js App Router
│   ├── (auth)/
│   │   ├── login/           # ログインページ
│   │   └── signup/          # 新規登録ページ
│   ├── dashboard/           # ダッシュボード
│   ├── folders/             # フォルダ管理
│   ├── articles/            # 記事管理
│   │   ├── new/            # 新規作成
│   │   └── [id]/           # 記事詳細・編集
│   ├── search/              # 検索
│   └── api/                 # APIエンドポイント
│       └── search/          # 検索API
├── components/              # Reactコンポーネント
│   ├── dashboard/          # ダッシュボード関連
│   ├── folders/            # フォルダ関連
│   ├── articles/           # 記事関連
│   └── search/             # 検索関連
├── lib/                     # ユーティリティ
│   ├── supabase/           # Supabaseクライアント
│   └── ai/                 # AI機能
│       └── openai.ts       # OpenAI連携
├── types/                   # TypeScript型定義
│   └── supabase.ts         # Supabaseデータベース型
├── supabase/               # Supabaseマイグレーション
│   └── migrations/
└── public/                  # 静的ファイル
\`\`\`

## 🔐 初期ユーザーの作成

1. \`/signup\`にアクセスして新規アカウントを作成
2. 最初のユーザーを管理者にする場合、Supabaseダッシュボード > Table Editorで\`users\`テーブルの\`is_admin\`を\`true\`に変更

## 🎨 デザイン

本システムは「ナレカン」のUIデザインを参考にしています：
- シンプルで直感的なインターフェース
- 左サイドバーナビゲーション
- フォルダベースの情報整理
- 記事中心のコンテンツ表示

## 📝 使い方

### フォルダの作成

1. サイドバーから「フォルダ」をクリック
2. 「+ 新規フォルダ」ボタンをクリック
3. フォルダ名、説明、アイコン、色を設定
4. 「作成」をクリック

### 記事の作成

1. ヘッダーの「+ 新規作成」ボタンをクリック
2. タイトル、フォルダ、本文を入力
3. タグを追加（任意）
4. 「下書き保存」または「公開」を選択

### AI検索の使用

1. サイドバーから「検索」をクリック
2. 「🤖 AI自然言語検索」を選択
3. 自然な質問文を入力（例: 「有給申請の方法を教えてください」）
4. AIが関連する記事を検索し、回答を生成

## 🔄 G-progressからの従業員情報連携

G-progressシステムから従業員情報を連携する場合：

1. G-progressのAPIエンドポイントまたはデータベース接続情報を確認
2. \`lib/sync/g-progress.ts\`にデータ同期スクリプトを作成
3. 定期実行用のCron設定またはSupabase Edge Functionsで自動同期

## ✅ 実装済み機能

- [x] ユーザー認証システム
- [x] ダッシュボード
- [x] フォルダ管理（階層構造）
- [x] 記事CRUD操作
- [x] キーワード検索
- [x] AI自然言語検索
- [x] コメント・リアクション
- [x] Q&A機能
- [x] 通知システム
- [x] ユーザー設定
- [x] アクセス権限管理（RLS）

## 🚧 今後の実装予定

- [ ] ファイルアップロード・添付機能
- [ ] OCRによる画像内テキスト検索
- [ ] 承認ワークフロー
- [ ] メール・チャット連携
- [ ] 議事録自動要約
- [ ] アクセス統計・レポート
- [ ] G-progressとの従業員データ同期
- [ ] ファイルからナレッジへのAI変換機能

## 📊 データベーススキーマ

主要テーブル：
- \`users\`: ユーザー情報
- \`folders\`: フォルダ
- \`folder_permissions\`: フォルダ権限
- \`articles\`: 記事
- \`article_embeddings\`: AI検索用ベクトル埋め込み
- \`reactions\`: リアクション
- \`comments\`: コメント
- \`notifications\`: 通知
- \`search_logs\`: 検索ログ

詳細は\`supabase/migrations/\`内のSQLファイルを参照してください。

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更を行う場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

This project is proprietary software owned by 株式会社Gハウス.

## 📞 サポート

質問や問題がある場合は、issueを作成するか、社内の開発チームにお問い合わせください。

---

**開発**: 株式会社Gハウス
**バージョン**: 0.1.0
**最終更新**: 2025-01-12
