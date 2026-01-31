'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/services/products.service'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: {
    name: string
    avgKgPerCrate: number
    minKgPerCrate?: number | null
    maxKgPerCrate?: number | null
    buyPricePerCrate: number
    sellPricePerCrate: number
  }) => Promise<void>
  onCancel?: () => void
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    avgKgPerCrate: product?.avgKgPerCrate || 0,
    minKgPerCrate: product?.minKgPerCrate || '',
    maxKgPerCrate: product?.maxKgPerCrate || '',
    buyPricePerCrate: product?.buyPricePerCrate || 0,
    sellPricePerCrate: product?.sellPricePerCrate || 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        name: formData.name,
        avgKgPerCrate: formData.avgKgPerCrate,
        minKgPerCrate:
          formData.minKgPerCrate === ''
            ? null
            : Number(formData.minKgPerCrate),
        maxKgPerCrate:
          formData.maxKgPerCrate === ''
            ? null
            : Number(formData.maxKgPerCrate),
        buyPricePerCrate: formData.buyPricePerCrate,
        sellPricePerCrate: formData.sellPricePerCrate,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Nombre del Producto *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
          placeholder="Ej: Ataulfo"
        />
      </div>

      <div>
        <label
          htmlFor="avgKgPerCrate"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Kg Promedio por Reja *
        </label>
        <input
          id="avgKgPerCrate"
          type="number"
          step="0.1"
          value={formData.avgKgPerCrate}
          onChange={(e) =>
            setFormData({ ...formData, avgKgPerCrate: Number(e.target.value) })
          }
          required
          min="0"
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="minKgPerCrate"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Kg Mínimo por Reja (opcional)
          </label>
          <input
            id="minKgPerCrate"
            type="number"
            step="0.1"
            value={formData.minKgPerCrate}
            onChange={(e) =>
              setFormData({
                ...formData,
                minKgPerCrate: e.target.value === '' ? '' : Number(e.target.value),
              })
            }
            min="0"
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        <div>
          <label
            htmlFor="maxKgPerCrate"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Kg Máximo por Reja (opcional)
          </label>
          <input
            id="maxKgPerCrate"
            type="number"
            step="0.1"
            value={formData.maxKgPerCrate}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxKgPerCrate: e.target.value === '' ? '' : Number(e.target.value),
              })
            }
            min="0"
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="buyPricePerCrate"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Precio Compra por Reja (MXN) *
          </label>
          <input
            id="buyPricePerCrate"
            type="number"
            step="0.01"
            value={formData.buyPricePerCrate}
            onChange={(e) =>
              setFormData({
                ...formData,
                buyPricePerCrate: Number(e.target.value),
              })
            }
            required
            min="0"
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        <div>
          <label
            htmlFor="sellPricePerCrate"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Precio Venta por Reja (MXN) *
          </label>
          <input
            id="sellPricePerCrate"
            type="number"
            step="0.01"
            value={formData.sellPricePerCrate}
            onChange={(e) =>
              setFormData({
                ...formData,
                sellPricePerCrate: Number(e.target.value),
              })
            }
            required
            min="0"
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
