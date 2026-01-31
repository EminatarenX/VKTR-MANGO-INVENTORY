import { createClient } from '@/lib/supabase/server'
import { getInventorySummary } from '@/lib/services/inventory.service'
import { getMovements, type InventoryMovement } from '@/lib/services/movements.service'
import InventoryTable from '../components/InventoryTable'
import InventoryChart from '../components/InventoryChart'
import MovementsChart from '../components/MovementsChart'
import KPICard from '../components/KPICard'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let inventorySummary
  try {
    inventorySummary = await getInventorySummary()
  } catch (error) {
    console.error('Error loading inventory:', error)
    inventorySummary = {
      items: [],
      totals: {
        totalCratesOnHand: 0,
        totalEstimatedKgOnHand: 0,
        totalInventoryValueEstimated: 0,
      },
    }
  }

  // Obtener movimientos recientes para el gráfico (últimos 30 días)
  let recentMovements: InventoryMovement[] = []
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const movements = await getMovements({
      from: thirtyDaysAgo.toISOString(),
    })
    recentMovements = movements
  } catch (error) {
    console.error('Error loading movements:', error)
    recentMovements = []
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value)
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400 truncate">
            Bienvenido, {user?.email}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 shrink-0">
          <Link
            href="/in"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-center text-sm sm:text-base"
          >
            Registrar Entrada
          </Link>
          <Link
            href="/out"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-center text-sm sm:text-base"
          >
            Registrar Salida
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Rejas en Inventario"
          value={formatNumber(inventorySummary.totals.totalCratesOnHand)}
          subtitle={`${formatNumber(
            Math.round(inventorySummary.totals.totalEstimatedKgOnHand)
          )} kg estimados`}
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
        />
        <KPICard
          title="Valor Total Inventario"
          value={formatCurrency(inventorySummary.totals.totalInventoryValueEstimated)}
          subtitle="A precio de compra"
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KPICard
          title="Tipos de Mango"
          value={inventorySummary.items.length}
          subtitle="Productos activos"
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />
        <KPICard
          title="Movimientos Recientes"
          value={recentMovements.length}
          subtitle="Últimos 30 días"
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryChart data={inventorySummary} />
        <MovementsChart movements={recentMovements} />
      </div>

      {/* Tabla de Inventario */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Inventario Actual
        </h2>
        <InventoryTable data={inventorySummary} />
      </div>
    </div>
  )
}
