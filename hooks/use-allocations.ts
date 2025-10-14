'use client'

import { useState, useEffect } from 'react'
import { Allocation } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockAllocations: Allocation[] = [
  {
    id: 'allocation_1',
    resource_id: 'resource_1',
    product_id: 'product_1',
    start_date: '2025-05-15',
    end_date: '2025-05-18',
    pool_id: 'madrid-city-break',
    capacity: 10,
    stop_sell: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'allocation_2',
    resource_id: 'resource_1',
    product_id: 'product_1',
    start_date: '2025-05-20',
    end_date: '2025-05-22',
    pool_id: 'barcelona-weekend',
    capacity: 8,
    stop_sell: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'allocation_3',
    resource_id: 'resource_1',
    product_id: 'product_1',
    start_date: '2025-06-01',
    end_date: '2025-06-08',
    pool_id: 'summer-package',
    capacity: 15,
    stop_sell: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'allocation_4',
    resource_id: 'resource_1',
    product_id: 'product_2',
    start_date: '2025-05-15',
    end_date: '2025-05-18',
    pool_id: 'madrid-superior',
    capacity: 5,
    stop_sell: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'allocation_5',
    resource_id: 'resource_1',
    product_id: 'product_2',
    start_date: '2025-05-20',
    end_date: '2025-05-22',
    pool_id: 'barcelona-superior',
    capacity: 5,
    stop_sell: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'allocation_6',
    resource_id: 'resource_1',
    product_id: 'product_3',
    start_date: '2024-05-15',
    end_date: '2024-05-16',
    pool_id: null,
    capacity: 2,
    stop_sell: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'allocation_7',
    resource_id: 'resource_2',
    product_id: 'product_4',
    start_date: '2024-05-10',
    end_date: '2024-05-12',
    pool_id: null,
    capacity: 100,
    stop_sell: false,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'allocation_8',
    resource_id: 'resource_2',
    product_id: 'product_4',
    start_date: '2024-05-11',
    end_date: '2024-05-13',
    pool_id: null,
    capacity: 100,
    stop_sell: false,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'allocation_9',
    resource_id: 'resource_2',
    product_id: 'product_5',
    start_date: '2024-05-10',
    end_date: '2024-05-12',
    pool_id: 'vip-experience',
    capacity: 20,
    stop_sell: false,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'allocation_10',
    resource_id: 'resource_3',
    product_id: 'product_6',
    start_date: '2024-05-15',
    end_date: '2024-05-17',
    pool_id: null,
    capacity: 8,
    stop_sell: false,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: 'allocation_11',
    resource_id: 'resource_3',
    product_id: 'product_6',
    start_date: '2024-05-18',
    end_date: '2024-05-20',
    pool_id: null,
    capacity: 8,
    stop_sell: false,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: 'allocation_12',
    resource_id: 'resource_3',
    product_id: 'product_7',
    start_date: '2024-05-15',
    end_date: '2024-05-17',
    pool_id: 'airport-transfers',
    capacity: 4,
    stop_sell: false,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: 'allocation_13',
    resource_id: 'resource_4',
    product_id: 'product_8',
    start_date: '2025-05-20',
    end_date: '2025-05-22',
    pool_id: null,
    capacity: 50,
    stop_sell: false,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'allocation_14',
    resource_id: 'resource_5',
    product_id: 'product_9',
    start_date: '2024-05-25',
    end_date: '2024-05-27',
    pool_id: 'paris-deluxe',
    capacity: 3,
    stop_sell: false,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'allocation_15',
    resource_id: 'resource_6',
    product_id: 'product_10',
    start_date: '2024-05-30',
    end_date: '2024-06-02',
    pool_id: null,
    capacity: 200,
    stop_sell: true,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z'
  }
]

export function useAllocations() {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load allocations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('allocations')
      if (stored) {
        setAllocations(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setAllocations(mockAllocations)
        localStorage.setItem('allocations', JSON.stringify(mockAllocations))
      }
    } catch (err) {
      setError(err as Error)
      setAllocations(mockAllocations) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveAllocations = (newAllocations: Allocation[]) => {
    try {
      localStorage.setItem('allocations', JSON.stringify(newAllocations))
      setAllocations(newAllocations)
    } catch (err) {
      console.error('Failed to save allocations:', err)
      throw new Error('Failed to save allocations')
    }
  }

  const createAllocation = async (data: Partial<Allocation>): Promise<Allocation> => {
    const newAllocation: Allocation = {
      id: `allocation_${Date.now()}`,
      resource_id: data.resource_id || '',
      product_id: data.product_id || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      pool_id: data.pool_id || null,
      capacity: data.capacity || 0,
      stop_sell: data.stop_sell ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedAllocations = [...allocations, newAllocation]
    saveAllocations(updatedAllocations)
    
    toast.success('Allocation created successfully')
    return newAllocation
  }

  const updateAllocation = async (id: string, data: Partial<Allocation>): Promise<Allocation> => {
    const allocationIndex = allocations.findIndex(a => a.id === id)
    if (allocationIndex === -1) {
      throw new Error('Allocation not found')
    }

    const updatedAllocation: Allocation = {
      ...allocations[allocationIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedAllocations = [...allocations]
    updatedAllocations[allocationIndex] = updatedAllocation
    saveAllocations(updatedAllocations)
    
    toast.success('Allocation updated successfully')
    return updatedAllocation
  }

  const deleteAllocation = async (id: string): Promise<void> => {
    const updatedAllocations = allocations.filter(a => a.id !== id)
    saveAllocations(updatedAllocations)
    
    toast.success('Allocation deleted successfully')
  }

  const getAllocation = (id: string): Allocation | undefined => {
    return allocations.find(a => a.id === id)
  }

  const getAllocationsByProduct = (productId: string): Allocation[] => {
    return allocations.filter(a => a.product_id === productId)
  }

  const getAllocationsByResource = (resourceId: string): Allocation[] => {
    return allocations.filter(a => a.resource_id === resourceId)
  }

  const getAllocationsByPool = (poolId: string): Allocation[] => {
    return allocations.filter(a => a.pool_id === poolId)
  }

  const getAvailableAllocations = (): Allocation[] => {
    return allocations.filter(a => !a.stop_sell && a.capacity > 0)
  }

  const getPoolCapacity = (poolId: string, date: string): number => {
    const poolAllocations = allocations.filter(a => 
      a.pool_id === poolId && 
      new Date(a.start_date) <= new Date(date) && 
      new Date(a.end_date) >= new Date(date) && 
      !a.stop_sell
    )
    return poolAllocations.length > 0 ? Math.min(...poolAllocations.map(a => a.capacity)) : 0
  }

  return {
    data: allocations,
    isLoading,
    error,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    getAllocation,
    getAllocationsByProduct,
    getAllocationsByResource,
    getAllocationsByPool,
    getAvailableAllocations,
    getPoolCapacity
  }
}
