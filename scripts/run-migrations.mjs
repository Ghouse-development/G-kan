import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigrations() {
  console.log('🚀 Starting database setup...\n')

  // 1. Enable pgvector extension
  console.log('1️⃣ Enabling pgvector extension...')
  try {
    const { error } = await supabase.rpc('query', {
      query: 'CREATE EXTENSION IF NOT EXISTS vector;',
    })

    if (error) {
      console.log('   ⚠️  Cannot enable via RPC. Trying direct SQL...')

      // Try using PostgreSQL REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          query: 'CREATE EXTENSION IF NOT EXISTS vector;',
        }),
      })

      if (!response.ok) {
        console.log('   ⚠️  Please enable pgvector manually:')
        console.log('   → Supabase Dashboard → Database → Extensions → enable "vector"\n')
      } else {
        console.log('   ✅ pgvector extension enabled\n')
      }
    } else {
      console.log('   ✅ pgvector extension enabled\n')
    }
  } catch (err) {
    console.log('   ⚠️  Please enable pgvector manually in dashboard\n')
  }

  // 2. Run migrations
  console.log('2️⃣ Running database migrations...')

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')
  const migrationFiles = readdirSync(migrationsDir).sort()

  for (const file of migrationFiles) {
    if (!file.endsWith('.sql')) continue

    console.log(`   📄 Executing ${file}...`)
    const sql = readFileSync(join(migrationsDir, file), 'utf-8')

    try {
      // Execute SQL via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ query: sql }),
      })

      if (response.ok) {
        console.log(`   ✅ ${file} executed successfully`)
      } else {
        const error = await response.text()
        if (error.includes('already exists')) {
          console.log(`   ℹ️  ${file} - objects already exist`)
        } else {
          console.log(`   ⚠️  ${file} - ${error}`)
        }
      }
    } catch (err) {
      console.error(`   ❌ Error in ${file}:`, err.message)
    }
  }

  console.log('   ✅ Migrations completed\n')

  // 3. Create Storage bucket
  console.log('3️⃣ Creating Storage bucket "files"...')
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) throw listError

    if (!buckets?.find(b => b.name === 'files')) {
      const { data, error } = await supabase.storage.createBucket('files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/*',
        ],
      })

      if (error) throw error
      console.log('   ✅ Storage bucket "files" created\n')
    } else {
      console.log('   ℹ️  Storage bucket "files" already exists\n')
    }
  } catch (err) {
    console.error('   ❌ Error with storage bucket:', err.message)
    console.log('   → Please create manually: Supabase Dashboard → Storage → New bucket → "files"\n')
  }

  console.log('✨ Database setup completed!\n')
  console.log('📋 Manual steps remaining:')
  console.log('1. ⚠️  Set OPENAI_API_KEY in .env.local')
  console.log('2. ⚠️  Verify pgvector extension: Dashboard → Database → Extensions')
  console.log('3. ⚠️  Configure Storage RLS policies (see supabase/storage-setup.sql)')
  console.log('4. ✅ Run: npm run dev\n')
}

runMigrations().catch(console.error)
