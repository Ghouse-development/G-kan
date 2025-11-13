import pg from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const { Client } = pg

// Parse Supabase connection string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseProjectId = process.env.SUPABASE_PROJECT_ID
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Starting direct database migration...\n')
console.log('📋 Connection info:')
console.log(`   Project: ${supabaseProjectId}`)
console.log(`   URL: ${supabaseUrl}\n`)

// Supabase uses PostgreSQL on port 5432
// Connection format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
const connectionString = `postgresql://postgres.${supabaseProjectId}:${supabaseServiceKey}@db.${supabaseProjectId}.supabase.co:5432/postgres`

console.log('ℹ️  Note: Direct PostgreSQL connection requires database password from Supabase dashboard')
console.log('   Settings → Database → Connection string → Password\n')
console.log('⚠️  This script requires the database password, not the service role key\n')
console.log('Alternative: Use Supabase SQL Editor to run migrations manually\n')
console.log('📄 Migration files to run:')

const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')
const migrationFiles = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

migrationFiles.forEach((file, i) => {
  console.log(`   ${i + 1}. ${file}`)
})

console.log('\n✨ To run migrations:\n')
console.log('Option 1: Supabase Dashboard (Recommended)')
console.log('   1. Go to: https://supabase.com/dashboard/project/' + supabaseProjectId + '/sql/new')
console.log('   2. Copy contents of supabase/migrations/20250112000000_initial_schema.sql')
console.log('   3. Click "Run"')
console.log('   4. Repeat for 20250112000001_vector_search.sql\n')

console.log('Option 2: Supabase CLI')
console.log('   1. npm install -g supabase')
console.log('   2. supabase login')
console.log('   3. supabase link --project-ref ' + supabaseProjectId)
console.log('   4. supabase db push\n')
