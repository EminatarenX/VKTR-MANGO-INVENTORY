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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { ReportSummary } from '@/lib/services/reports.service'

interface ReportChartProps {
  report: ReportSummary
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportChart({ report }: ReportChartProps) {
  const barData = report.byProduct.map((product) => ({
    name: product.name,
    entradas: product.totalInCrates,
    salidas: product.totalOutCrates,
    ganancia: product.profitEstimated,
  }))

  const pieData = report.byProduct.map((product) => ({
    name: product.name,
    value: product.profitEstimated,
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Gráfica de Barras - Entradas vs Salidas */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Entradas vs Salidas por Producto
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
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
                backgroundColor: 'var(--zinc-50)',
                border: '1px solid var(--zinc-200)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--zinc-900)' }}
            />
            <Legend />
            <Bar
              dataKey="entradas"
              fill="#10b981"
              name="Entradas (Rejas)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="salidas"
              fill="#ef4444"
              name="Salidas (Rejas)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica de Pastel - Distribución de Ganancia */}
      {report.totals.profitEstimated > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Distribución de Ganancia por Producto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgb(250 250 250)',
                  border: '1px solid rgb(229 231 235)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgb(24 24 27)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfica de Barras - Ganancia por Producto */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Ganancia por Producto
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
            <XAxis
              dataKey="name"
              className="text-zinc-600 dark:text-zinc-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-zinc-600 dark:text-zinc-400"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'rgb(250 250 250)',
                border: '1px solid rgb(229 231 235)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgb(24 24 27)' }}
            />
            <Legend />
            <Bar
              dataKey="ganancia"
              fill="#10b981"
              name="Ganancia (MXN)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
