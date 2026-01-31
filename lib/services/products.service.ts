import { getSupabaseClient } from '../supabase/db'
import { getCurrentUserId } from '../supabase/auth'
import type { ProductInput, ProductUpdateInput } from '../validators'

export interface Product {
  id: string
  name: string
  avgKgPerCrate: number
  minKgPerCrate: number | null
  maxKgPerCrate: number | null
  buyPricePerCrate: number
  sellPricePerCrate: number
  createdAt: string
  updatedAt: string
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) {
    throw new Error(`Error al obtener productos: ${error.message}`)
  }

  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Error al obtener producto: ${error.message}`)
  }

  return data
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: input.name,
      avgKgPerCrate: input.avgKgPerCrate,
      minKgPerCrate: input.minKgPerCrate ?? null,
      maxKgPerCrate: input.maxKgPerCrate ?? null,
      buyPricePerCrate: input.buyPricePerCrate,
      sellPricePerCrate: input.sellPricePerCrate,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe un producto con ese nombre')
    }
    throw new Error(`Error al crear producto: ${error.message}`)
  }

  return data
}

export async function updateProduct(
  id: string,
  input: ProductUpdateInput
): Promise<Product> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('products')
    .update({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Producto no encontrado')
    }
    if (error.code === '23505') {
      throw new Error('Ya existe un producto con ese nombre')
    }
    throw new Error(`Error al actualizar producto: ${error.message}`)
  }

  return data
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`)
  }
}
