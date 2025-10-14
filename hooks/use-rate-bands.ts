'use client'

import { useState, useEffect } from 'react'
import { RateBand } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockRateBands: RateBand[] = [
  {
    id: 'rate_band_1',
    product_id: 'product_1',
    contract_id: 'contract_1',
    band_start: '2025-05-01',
    band_end: '2025-05-31',
    weekday_mask: 127, // All days
    currency: 'EUR',
    active: true,
    pricing_meta: {
      strategy: 'per_occupancy',
      prices: {
        single: 80,
        double: 120,
        triple: 150,
        quad: 180
      },
      board: {
        included: 'BB',
        included_cost_pppn: 15
      },
      min_stay: 1,
      max_stay: 14,
      pool_id: 'may-2025-double'
    },
    markup: {
      b2c_pct: 60,
      b2b_pct: 20
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'rate_band_2',
    product_id: 'product_1',
    contract_id: 'contract_1',
    band_start: '2024-06-01',
    band_end: '2024-08-31',
    weekday_mask: 127, // All days
    currency: 'EUR',
    active: true,
    pricing_meta: {
      strategy: 'per_occupancy',
      prices: {
        single: 100,
        double: 150,
        triple: 180,
        quad: 220
      },
      board: {
        included: 'BB',
        included_cost_pppn: 15
      },
      min_stay: 1,
      max_stay: 14,
      pool_id: 'summer-2025-double'
    },
    markup: {
      b2c_pct: 70,
      b2b_pct: 25
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'rate_band_3',
    product_id: 'product_2',
    contract_id: 'contract_1',
    band_start: '2025-05-01',
    band_end: '2025-05-31',
    weekday_mask: 31, // Monday to Friday
    currency: 'EUR',
    active: true,
    pricing_meta: {
      strategy: 'per_occupancy',
      prices: {
        double: 140,
        triple: 170
      },
      board: {
        included: 'BB',
        included_cost_pppn: 15
      },
      min_stay: 1,
      max_stay: 7
    },
    markup: {
      b2c_pct: 65,
      b2b_pct: 22
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'rate_band_4',
    product_id: 'product_4',
    contract_id: 'contract_2',
    band_start: '2025-05-01',
    band_end: '2025-05-31',
    weekday_mask: 127, // All days
    currency: 'EUR',
    active: true,
    pricing_meta: {
      strategy: 'per_occupancy',
      prices: {
        single: 25
      },
      min_stay: 1,
      max_stay: 1
    },
    markup: {
      b2c_pct: 40,
      b2b_pct: 15
    },
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'rate_band_5',
    product_id: 'product_5',
    contract_id: 'contract_2',
    band_start: '2025-05-01',
    band_end: '2025-05-31',
    weekday_mask: 127, // All days
    currency: 'EUR',
    active: true,
    pricing_meta: {
      strategy: 'per_occupancy',
      prices: {
        single: 75
      },
      min_stay: 1,
      max_stay: 1
    },
    markup: {
      b2c_pct: 50,
      b2b_pct: 18
    },
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'rate_band_6',
    product_id: 'product_6',
    contract_id: 'contract_1',
    band_start: '2025-05-01',
    band_end: '2025-05-31',
    weekday_mask: 127, // All days
    currency: 'EUR',
    active: true,
    pricing_meta: {
      strategy: 'per_occupancy',
      prices: {
        single: 45
      },
      min_stay: 1,
      max_stay: 1
    },
    markup: {
      b2c_pct: 35,
      b2b_pct: 12
    },
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  }
]

export function useRateBands() {
  const [rateBands, setRateBands] = useState<RateBand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load rate bands from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rateBands')
      if (stored) {
        setRateBands(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setRateBands(mockRateBands)
        localStorage.setItem('rateBands', JSON.stringify(mockRateBands))
      }
    } catch (err) {
      setError(err as Error)
      setRateBands(mockRateBands) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveRateBands = (newRateBands: RateBand[]) => {
    try {
      localStorage.setItem('rateBands', JSON.stringify(newRateBands))
      setRateBands(newRateBands)
    } catch (err) {
      console.error('Failed to save rate bands:', err)
      throw new Error('Failed to save rate bands')
    }
  }

  const createRateBand = async (data: Partial<RateBand>): Promise<RateBand> => {
    const newRateBand: RateBand = {
      id: `rate_band_${Date.now()}`,
      product_id: data.product_id || '',
      contract_id: data.contract_id || '',
      band_start: data.band_start || '',
      band_end: data.band_end || '',
      weekday_mask: data.weekday_mask || 127,
      currency: data.currency || 'EUR',
      active: data.active ?? true,
      pricing_meta: data.pricing_meta || {
        strategy: 'per_occupancy',
        prices: {},
        board: undefined,
        min_stay: undefined,
        max_stay: undefined,
        pool_id: undefined
      },
      markup: data.markup || {
        b2c_pct: 0,
        b2b_pct: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedRateBands = [...rateBands, newRateBand]
    saveRateBands(updatedRateBands)
    
    toast.success('Rate band created successfully')
    return newRateBand
  }

  const updateRateBand = async (id: string, data: Partial<RateBand>): Promise<RateBand> => {
    const rateBandIndex = rateBands.findIndex(rb => rb.id === id)
    if (rateBandIndex === -1) {
      throw new Error('Rate band not found')
    }

    const updatedRateBand: RateBand = {
      ...rateBands[rateBandIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedRateBands = [...rateBands]
    updatedRateBands[rateBandIndex] = updatedRateBand
    saveRateBands(updatedRateBands)
    
    toast.success('Rate band updated successfully')
    return updatedRateBand
  }

  const deleteRateBand = async (id: string): Promise<void> => {
    const updatedRateBands = rateBands.filter(rb => rb.id !== id)
    saveRateBands(updatedRateBands)
    
    toast.success('Rate band deleted successfully')
  }

  const getRateBand = (id: string): RateBand | undefined => {
    return rateBands.find(rb => rb.id === id)
  }

  const getRateBandsByProduct = (productId: string): RateBand[] => {
    return rateBands.filter(rb => rb.product_id === productId)
  }

  const getRateBandsByContract = (contractId: string): RateBand[] => {
    return rateBands.filter(rb => rb.contract_id === contractId)
  }

  const getActiveRateBands = (): RateBand[] => {
    return rateBands.filter(rb => rb.active)
  }

  return {
    data: rateBands,
    isLoading,
    error,
    createRateBand,
    updateRateBand,
    deleteRateBand,
    getRateBand,
    getRateBandsByProduct,
    getRateBandsByContract,
    getActiveRateBands
  }
}
