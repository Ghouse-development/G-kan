// 一時的に認証を無効化（デバッグ用）
// export { middleware, config } from './lib/supabase/middleware'

// 認証なしでアクセス可能
export function middleware() {
  // 何もしない = 全ページにアクセス可能
  return null
}
