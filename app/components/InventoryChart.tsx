'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { InventorySummary } from '@/lib/services/inventory.service'

interface InventoryChartProps {
  data: InventorySummary
}

export default function InventoryChart({ data }: InventoryChartProps) {
  const chartData = data.items.map((item) => ({
    name: item.name,
    rejas: item.cratesOnHand,
    kg: Math.round(item.estimatedKgOnHand),
    valor: Math.round(item.inventoryValueEstimated),
  }))

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Inventario por Tipo de Mango
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="name"
            className="text-zinc-600 dark:text-zinc-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-zinc-600 dark:text-zinc-400"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(250 250 250)',
              border: '1px solid rgb(229 231 235)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'rgb(24 24 27)' }}
          />
          <Legend />
          <Bar
            dataKey="rejas"
            fill="#3b82f6"
            name="Rejas Disponibles"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
