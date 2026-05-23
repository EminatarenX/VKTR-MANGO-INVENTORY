import { getSupabaseClient } from '../supabase/db'
import { getCurrentCompanyId } from '../supabase/auth'
import { getMovements } from './movements.service'

export interface ProductReport {
  productId: string
  name: string
  totalInCrates: number
  totalInCost: number
  totalOutCrates: number
  totalOutRevenue: number
  profitEstimated: number
  endingCrates: number
  estimatedKgIn: number
  estimatedKgOut: number
  estimatedKgEnding: number
}

export interface ReportSummary {
  from: string
  to: string
  byProduct: ProductReport[]
  totals: {
    totalInCrates: number
    totalInCost: number
    totalOutCrates: number
    totalOutRevenue: number
    profitEstimated: number
    endingCrates: number
  }
}

/**
 * Generate report summary for a date range
 */
export async function getReportSummary(
  from: string,
  to: string,
  productId?: string
): Promise<ReportSummary> {
  const supabase = await getSupabaseClient()
  const companyId = await getCurrentCompanyId()

  // Get all products de la empresa (or specific one)
  let productsQuery = supabase
    .from('products')
    .select('id, name')
    .eq('company_id', companyId)
  if (productId) {
    productsQuery = productsQuery.eq('id', productId)
  }
  const { data: products, error: productsError } = await productsQuery

  if (productsError) {
    throw new Error(`Error al obtener productos: ${productsError.message}`)
  }

  const byProduct: ProductReport[] = []

  for (const product of products || []) {
    // Get movements for this product in the date range
    const movements = await getMovements({
      productId: product.id,
      from,
      to,
    })

    // Aggregate IN movements
    const inMovements = movements.filter((m) => m.type === 'IN')
    const totalInCrates = inMovements.reduce((sum, m) => sum + m.crates, 0)
    const totalInCost = inMovements.reduce((sum, m) => sum + m.buyTotal, 0)
    const estimatedKgIn = inMovements.reduce(
      (sum, m) => sum + m.estimatedKg,
      0
    )

    // Aggregate OUT movements
    const outMovements = movements.filter((m) => m.type === 'OUT')
    const totalOutCrates = outMovements.reduce((sum, m) => sum + m.crates, 0)
    const totalOutRevenue = outMovements.reduce(
      (sum, m) => sum + (m.sellTotal || 0),
      0
    )
    const profitEstimated = outMovements.reduce(
      (sum, m) => sum + (m.profitEstimated || 0),
      0
    )
    const estimatedKgOut = outMovements.reduce(
      (sum, m) => sum + m.estimatedKg,
      0
    )

    // Get ending crates (last movement's inventoryAfter <= to)
    // First, get the last movement before or at 'to' date
    const movementsUpToTo = await getMovements({
      productId: product.id,
      to,
    })
    const endingCrates =
      movementsUpToTo.length > 0 ? movementsUpToTo[0].inventoryAfter : 0

    // Calculate estimated kg ending (using current product avgKgPerCrate)
    const { data: productDetails } = await supabase
      .from('products')
      .select('"avgKgPerCrate"')
      .eq('id', product.id)
      .single()
    const estimatedKgEnding =
      endingCrates * (productDetails?.avgKgPerCrate || 0)

    byProduct.push({
      productId: product.id,
      name: product.name,
      totalInCrates,
      totalInCost,
      totalOutCrates,
      totalOutRevenue,
      profitEstimated,
      endingCrates,
      estimatedKgIn,
      estimatedKgOut,
      estimatedKgEnding,
    })
  }

  // Calculate totals
  const totals = {
    totalInCrates: byProduct.reduce((sum, p) => sum + p.totalInCrates, 0),
    totalInCost: byProduct.reduce((sum, p) => sum + p.totalInCost, 0),
    totalOutCrates: byProduct.reduce((sum, p) => sum + p.totalOutCrates, 0),
    totalOutRevenue: byProduct.reduce((sum, p) => sum + p.totalOutRevenue, 0),
    profitEstimated: byProduct.reduce((sum, p) => sum + p.profitEstimated, 0),
    endingCrates: byProduct.reduce((sum, p) => sum + p.endingCrates, 0),
  }

  return {
    from,
    to,
    byProduct,
    totals,
  }
}
