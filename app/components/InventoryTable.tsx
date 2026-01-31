'use client'

import type { InventorySummary } from '@/lib/services/inventory.service'

interface InventoryTableProps {
  data: InventorySummary
}

export default function InventoryTable({ data }: InventoryTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Tipo de Mango
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Rejas Disponibles
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Kg Estimados
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Valor Inventario
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
            {data.items.map((item) => (
              <tr key={item.productId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                  {formatNumber(item.cratesOnHand)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                  {formatNumber(Math.round(item.estimatedKgOnHand))} kg
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                  {formatCurrency(item.inventoryValueEstimated)}
                </td>
              </tr>
            ))}
            <tr className="bg-zinc-100 dark:bg-zinc-800 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                TOTAL
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50 text-right">
                {formatNumber(data.totals.totalCratesOnHand)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50 text-right">
                {formatNumber(Math.round(data.totals.totalEstimatedKgOnHand))} kg
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50 text-right">
                {formatCurrency(data.totals.totalInventoryValueEstimated)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
