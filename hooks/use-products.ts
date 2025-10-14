'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockProducts: Product[] = [
  {
    id: 'product_1',
    resource_id: 'resource_1',
    name: 'Standard Double Room',
    code: 'STD_DBL',
    attrs: {
      occupancy: 2,
      room_type: 'double'
    },
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'product_2',
    resource_id: 'resource_1',
    name: 'Superior Double Room',
    code: 'SUP_DBL',
    attrs: {
      occupancy: 2,
      room_type: 'double'
    },
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'product_3',
    resource_id: 'resource_1',
    name: 'Executive Suite',
    code: 'EXE_SUITE',
    attrs: {
      occupancy: 4,
      room_type: 'suite'
    },
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'product_4',
    resource_id: 'resource_2',
    name: 'General Admission',
    code: 'GEN_ADM',
    attrs: {
      category: 'general'
    },
    active: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'product_5',
    resource_id: 'resource_2',
    name: 'VIP Experience',
    code: 'VIP_EXP',
    attrs: {
      category: 'vip'
    },
    active: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'product_6',
    resource_id: 'resource_3',
    name: 'Airport Transfer - Sedan',
    code: 'APT_SED',
    attrs: {
      vehicle_type: 'sedan',
      capacity: 4
    },
    active: true,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: 'product_7',
    resource_id: 'resource_3',
    name: 'Airport Transfer - Minivan',
    code: 'APT_MV',
    attrs: {
      vehicle_type: 'minivan',
      capacity: 8
    },
    active: true,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: 'product_8',
    resource_id: 'resource_4',
    name: 'Standard Lounge Access',
    code: 'LOUNGE_STD',
    attrs: {
      access_type: 'standard'
    },
    active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'product_9',
    resource_id: 'resource_5',
    name: 'Deluxe Room',
    code: 'DLX_ROOM',
    attrs: {
      occupancy: 2,
      room_type: 'double'
    },
    active: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'product_10',
    resource_id: 'resource_6',
    name: 'Museum Entry',
    code: 'LOUVRE_ENTRY',
    attrs: {
      category: 'general'
    },
    active: false,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z'
  }
]

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load products from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('products')
      if (stored) {
        setProducts(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setProducts(mockProducts)
        localStorage.setItem('products', JSON.stringify(mockProducts))
      }
    } catch (err) {
      setError(err as Error)
      setProducts(mockProducts) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveProducts = (newProducts: Product[]) => {
    try {
      localStorage.setItem('products', JSON.stringify(newProducts))
      setProducts(newProducts)
    } catch (err) {
      console.error('Failed to save products:', err)
      throw new Error('Failed to save products')
    }
  }

  const createProduct = async (data: Partial<Product>): Promise<Product> => {
    const newProduct: Product = {
      id: `product_${Date.now()}`,
      resource_id: data.resource_id || '',
      name: data.name || '',
      code: data.code,
      attrs: data.attrs || {},
      active: data.active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedProducts = [...products, newProduct]
    saveProducts(updatedProducts)
    
    toast.success('Product created successfully')
    return newProduct
  }

  const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
    const productIndex = products.findIndex(p => p.id === id)
    if (productIndex === -1) {
      throw new Error('Product not found')
    }

    const updatedProduct: Product = {
      ...products[productIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedProducts = [...products]
    updatedProducts[productIndex] = updatedProduct
    saveProducts(updatedProducts)
    
    toast.success('Product updated successfully')
    return updatedProduct
  }

  const deleteProduct = async (id: string): Promise<void> => {
    const updatedProducts = products.filter(p => p.id !== id)
    saveProducts(updatedProducts)
    
    toast.success('Product deleted successfully')
  }

  const getProduct = (id: string): Product | undefined => {
    return products.find(p => p.id === id)
  }

  const getProductsByResource = (resourceId: string): Product[] => {
    return products.filter(p => p.resource_id === resourceId)
  }

  const getActiveProducts = (): Product[] => {
    return products.filter(p => p.active)
  }

  return {
    data: products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getProductsByResource,
    getActiveProducts
  }
}
