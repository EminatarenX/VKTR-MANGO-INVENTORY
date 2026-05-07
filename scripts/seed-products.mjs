import { createClient } from '@supabase/supabase-js'

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Falta la variable de entorno ${name}`)
  return v
}

function toNumber(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback
  const n = Number(v)
  if (Number.isNaN(n)) return fallback
  return n
}

async function main() {
  const url = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const userId = requireEnv('SEED_USER_ID')

  const buy = toNumber(process.env.SEED_BUY_PRICE, 50)
  const sell = toNumber(process.env.SEED_SELL_PRICE, 52)

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const products = [
    {
      user_id: userId,
      name: 'Ataulfo',
      avgKgPerCrate: 33,
      minKgPerCrate: 32,
      maxKgPerCrate: 34,
      buyPricePerCrate: buy,
      sellPricePerCrate: sell,
    },
    {
      user_id: userId,
      name: 'Oro',
      avgKgPerCrate: 32,
      minKgPerCrate: null,
      maxKgPerCrate: null,
      buyPricePerCrate: buy,
      sellPricePerCrate: sell,
    },
    {
      user_id: userId,
      name: 'Tommy',
      avgKgPerCrate: 30,
      minKgPerCrate: null,
      maxKgPerCrate: null,
      buyPricePerCrate: buy,
      sellPricePerCrate: sell,
    },
  ]

  // idempotente: si ya existe (user_id, name), lo omitimos
  for (const p of products) {
    const { data: existing, error: findError } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', userId)
      .eq('name', p.name)
      .maybeSingle()

    if (findError) throw findError
    if (existing?.id) {
      // eslint-disable-next-line no-console
      console.log(`OK (ya existe): ${p.name}`)
      continue
    }

    const { error: insertError } = await supabase.from('products').insert(p)
    if (insertError) throw insertError
    // eslint-disable-next-line no-console
    console.log(`Creado: ${p.name}`)
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
