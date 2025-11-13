import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">G-kan</h1>
          <p className="text-xl mb-8">
            ナレッジマネジメントシステム
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Gハウスの規則・制度、マニュアル、ルールを<br />
            自然言語で簡単に検索・共有
          </p>

          <div className="flex flex-col gap-4 items-center">
            <Link
              href="/dashboard"
              className="btn-narekan-accent text-lg px-12 py-4"
            >
              🚀 デモモードで試す（ログイン不要）
            </Link>

            <div className="flex gap-4 mt-4">
              <Link
                href="/login"
                className="btn-narekan-primary"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3 border-3 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all font-medium"
                style={{ borderWidth: '3px' }}
              >
                新規登録
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>デモモード：</strong>データベース設定なしでG-kanの機能を体験できます。<br />
              実際のデータを使用するには、ログインまたは新規登録が必要です。
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">高精度な検索</h3>
              <p className="text-sm text-gray-600">
                キーワード検索とAI自然言語検索で<br />
                欲しい情報が瞬時に見つかる
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">ナレッジの集約</h3>
              <p className="text-sm text-gray-600">
                各種ファイル、メール、チャットから<br />
                情報を一元管理
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">安全な情報共有</h3>
              <p className="text-sm text-gray-600">
                フォルダ単位のアクセス権限で<br />
                セキュアな情報管理
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
