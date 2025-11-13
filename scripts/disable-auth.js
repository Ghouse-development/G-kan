const fs = require('fs');
const path = require('path');

// 認証チェックを無効化するファイル一覧
const files = [
  'app/dashboard/page.tsx',
  'app/admin/page.tsx',
  'app/approvals/page.tsx',
  'app/settings/page.tsx',
  'app/questions/[id]/page.tsx',
  'app/questions/new/page.tsx',
  'app/questions/page.tsx',
  'app/articles/[id]/page.tsx',
  'app/articles/[id]/edit/page.tsx',
  'app/search/page.tsx',
  'app/articles/new/page.tsx',
  'app/articles/page.tsx',
  'app/folders/page.tsx',
];

console.log('🔓 認証チェックを無効化中...\n');

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  スキップ: ${filePath} (ファイルが存在しません)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // 認証チェックをコメントアウト
  const originalContent = content;
  content = content.replace(
    /if \(!session\) \{\s*redirect\(['"]\/login['"]\)\s*\}/g,
    '// 一時的に認証チェックを無効化\n  // if (!session) {\n  //   redirect(\'/login\')\n  // }'
  );

  // ダミーユーザーを追加（まだない場合）
  if (content.includes('session.user.id') && !content.includes('dummyUser')) {
    // user変数の取得部分を修正
    content = content.replace(
      /const \{ data: user \} = await supabase[\s\S]*?\.single\(\)/,
      `const { data: user } = session ? await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single() : { data: null }

  // デモ用のダミーユーザー
  const dummyUser = user || {
    id: 'demo-user-id',
    email: 'demo@ghouse.co.jp',
    name: 'デモユーザー',
    role: 'admin',
  }`
    );

    // session.user.id を session?.user?.id || 'demo-user-id' に置換
    content = content.replace(/session\.user\.id/g, "session?.user?.id || 'demo-user-id'");

    // user を dummyUser に置換（コンポーネントプロップス）
    content = content.replace(/user={user}/g, 'user={dummyUser}');
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 修正完了: ${filePath}`);
  } else {
    console.log(`ℹ️  変更なし: ${filePath}`);
  }
});

console.log('\n✅ すべての認証チェックを無効化しました！');
console.log('\n⚠️  警告: これはデバッグ用です。本番環境では認証を再度有効化してください。');
