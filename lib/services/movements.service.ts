import { getSupabaseClient } from '../supabase/db'
import { getCurrentUserId } from '../supabase/auth'
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
  page?: number
  pageSize?: number
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
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('inventory_movements')
    .insert({
      user_id: userId,
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
 * Get movements with optional filters (solo del usuario actual)
 */
export async function getMovements(
  filters: MovementFilters = {}
): Promise<InventoryMovement[]> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 50
  const rangeFrom = (page - 1) * pageSize
  const rangeTo = rangeFrom + pageSize - 1

  let query = supabase
    .from('inventory_movements')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .order('createdAt', { ascending: false })
    .range(rangeFrom, rangeTo)

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

export interface MovementsPage {
  items: InventoryMovement[]
  page: number
  pageSize: number
  total: number | null
}

/**
 * Igual que getMovements, pero regresa metadatos de paginación.
 */
export async function getMovementsPage(
  filters: MovementFilters = {}
): Promise<MovementsPage> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 50
  const rangeFrom = (page - 1) * pageSize
  const rangeTo = rangeFrom + pageSize - 1

  let query = supabase
    .from('inventory_movements')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .order('createdAt', { ascending: false })
    .range(rangeFrom, rangeTo)

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

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error al obtener movimientos: ${error.message}`)
  }

  return {
    items: data || [],
    page,
    pageSize,
    total: typeof count === 'number' ? count : null,
  }
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

/**
 * Delete a movement by id (solo si pertenece al usuario actual)
 */
export async function deleteMovement(id: string): Promise<void> {
  const supabase = await getSupabaseClient()
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('inventory_movements')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error al eliminar movimiento: ${error.message}`)
  }
}
