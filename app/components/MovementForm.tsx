'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/services/products.service'

interface MovementFormProps {
  type: 'IN' | 'OUT'
  products: Product[]
  currentInventory?: number
  onProductChange?: (productId: string) => void
  onSubmit: (data: {
    productId: string
    type: 'IN' | 'OUT'
    crates: number
    timestamp: string
    note?: string | null
  }) => Promise<void>
  onCancel?: () => void
}

export default function MovementForm({
  type,
  products,
  currentInventory,
  onProductChange,
  onSubmit,
  onCancel,
}: MovementFormProps) {
  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    crates: 1,
    timestamp: new Date().toISOString().slice(0, 16),
    note: '',
  })
  const [cratesInput, setCratesInput] = useState<string>('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products[0] || null
  )

  useEffect(() => {
    if (formData.productId) {
      const product = products.find((p) => p.id === formData.productId)
      setSelectedProduct(product || null)
    }
  }, [formData.productId, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Convertir el input string a número
    const cratesValue = cratesInput === '' ? 0 : Number(cratesInput)

    if (isNaN(cratesValue) || cratesValue <= 0) {
      setError('Las rejas deben ser mayor a 0')
      return
    }

    if (type === 'OUT' && currentInventory !== undefined) {
      if (currentInventory < cratesValue) {
        setError(
          `Stock insuficiente. Disponible: ${currentInventory} rejas, solicitado: ${cratesValue} rejas`
        )
        return
      }
    }

    setLoading(true)

    try {
      // Convert local datetime to ISO string
      const timestamp = new Date(formData.timestamp).toISOString()
      await onSubmit({
        productId: formData.productId,
        type,
        crates: cratesValue,
        timestamp,
        note: formData.note || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar movimiento')
    } finally {
      setLoading(false)
    }
  }

  const handleCratesBlur = () => {
    // Si el campo está vacío o es 0, establecer a 1
    if (cratesInput === '' || cratesInput === '0') {
      setCratesInput('1')
      setFormData({ ...formData, crates: 1 })
    } else {
      // Convertir a número y actualizar formData
      const numValue = Number(cratesInput)
      if (!isNaN(numValue) && numValue > 0) {
        setFormData({ ...formData, crates: numValue })
      }
    }
  }

  const handleCratesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCratesInput(value)
    // Actualizar formData solo si es un número válido
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue > 0) {
      setFormData({ ...formData, crates: numValue })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {type === 'OUT' && currentInventory !== undefined && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
          Stock disponible: <strong>{currentInventory} rejas</strong>
        </div>
      )}

      <div>
        <label
          htmlFor="productId"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Tipo de Mango *
        </label>
        <select
          id="productId"
          value={formData.productId}
          onChange={(e) => {
            setFormData({ ...formData, productId: e.target.value })
            onProductChange?.(e.target.value)
          }}
          required
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="crates"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Cantidad de Rejas *
        </label>
        <input
          id="crates"
          type="text"
          inputMode="numeric"
          value={cratesInput}
          onChange={handleCratesChange}
          onBlur={handleCratesBlur}
          required
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          htmlFor="timestamp"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Fecha y Hora *
        </label>
        <input
          id="timestamp"
          type="datetime-local"
          value={formData.timestamp}
          onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
          required
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Nota (opcional)
        </label>
        <textarea
          id="note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {selectedProduct && (() => {
        const cratesValue = cratesInput === '' ? 0 : Number(cratesInput)
        const validCrates = isNaN(cratesValue) || cratesValue <= 0 ? 0 : cratesValue
        
        return (
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              <strong>Estimaciones:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li>
                Kg estimados:{' '}
                <strong>
                  {(validCrates * selectedProduct.avgKgPerCrate).toFixed(1)} kg
                </strong>
              </li>
              <li>
                Costo total:{' '}
                <strong>
                  ${(validCrates * selectedProduct.buyPricePerCrate).toFixed(2)} MXN
                </strong>
              </li>
              {type === 'OUT' && (
                <li>
                  Ingreso estimado:{' '}
                  <strong>
                    ${(validCrates * selectedProduct.sellPricePerCrate).toFixed(2)} MXN
                  </strong>
                </li>
              )}
              {type === 'OUT' && (
                <li>
                  Ganancia estimada:{' '}
                  <strong>
                    $
                    {(
                      validCrates *
                      (selectedProduct.sellPricePerCrate - selectedProduct.buyPricePerCrate)
                    ).toFixed(2)}{' '}
                    MXN
                  </strong>
                </li>
              )}
            </ul>
          </div>
        )
      })()}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 min-w-0 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? 'Registrando...' : type === 'IN' ? 'Registrar Entrada' : 'Registrar Salida'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm sm:text-base shrink-0"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
