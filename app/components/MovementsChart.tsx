'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { InventoryMovement } from '@/lib/services/movements.service'

interface MovementsChartProps {
  movements: InventoryMovement[]
}

export default function MovementsChart({ movements }: MovementsChartProps) {
  // Agrupar movimientos por fecha
  const groupedByDate = movements.reduce((acc, movement) => {
    const date = new Date(movement.timestamp).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
    })
    
    if (!acc[date]) {
      acc[date] = { date, entradas: 0, salidas: 0 }
    }
    
    if (movement.type === 'IN') {
      acc[date].entradas += movement.crates
    } else {
      acc[date].salidas += movement.crates
    }
    
    return acc
  }, {} as Record<string, { date: string; entradas: number; salidas: number }>)

  const chartData = Object.values(groupedByDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30) // Últimos 30 días

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Movimientos en el Tiempo
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
          No hay datos para mostrar
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Movimientos en el Tiempo (Últimos 30 días)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="date"
            className="text-zinc-600 dark:text-zinc-400"
            tick={{ fill: 'currentColor' }}
            angle={-45}
            textAnchor="end"
            height={80}
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
          <Line
            type="monotone"
            dataKey="entradas"
            stroke="#10b981"
            strokeWidth={2}
            name="Entradas"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="salidas"
            stroke="#ef4444"
            strokeWidth={2}
            name="Salidas"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
