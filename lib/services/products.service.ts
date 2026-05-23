import { getSupabaseClient } from '../supabase/db'
import { getCurrentCompanyId, getCurrentUserId } from '../supabase/auth'
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
  const companyId = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .order('name')

  if (error) {
    throw new Error(`Error al obtener productos: ${error.message}`)
  }

  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await getSupabaseClient()
  const companyId = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
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
  const companyId = await getCurrentCompanyId()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('products')
    .insert({
      company_id: companyId,
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
  const companyId = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('products')
    .update({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)
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
  const companyId = await getCurrentCompanyId()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`)
  }
}
