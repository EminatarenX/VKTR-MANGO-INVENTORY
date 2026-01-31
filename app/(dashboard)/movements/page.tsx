'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MovementsTable from '../../components/MovementsTable'
import type { InventoryMovement } from '@/lib/services/movements.service'
import type { Product } from '@/lib/services/products.service'

export default function MovementsPage() {
  const router = useRouter()
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{
    productId?: string
    type?: 'IN' | 'OUT'
    from?: string
    to?: string
  }>({})

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load products
      const productsRes = await fetch('/api/products')
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      // Load movements with filters
      const params = new URLSearchParams()
      if (filters.productId) params.append('productId', filters.productId)
      if (filters.type) params.append('type', filters.type)
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)

      const movementsRes = await fetch(`/api/movements?${params.toString()}`)
      if (movementsRes.ok) {
        const movementsData = await movementsRes.json()
        setMovements(movementsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 min-w-0 truncate">
          Historial de Movimientos
        </h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm sm:text-base shrink-0 w-full sm:w-auto"
        >
          Volver al Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
          Cargando...
        </div>
      ) : (
        <MovementsTable
          movements={movements}
          products={products}
          filters={filters}
          onFilterChange={setFilters}
          onMovementDeleted={loadData}
        />
      )}
    </div>
  )
}
