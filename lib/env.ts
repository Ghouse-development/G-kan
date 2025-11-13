// Environment variable validation
// This ensures all required env vars are set at build time

function validateEnv() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file or Vercel environment variables.'
    )
  }

  // Validate URL format
  try {
    new URL(required.NEXT_PUBLIC_SUPABASE_URL!)
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }

  return required
}

// Server-side only validation
export function validateServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('validateServerEnv can only be called on the server')
  }

  const serverEnv = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // Service role key is optional for some features
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY not set. Some features may not work.')
  }

  return serverEnv
}

// OpenAI is optional
export function getOpenAIKey() {
  return process.env.OPENAI_API_KEY
}

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY)
}

// Validate on import (client-side only check)
if (typeof window !== 'undefined') {
  validateEnv()
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}
