'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductForm from '../../components/ProductForm'
import type { Product } from '@/lib/services/products.service'

export default function SettingsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: {
    name: string
    avgKgPerCrate: number
    minKgPerCrate?: number | null
    maxKgPerCrate?: number | null
    buyPricePerCrate: number
    sellPricePerCrate: number
  }) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al crear producto')
      }

      await loadProducts()
      setShowCreateForm(false)
    } catch (error) {
      throw error
    }
  }

  const handleUpdate = async (data: {
    name: string
    avgKgPerCrate: number
    minKgPerCrate?: number | null
    maxKgPerCrate?: number | null
    buyPricePerCrate: number
    sellPricePerCrate: number
  }) => {
    if (!editingProduct) return

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al actualizar producto')
      }

      await loadProducts()
      setEditingProduct(null)
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar producto')
      }

      await loadProducts()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar producto')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
        Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Configuración de Productos
        </h1>
        <div className="flex gap-4">
          {!showCreateForm && !editingProduct && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Crear Producto
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Crear Nuevo Producto
          </h2>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {editingProduct && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Editar Producto: {editingProduct.name}
          </h2>
          <ProductForm
            product={editingProduct}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      )}

      {!showCreateForm && !editingProduct && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Kg/Reja
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Precio Compra
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {product.avgKgPerCrate} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {formatCurrency(product.buyPricePerCrate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">
                      {formatCurrency(product.sellPricePerCrate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
