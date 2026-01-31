'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReportChart from '../../components/ReportChart'
import type { ReportSummary } from '@/lib/services/reports.service'

export default function ReportsPage() {
  const router = useRouter()
  const [report, setReport] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
    productId: '',
  })

  const handleGenerateReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        from: new Date(filters.from).toISOString(),
        to: new Date(filters.to + 'T23:59:59').toISOString(),
      })
      if (filters.productId) {
        params.append('productId', filters.productId)
      }

      const res = await fetch(`/api/reports/summary?${params.toString()}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al generar reporte')
      }

      const data = await res.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX')
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 min-w-0 truncate">
          Reportes
        </h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm sm:text-base shrink-0 w-full sm:w-auto"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Generar Reporte
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Reporte */}
      {report && (
        <div className="space-y-6">
          {/* Gráficas del Reporte */}
          <ReportChart report={report} />

          {/* Tabla del Reporte */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Reporte del {formatDate(report.from)} al {formatDate(report.to)}
            </h2>

            {/* Por Producto */}
            {report.byProduct.length > 0 && (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Entradas (Rejas)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Costo Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Salidas (Rejas)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Ingreso Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Ganancia
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Inventario Final
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Kg Est. Final
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                    {report.byProduct.map((product) => (
                      <tr
                        key={product.productId}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                          {formatNumber(product.totalInCrates)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                          {formatCurrency(product.totalInCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                          {formatNumber(product.totalOutCrates)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                          {formatCurrency(product.totalOutRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                          {formatCurrency(product.profitEstimated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                          {formatNumber(product.endingCrates)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                          {formatNumber(Math.round(product.estimatedKgEnding))} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totales */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Totales Generales
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total Entradas
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNumber(report.totals.totalInCrates)} rejas
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total Costo
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(report.totals.totalInCost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total Salidas
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNumber(report.totals.totalOutCrates)} rejas
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total Ingreso
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(report.totals.totalOutRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Ganancia Total
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(report.totals.profitEstimated)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Inventario Final
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNumber(report.totals.endingCrates)} rejas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
