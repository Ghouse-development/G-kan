# 管理者アカウント作成手順（Rate Limit回避）

## 方法: Supabase Dashboard経由（推奨）

この方法なら、Rate Limit（429エラー）を完全に回避できます。

---

## ステップ1: Supabase Authentication Dashboardを開く

https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/auth/users

---

## ステップ2: 新規ユーザーを作成

### 2-1. "Add user" をクリック

右上の "Add user" ボタンをクリック

### 2-2. "Create a new user" を選択

### 2-3. ユーザー情報を入力

```
Email: admin@ghouse.co.jp
Password: Admin@2025
Auto Confirm User: ✓ ON（チェックを入れる）
```

**重要**: "Auto Confirm User" を必ずONにしてください。これにより、メール確認なしで即座にログイン可能になります。

### 2-4. "Create user" をクリック

---

## ステップ3: ユーザーIDを取得

作成後、ユーザー一覧に表示されます。

1. 作成したユーザーをクリック
2. "UUID" をコピー（例: `550e8400-e29b-41d4-a716-446655440000`）

---

## ステップ4: usersテーブルにプロフィールを追加

### 前提条件
データベースマイグレーション（`ALL_IN_ONE_SETUP.sql`）が実行済みであること。
未実行の場合は、先に `SETUP_INSTRUCTIONS.md` のステップ1-2を完了してください。

### SQL実行

https://supabase.com/dashboard/project/dtdtexkwbirnpqkwzzxl/sql/new

```sql
-- ステップ3で取得したUUIDを使用
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  department_id,
  created_at,
  updated_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- ← ここに実際のUUIDを入力
  'admin@ghouse.co.jp',
  'システム管理者',
  'admin',
  NULL,
  NOW(),
  NOW()
);

-- 確認
SELECT id, email, name, role FROM users;
```

---

## ステップ5: ログイン

https://g-kan.vercel.app/login

```
メールアドレス: admin@ghouse.co.jp
パスワード: Admin@2025
```

ログイン成功！

---

## トラブルシューティング

### エラー: "User already exists"
**原因**: auth.usersに既に同じメールアドレスが存在
**解決**:
1. 既存ユーザーを削除
2. または別のメールアドレスを使用

### エラー: "relation public.users does not exist"
**原因**: データベースマイグレーション未実行
**解決**: `SETUP_INSTRUCTIONS.md` ステップ1-2を実行

### エラー: ログイン時に "Invalid login credentials"
**原因1**: パスワードが間違っている
**原因2**: "Auto Confirm User" がOFFだった
**解決**:
```sql
-- メール確認を手動で完了
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@ghouse.co.jp';
```

---

## 複数アカウント作成

同様の手順で、他のユーザーも作成できます：

### マネージャーアカウント
```
Email: manager@ghouse.co.jp
Password: Manager@2025
Role: manager
```

### リーダーアカウント
```
Email: leader@ghouse.co.jp
Password: Leader@2025
Role: leader
```

### 一般メンバーアカウント
```
Email: member@ghouse.co.jp
Password: Member@2025
Role: member
```

---

## セキュリティ注意事項

⚠️ **本番環境では必ずパスワードを変更してください**

初回ログイン後、設定ページからパスワードを変更することを強く推奨します。

---

作成日: 2025-11-13
