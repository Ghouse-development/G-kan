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

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              新規登録
            </Link>
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
