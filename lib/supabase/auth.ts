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
