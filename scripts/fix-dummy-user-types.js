const fs = require('fs');
const path = require('path');

// List of files to fix
const filesToFix = [
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

// Correct dummyUser object that matches the User type
const correctDummyUser = `const dummyUser = user || {
    id: 'demo-user-id',
    email: 'demo@ghouse.co.jp',
    display_name: 'デモユーザー',
    avatar_url: null,
    department: null,
    position: null,
    is_admin: true,
    notification_settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }`;

// Old dummyUser pattern to replace
const oldPattern = /const dummyUser = user \|\| \{[^}]+\}/;

console.log('🔧 Fixing dummyUser type definitions...\n');

let filesFixed = 0;
let filesFailed = 0;

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipped: ${file} (file not found)`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    if (!oldPattern.test(content)) {
      console.log(`⏭️  Skipped: ${file} (no dummyUser found)`);
      return;
    }

    // Replace the old dummyUser with the correct one
    content = content.replace(oldPattern, correctDummyUser);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    filesFixed++;
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    filesFailed++;
  }
});

console.log(`\n✨ Done! Fixed ${filesFixed} files, ${filesFailed} failed.`);
