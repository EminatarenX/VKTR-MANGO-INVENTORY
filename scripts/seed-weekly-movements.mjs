import { createClient } from '@supabase/supabase-js'

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Falta la variable de entorno ${name}`)
  return v
}

function toInt(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback
  const n = Number.parseInt(String(v), 10)
  if (Number.isNaN(n)) return fallback
  return n
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function iso(date) {
  return date.toISOString()
}

async function main() {
  const url = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const userId = requireEnv('SEED_USER_ID')

  const weeks = clamp(toInt(process.env.SEED_WEEKS, 26), 1, 260)
  const maxWeeklyIn = clamp(toInt(process.env.SEED_MAX_WEEKLY_IN, 60), 1, 500)
  const maxWeeklyOut = clamp(toInt(process.env.SEED_MAX_WEEKLY_OUT, 55), 0, 500)

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Productos del usuario
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, "avgKgPerCrate", "buyPricePerCrate", "sellPricePerCrate"')
    .eq('user_id', userId)
    .order('name')

  if (productsError) throw productsError
  if (!products?.length) {
    throw new Error(
      'No hay productos para este usuario. Corre primero: npm run seed:products (o créalos en /settings).'
    )
  }

  // Último inventario por producto (si ya hay movimientos)
  const inventoryByProduct = new Map()
  for (const p of products) {
    const { data: last, error } = await supabase
      .from('inventory_movements')
      .select('"inventoryAfter", timestamp')
      .eq('user_id', userId)
      .eq('productId', p.id)
      .order('timestamp', { ascending: false })
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    inventoryByProduct.set(p.id, last?.inventoryAfter ?? 0)
  }

  // Arrancamos desde el inicio de la semana (lunes) de hace `weeks` semanas
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - weeks * 7)
  start.setHours(10, 0, 0, 0)

  // normalizar a lunes
  const day = start.getDay() // 0 dom ... 1 lun ... 6 sáb
  const diffToMonday = (day + 6) % 7
  start.setDate(start.getDate() - diffToMonday)

  let inserted = 0

  for (let w = 0; w < weeks; w++) {
    const weekDate = new Date(start)
    weekDate.setDate(start.getDate() + w * 7)

    for (const p of products) {
      let current = inventoryByProduct.get(p.id) ?? 0

      // ENTRADA semanal (0..maxWeeklyIn)
      const inCrates = Math.floor(Math.random() * (maxWeeklyIn + 1))
      if (inCrates > 0) {
        const inventoryAfter = current + inCrates
        const movement = {
          user_id: userId,
          productId: p.id,
          type: 'IN',
          crates: inCrates,
          timestamp: iso(weekDate),
          note: 'Seed semanal (IN)',
          snapshotAvgKgPerCrate: p.avgKgPerCrate,
          snapshotBuyPricePerCrate: p.buyPricePerCrate,
          snapshotSellPricePerCrate: p.sellPricePerCrate,
          estimatedKg: inCrates * Number(p.avgKgPerCrate),
          buyTotal: inCrates * Number(p.buyPricePerCrate),
          sellTotal: null,
          profitEstimated: null,
          inventoryAfter,
        }

        const { error } = await supabase.from('inventory_movements').insert(movement)
        if (error) throw error
        inserted++
        current = inventoryAfter
      }

      // SALIDA semanal (0..min(maxWeeklyOut, current))
      const outLimit = Math.min(maxWeeklyOut, current)
      const outCrates = outLimit > 0 ? Math.floor(Math.random() * (outLimit + 1)) : 0
      if (outCrates > 0) {
        const inventoryAfter = current - outCrates
        const buyTotal = outCrates * Number(p.buyPricePerCrate)
        const sellTotal = outCrates * Number(p.sellPricePerCrate)
        const movement = {
          user_id: userId,
          productId: p.id,
          type: 'OUT',
          crates: outCrates,
          timestamp: iso(new Date(weekDate.getTime() + 1000 * 60 * 60 * 2)), // +2h
          note: 'Seed semanal (OUT)',
          snapshotAvgKgPerCrate: p.avgKgPerCrate,
          snapshotBuyPricePerCrate: p.buyPricePerCrate,
          snapshotSellPricePerCrate: p.sellPricePerCrate,
          estimatedKg: outCrates * Number(p.avgKgPerCrate),
          buyTotal,
          sellTotal,
          profitEstimated: sellTotal - buyTotal,
          inventoryAfter,
        }

        const { error } = await supabase.from('inventory_movements').insert(movement)
        if (error) throw error
        inserted++
        current = inventoryAfter
      }

      inventoryByProduct.set(p.id, current)
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Listo. Movimientos insertados: ${inserted}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
