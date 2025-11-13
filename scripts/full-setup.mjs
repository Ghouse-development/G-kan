import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseProjectId = process.env.SUPABASE_PROJECT_ID

if (!supabaseUrl || !supabaseServiceKey || !supabaseProjectId) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

console.log('🚀 Starting FULL automatic setup...\n')
console.log('📋 Project: ' + supabaseProjectId + '\n')

async function executeSQL(sql, description) {
  console.log(`   ⏳ ${description}...`)

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let executed = 0
    let skipped = 0
    let errors = 0

    for (const statement of statements) {
      if (statement.includes('CREATE EXTENSION')) {
        // Extensions need special handling
        console.log('      → Skipping extension (must be enabled via dashboard)')
        skipped++
        continue
      }

      try {
        const { data, error } = await supabase.rpc('exec', {
          sql: statement + ';'
        })

        if (error) {
          // Check if it's an "already exists" error
          if (
            error.message?.includes('already exists') ||
            error.message?.includes('duplicate')
          ) {
            skipped++
          } else if (error.message?.includes('could not find')) {
            // RPC function doesn't exist, try alternative
            console.log('      ⚠️  RPC exec not available')
            break
          } else {
            console.log('      ⚠️  ' + error.message?.substring(0, 80))
            errors++
          }
        } else {
          executed++
        }
      } catch (err) {
        if (err.message?.includes('already exists')) {
          skipped++
        } else {
          errors++
        }
      }
    }

    if (executed > 0 || skipped > 0) {
      console.log(`   ✅ ${description} - Executed: ${executed}, Skipped: ${skipped}, Errors: ${errors}`)
    } else {
      console.log(`   ⚠️  ${description} - Could not execute via API`)
    }

    return { executed, skipped, errors }
  } catch (err) {
    console.error(`   ❌ ${description} failed:`, err.message)
    return { executed: 0, skipped: 0, errors: 1 }
  }
}

async function setupDatabase() {
  console.log('1️⃣ Database Setup\n')

  // Read the all-in-one setup SQL
  const setupSql = readFileSync(
    join(__dirname, '..', 'supabase', 'ALL_IN_ONE_SETUP.sql'),
    'utf-8'
  )

  await executeSQL(setupSql, 'Database schema and policies')

  console.log()
}

async function setupStorage() {
  console.log('2️⃣ Storage Setup\n')

  // Check if bucket exists
  console.log('   ⏳ Checking storage bucket...')
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.log('   ❌ Error listing buckets:', listError.message)
    return
  }

  if (!buckets?.find(b => b.name === 'files')) {
    console.log('   ⏳ Creating bucket "files"...')
    const { error } = await supabase.storage.createBucket('files', {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.*',
        'application/vnd.ms-*',
        'text/*',
      ],
    })

    if (error) {
      console.log('   ❌ Error creating bucket:', error.message)
    } else {
      console.log('   ✅ Storage bucket "files" created')
    }
  } else {
    console.log('   ✅ Storage bucket "files" already exists')
  }

  console.log()
}

async function verifySetup() {
  console.log('3️⃣ Verification\n')

  const checks = []

  // Check users table
  console.log('   ⏳ Checking users table...')
  const { error: usersError } = await supabase.from('users').select('id').limit(1)
  if (usersError) {
    console.log('   ❌ Users table:', usersError.message)
    checks.push({ name: 'Users table', status: 'failed', error: usersError.message })
  } else {
    console.log('   ✅ Users table accessible')
    checks.push({ name: 'Users table', status: 'ok' })
  }

  // Check articles table
  console.log('   ⏳ Checking articles table...')
  const { error: articlesError } = await supabase.from('articles').select('id').limit(1)
  if (articlesError) {
    console.log('   ❌ Articles table:', articlesError.message)
    checks.push({ name: 'Articles table', status: 'failed', error: articlesError.message })
  } else {
    console.log('   ✅ Articles table accessible')
    checks.push({ name: 'Articles table', status: 'ok' })
  }

  // Check folders table
  console.log('   ⏳ Checking folders table...')
  const { error: foldersError } = await supabase.from('folders').select('id').limit(1)
  if (foldersError) {
    console.log('   ❌ Folders table:', foldersError.message)
    checks.push({ name: 'Folders table', status: 'failed', error: foldersError.message })
  } else {
    console.log('   ✅ Folders table accessible')
    checks.push({ name: 'Folders table', status: 'ok' })
  }

  // Check storage
  console.log('   ⏳ Checking storage bucket...')
  const { data: buckets } = await supabase.storage.listBuckets()
  if (buckets?.find(b => b.name === 'files')) {
    console.log('   ✅ Storage bucket "files" exists')
    checks.push({ name: 'Storage bucket', status: 'ok' })
  } else {
    console.log('   ❌ Storage bucket "files" not found')
    checks.push({ name: 'Storage bucket', status: 'failed' })
  }

  console.log()

  const failedChecks = checks.filter(c => c.status === 'failed')
  const okChecks = checks.filter(c => c.status === 'ok')

  console.log('📊 Results:')
  console.log(`   ✅ Passed: ${okChecks.length}/${checks.length}`)
  console.log(`   ❌ Failed: ${failedChecks.length}/${checks.length}\n`)

  return { checks, failedChecks, okChecks }
}

async function printNextSteps(results) {
  console.log('═══════════════════════════════════════════════════════\n')

  if (results.failedChecks.length === 0) {
    console.log('🎉 Setup completed successfully!\n')
    console.log('✅ Next steps:')
    console.log('   1. (Optional) Set OPENAI_API_KEY in .env.local for AI features')
    console.log('   2. Run: npm run dev')
    console.log('   3. Visit: http://localhost:3000')
    console.log('   4. Sign up for an account')
    console.log('   5. Make yourself admin with SQL:')
    console.log('      UPDATE public.users SET is_admin = true WHERE email = \'your-email@example.com\';\n')
  } else {
    console.log('⚠️  Setup completed with some manual steps required\n')
    console.log('📋 Manual steps needed:\n')

    if (results.failedChecks.some(c => c.error?.includes('relation') || c.error?.includes('does not exist'))) {
      console.log('   1. Enable pgvector extension:')
      console.log('      → https://supabase.com/dashboard/project/' + supabaseProjectId + '/database/extensions')
      console.log('      → Search "vector" and click Enable\n')

      console.log('   2. Run database migration:')
      console.log('      → https://supabase.com/dashboard/project/' + supabaseProjectId + '/sql/new')
      console.log('      → Copy contents of: supabase/ALL_IN_ONE_SETUP.sql')
      console.log('      → Click Run\n')

      console.log('   3. Setup Storage RLS policies (see QUICK_SETUP.md)\n')
    }

    console.log('   Then run: npm run dev\n')
  }

  console.log('📚 Documentation:')
  console.log('   • Quick Setup (10 min): QUICK_SETUP.md')
  console.log('   • Full Guide: DEPLOYMENT_STEPS.md')
  console.log('   • Troubleshooting: SETUP_CHECKLIST.md\n')
}

async function main() {
  try {
    await setupStorage()
    await setupDatabase()
    const results = await verifySetup()
    await printNextSteps(results)

    console.log('═══════════════════════════════════════════════════════\n')

    if (results.okChecks.length === results.checks.length) {
      console.log('✨ Status: 100/100 - Ready to use! 🎉\n')
      process.exit(0)
    } else {
      const percentage = Math.round((results.okChecks.length / results.checks.length) * 100)
      console.log(`✨ Status: ${percentage}/100 - Manual steps required ⚠️\n`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

main()
