import { getSupabaseClient } from '../supabase/db'
import { getCurrentUserId } from '../supabase/auth'

export interface InventoryItem {
  productId: string
  name: string
  cratesOnHand: number
  estimatedKgOnHand: number
  inventoryValueEstimated: number
}

export interface InventorySummary {
  items: InventoryItem[]
  totals: {
    totalCratesOnHand: number
    totalEstimatedKgOnHand: number
    totalInventoryValueEstimated: number
  }
}

/**
 * Get current inventory for a specific product (solo movimientos del usuario actual)
 * Returns the last inventoryAfter value or 0 if no movements exist
 */
export async function getCurrentInventory(productId: string): Promise<number> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('inventory_movements')
    .select('inventoryAfter')
    .eq('productId', productId)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return 0
    }
    throw new Error(`Error al obtener inventario: ${error.message}`)
  }

  return data?.inventoryAfter || 0
}

/**
 * Get inventory summary for all products (solo del usuario actual)
 */
export async function getInventorySummary(): Promise<InventorySummary> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  // Get all products del usuario
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, "buyPricePerCrate"')
    .eq('user_id', userId)
    .order('name')

  if (productsError) {
    throw new Error(`Error al obtener productos: ${productsError.message}`)
  }

  // Get latest inventory for each product
  const items: InventoryItem[] = []

  for (const product of products || []) {
    const currentInventory = await getCurrentInventory(product.id)

    // Get product details to calculate estimated kg
    const { data: productDetails } = await supabase
      .from('products')
      .select('"avgKgPerCrate"')
      .eq('id', product.id)
      .single()

    const avgKgPerCrate = productDetails?.avgKgPerCrate || 0
    const estimatedKgOnHand = currentInventory * avgKgPerCrate
    const inventoryValueEstimated = currentInventory * product.buyPricePerCrate

    items.push({
      productId: product.id,
      name: product.name,
      cratesOnHand: currentInventory,
      estimatedKgOnHand: estimatedKgOnHand,
      inventoryValueEstimated: inventoryValueEstimated,
    })
  }

  // Calculate totals
  const totals = {
    totalCratesOnHand: items.reduce((sum, item) => sum + item.cratesOnHand, 0),
    totalEstimatedKgOnHand: items.reduce(
      (sum, item) => sum + item.estimatedKgOnHand,
      0
    ),
    totalInventoryValueEstimated: items.reduce(
      (sum, item) => sum + item.inventoryValueEstimated,
      0
    ),
  }

  return {
    items,
    totals,
  }
}
