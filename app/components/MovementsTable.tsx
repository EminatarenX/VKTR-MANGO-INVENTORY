'use client'

import { useState } from 'react'
import type { InventoryMovement } from '@/lib/services/movements.service'
import type { Product } from '@/lib/services/products.service'

interface MovementsTableProps {
  movements: InventoryMovement[]
  products: Product[]
  filters: {
    productId?: string
    type?: 'IN' | 'OUT'
    from?: string
    to?: string
  }
  onFilterChange: (filters: {
    productId?: string
    type?: 'IN' | 'OUT'
    from?: string
    to?: string
  }) => void
}

export default function MovementsTable({
  movements,
  products,
  filters,
  onFilterChange,
}: MovementsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || 'Desconocido'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tipo de Mango
            </label>
            <select
              value={filters.productId || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, productId: e.target.value || undefined })
              }
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Todos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tipo Movimiento
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  type: (e.target.value as 'IN' | 'OUT') || undefined,
                })
              }
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Todos</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={filters.from || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, from: e.target.value || undefined })
              }
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={filters.to || ''}
              onChange={(e) =>
                onFilterChange({ ...filters, to: e.target.value || undefined })
              }
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Rejas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Kg Est.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Ingreso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Ganancia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Inventario Después
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                      {formatDate(movement.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          movement.type === 'IN'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {movement.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {getProductName(movement.productId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {movement.crates}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {Math.round(movement.estimatedKg)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {formatCurrency(movement.buyTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {movement.sellTotal ? formatCurrency(movement.sellTotal) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {movement.profitEstimated
                        ? formatCurrency(movement.profitEstimated)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {movement.inventoryAfter}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                      {movement.note || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
