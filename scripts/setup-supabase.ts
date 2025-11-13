import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupDatabase() {
  console.log('🚀 Starting Supabase setup...\n')

  // 1. Enable pgvector extension
  console.log('1️⃣ Enabling pgvector extension...')
  try {
    const { error } = await supabase.rpc('exec_sql' as any, {
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;',
    })
    if (error) {
      // Try alternative method
      const { error: error2 } = await (supabase as any)
        .from('_migrations')
        .select('*')
        .limit(1)
      console.log('   ⚠️  Cannot enable extension via RPC, please enable manually in Supabase dashboard')
      console.log('   → Database → Extensions → enable "vector"')
    } else {
      console.log('   ✅ pgvector extension enabled\n')
    }
  } catch (err) {
    console.log('   ⚠️  Please enable pgvector extension manually in Supabase dashboard')
    console.log('   → Database → Extensions → enable "vector"\n')
  }

  // 2. Run migrations
  console.log('2️⃣ Running database migrations...')

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir).sort()

  for (const file of migrationFiles) {
    if (!file.endsWith('.sql')) continue

    console.log(`   📄 Running ${file}...`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')

    // Split by statement and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      try {
        // Use raw SQL execution
        const { error } = await (supabase as any).rpc('exec_sql', {
          sql: statement + ';',
        })

        if (error) {
          // Ignore "already exists" errors
          if (error.message?.includes('already exists')) {
            continue
          }
          throw error
        }
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          continue
        }
        console.error(`   ❌ Error in ${file}:`, err.message)
      }
    }
  }

  console.log('   ✅ Migrations completed\n')

  // 3. Create Storage bucket
  console.log('3️⃣ Creating Storage bucket...')
  try {
    const { data: buckets } = await supabase.storage.listBuckets()

    if (!buckets?.find(b => b.name === 'files')) {
      const { error } = await supabase.storage.createBucket('files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) throw error
      console.log('   ✅ Storage bucket "files" created\n')
    } else {
      console.log('   ℹ️  Storage bucket "files" already exists\n')
    }
  } catch (err: any) {
    console.error('   ❌ Error creating bucket:', err.message)
  }

  // 4. Setup Storage policies
  console.log('4️⃣ Setting up Storage policies...')
  try {
    const storageSql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'storage-setup.sql'),
      'utf-8'
    )

    // Note: Storage policies need to be set via dashboard
    console.log('   ⚠️  Storage policies need to be set manually in Supabase dashboard')
    console.log('   → Storage → files bucket → Policies')
    console.log('   → See supabase/storage-setup.sql for policy definitions\n')
  } catch (err: any) {
    console.error('   ❌ Error:', err.message)
  }

  console.log('✨ Supabase setup completed!\n')
  console.log('Next steps:')
  console.log('1. Set OPENAI_API_KEY in .env.local')
  console.log('2. Enable pgvector extension in Supabase dashboard (if not already done)')
  console.log('3. Configure Storage policies in Supabase dashboard')
  console.log('4. Run: npm run dev')
}

setupDatabase().catch(console.error)
