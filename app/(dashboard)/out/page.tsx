'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MovementForm from '../../components/MovementForm'
import type { Product } from '@/lib/services/products.service'

export default function OutPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [inventoryData, setInventoryData] = useState<Record<string, number>>({})
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      loadCurrentInventory()
    }
  }, [selectedProductId, products])

  const loadData = async () => {
    try {
      // Load products
      const productsRes = await fetch('/api/products')
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
        if (productsData.length > 0) {
          setSelectedProductId(productsData[0].id)
        }
      }

      // Load inventory summary
      const inventoryRes = await fetch('/api/inventory/summary')
      if (inventoryRes.ok) {
        const inventorySummary = await inventoryRes.json()
        const inventoryMap: Record<string, number> = {}
        inventorySummary.items.forEach((item: any) => {
          inventoryMap[item.productId] = item.cratesOnHand
        })
        setInventoryData(inventoryMap)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentInventory = async () => {
    try {
      const res = await fetch('/api/inventory/summary')
      if (res.ok) {
        const data = await res.json()
        const inventoryMap: Record<string, number> = {}
        data.items.forEach((item: any) => {
          inventoryMap[item.productId] = item.cratesOnHand
        })
        setInventoryData(inventoryMap)
      }
    } catch (error) {
      console.error('Error loading inventory:', error)
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
        throw new Error(error.error || 'Error al registrar salida')
      }

      router.push('/')
    } catch (error) {
      throw error
    }
  }

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId)
    loadCurrentInventory()
  }

  const currentInventory = selectedProductId ? inventoryData[selectedProductId] : undefined

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
          Registrar Salida
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Registra una salida de rejas de mango del inventario
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <MovementForm
          type="OUT"
          products={products}
          currentInventory={currentInventory}
          onProductChange={handleProductChange}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/')}
        />
      </div>
    </div>
  )
}
