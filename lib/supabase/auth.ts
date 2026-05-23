import { getSupabaseClient } from './db'

/**
 * Obtiene el ID del usuario autenticado actual.
 * Lanza error si no hay sesión activa.
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Usuario no autenticado')
  }

  return user.id
}

/**
 * Obtiene el company_id del usuario autenticado actual a partir de user_profiles.
 * Lanza error si el usuario no tiene una empresa asignada.
 */
export async function getCurrentCompanyId(): Promise<string> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single()

  if (error || !data?.company_id) {
    throw new Error('Usuario sin empresa asignada')
  }

  return data.company_id as string
}
