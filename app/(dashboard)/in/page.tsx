'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MovementForm from '../../components/MovementForm'
import type { Product } from '@/lib/services/products.service'

export default function InPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
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

  const handleSubmit = async (data: {
    productId: string
    type: 'IN' | 'OUT'
    crates: number
    timestamp: string
    note?: string | null
  }) => {
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al registrar entrada')
      }

      router.push('/')
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
        Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Registrar Entrada
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Registra una entrada de rejas de mango al inventario
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <MovementForm
          type="IN"
          products={products}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/')}
        />
      </div>
    </div>
  )
}
