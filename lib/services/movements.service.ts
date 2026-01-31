import { getSupabaseClient } from '../supabase/db'
import { getCurrentInventory } from './inventory.service'
import { getProductById } from './products.service'
import type { MovementInput } from '../validators'

export interface InventoryMovement {
  id: string
  productId: string
  type: 'IN' | 'OUT'
  crates: number
  timestamp: string
  note: string | null
  snapshotAvgKgPerCrate: number
  snapshotBuyPricePerCrate: number
  snapshotSellPricePerCrate: number
  estimatedKg: number
  buyTotal: number
  sellTotal: number | null
  profitEstimated: number | null
  inventoryAfter: number
  createdAt: string
}

export interface MovementFilters {
  productId?: string
  from?: string
  to?: string
  type?: 'IN' | 'OUT'
}

/**
 * Create a new inventory movement with automatic calculations
 */
export async function createMovement(
  input: MovementInput
): Promise<InventoryMovement> {
  const supabase = await getSupabaseClient()

  // Validate crates > 0
  if (input.crates <= 0) {
    throw new Error('Las rejas deben ser mayor a 0')
  }

  // Load product
  const product = await getProductById(input.productId)
  if (!product) {
    throw new Error('Producto no encontrado')
  }

  // Get current inventory
  const currentInventory = await getCurrentInventory(input.productId)

  // Validate stock for OUT movements
  if (input.type === 'OUT' && currentInventory < input.crates) {
    throw new Error(
      `Stock insuficiente. Disponible: ${currentInventory} rejas, solicitado: ${input.crates} rejas`
    )
  }

  // Create snapshot from current product values
  const snapshot = {
    avgKgPerCrate: product.avgKgPerCrate,
    buyPricePerCrate: product.buyPricePerCrate,
    sellPricePerCrate: product.sellPricePerCrate,
  }

  // Calculate derived values
  const estimatedKg = input.crates * snapshot.avgKgPerCrate
  const buyTotal = input.crates * snapshot.buyPricePerCrate
  const sellTotal =
    input.type === 'OUT' ? input.crates * snapshot.sellPricePerCrate : null
  const profitEstimated =
    input.type === 'OUT' && sellTotal !== null ? sellTotal - buyTotal : null

  // Calculate inventory after movement
  const inventoryAfter =
    input.type === 'IN'
      ? currentInventory + input.crates
      : currentInventory - input.crates

  // Insert movement
  const { data, error } = await supabase
    .from('inventory_movements')
    .insert({
      productId: input.productId,
      type: input.type,
      crates: input.crates,
      timestamp: input.timestamp,
      note: input.note || null,
      snapshotAvgKgPerCrate: snapshot.avgKgPerCrate,
      snapshotBuyPricePerCrate: snapshot.buyPricePerCrate,
      snapshotSellPricePerCrate: snapshot.sellPricePerCrate,
      estimatedKg,
      buyTotal,
      sellTotal,
      profitEstimated,
      inventoryAfter,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear movimiento: ${error.message}`)
  }

  return data
}

/**
 * Get movements with optional filters
 */
export async function getMovements(
  filters: MovementFilters = {}
): Promise<InventoryMovement[]> {
  const supabase = await getSupabaseClient()

  let query = supabase
    .from('inventory_movements')
    .select('*')
    .order('timestamp', { ascending: false })
    .order('createdAt', { ascending: false })

  if (filters.productId) {
    query = query.eq('productId', filters.productId)
  }

  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  if (filters.from) {
    query = query.gte('timestamp', filters.from)
  }

  if (filters.to) {
    query = query.lte('timestamp', filters.to)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error al obtener movimientos: ${error.message}`)
  }

  return data || []
}

/**
 * Get movements for a specific product
 */
export async function getMovementsByProduct(
  productId: string,
  from?: string,
  to?: string
): Promise<InventoryMovement[]> {
  return getMovements({ productId, from, to })
}
