'use client'

import { useState, useEffect } from 'react'
import { Hold } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockHolds: Hold[] = [
  {
    id: 'hold_1',
    product_id: 'product_1',
    contract_id: 'contract_1',
    start_date: '2024-05-18',
    end_date: '2024-05-20',
    qty: 1,
    ttl_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'hold_2',
    product_id: 'product_2',
    contract_id: 'contract_1',
    start_date: '2024-05-25',
    end_date: '2024-05-27',
    qty: 2,
    ttl_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'hold_3',
    product_id: 'product_4',
    contract_id: 'contract_2',
    start_date: '2024-05-28',
    end_date: '2024-05-28',
    qty: 4,
    ttl_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (expired)
    status: 'EXPIRED',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
    updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'hold_4',
    product_id: 'product_6',
    contract_id: 'contract_1',
    start_date: '2024-06-01',
    end_date: '2024-06-01',
    qty: 1,
    ttl_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago (expired)
    status: 'CONVERTED',
    created_at: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(), // 29 hours ago
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago (converted)
  }
]

export function useHolds() {
  const [holds, setHolds] = useState<Hold[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load holds from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('holds')
      if (stored) {
        setHolds(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setHolds(mockHolds)
        localStorage.setItem('holds', JSON.stringify(mockHolds))
      }
    } catch (err) {
      setError(err as Error)
      setHolds(mockHolds)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveHolds = (newHolds: Hold[]) => {
    try {
      localStorage.setItem('holds', JSON.stringify(newHolds))
      setHolds(newHolds)
    } catch (err) {
      console.error('Failed to save holds:', err)
      throw new Error('Failed to save holds')
    }
  }

  const createHold = async (data: Partial<Hold>, ttlHours: number = 24): Promise<Hold> => {
    const ttlAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000)
    
    const newHold: Hold = {
      id: `hold_${Date.now()}`,
      product_id: data.product_id || '',
      contract_id: data.contract_id || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      qty: data.qty || 1,
      ttl_at: ttlAt.toISOString(),
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedHolds = [...holds, newHold]
    saveHolds(updatedHolds)
    
    toast.success(`Hold created successfully (expires in ${ttlHours}h)`)
    return newHold
  }

  const updateHold = async (id: string, data: Partial<Hold>): Promise<Hold> => {
    const holdIndex = holds.findIndex(h => h.id === id)
    if (holdIndex === -1) {
      throw new Error('Hold not found')
    }

    const updatedHold: Hold = {
      ...holds[holdIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedHolds = [...holds]
    updatedHolds[holdIndex] = updatedHold
    saveHolds(updatedHolds)
    
    toast.success('Hold updated successfully')
    return updatedHold
  }

  const convertHoldToBooking = async (holdId: string): Promise<void> => {
    await updateHold(holdId, { status: 'CONVERTED' })
  }

  const releaseHold = async (id: string): Promise<void> => {
    await updateHold(id, { status: 'EXPIRED' })
  }

  const expireHold = async (id: string): Promise<void> => {
    await updateHold(id, { status: 'EXPIRED' })
  }

  const getHold = (id: string): Hold | undefined => {
    return holds.find(h => h.id === id)
  }

  const getActiveHolds = (): Hold[] => {
    return holds.filter(h => h.status === 'ACTIVE')
  }

  const getExpiredHolds = (): Hold[] => {
    return holds.filter(h => h.status === 'EXPIRED')
  }

  const getConvertedHolds = (): Hold[] => {
    return holds.filter(h => h.status === 'CONVERTED')
  }

  const getHoldsByProduct = (productId: string): Hold[] => {
    return holds.filter(h => h.product_id === productId)
  }

  const getHoldsByContract = (contractId: string): Hold[] => {
    return holds.filter(h => h.contract_id === contractId)
  }

  // Check for expired holds and update their status
  const checkExpiredHolds = () => {
    const now = new Date()
    const updatedHolds = holds.map(hold => {
      if (hold.status === 'ACTIVE' && new Date(hold.ttl_at) <= now) {
        return { ...hold, status: 'EXPIRED' as const, updated_at: new Date().toISOString() }
      }
      return hold
    })

    const hasChanges = updatedHolds.some((hold, index) => hold.status !== holds[index].status)
    if (hasChanges) {
      saveHolds(updatedHolds)
    }
  }

  // Run expiration check every minute
  useEffect(() => {
    const interval = setInterval(checkExpiredHolds, 60000)
    return () => clearInterval(interval)
  }, [holds])

  return {
    data: holds,
    isLoading,
    error,
    createHold,
    updateHold,
    convertHoldToBooking,
    releaseHold,
    expireHold,
    getHold,
    getActiveHolds,
    getExpiredHolds,
    getConvertedHolds,
    getHoldsByProduct,
    getHoldsByContract,
    checkExpiredHolds
  }
}
