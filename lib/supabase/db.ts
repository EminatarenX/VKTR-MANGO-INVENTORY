import { createClient } from './server'

/**
 * Helper function to get Supabase client for database queries
 * Use this in services to perform database operations
 */
export async function getSupabaseClient() {
  return await createClient()
}
