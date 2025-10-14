'use client'

import { useState, useEffect } from 'react'
import { Contract } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockContracts: Contract[] = [
  {
    id: 'contract_1',
    supplier_id: 'supplier_1',
    resource_id: 'hotel_nh_madrid',
    currency: 'EUR',
    tz: 'Europe/Madrid',
    valid_from: '2024-01-01',
    valid_to: '2024-12-31',
    active: true,
    fulfilment: 'instant',
    sell_cutoff_hours: 24,
    sla_hours: 2,
    economics: {
      commission_pct: 10,
      supplier_vat_pct: 21,
      fees: [
        {
          code: 'RESORT_FEE',
          mode: 'per_room_per_night',
          amount: 15,
          payable: 'property'
        }
      ]
    },
    plugin_defaults: {
      included_board: 'BB',
      base_occupancy: 2,
      max_occupancy: 4
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'contract_2',
    supplier_id: 'supplier_2',
    resource_id: 'wholesaler_booking',
    currency: 'EUR',
    tz: 'Europe/London',
    valid_from: '2024-01-01',
    valid_to: '2024-12-31',
    active: true,
    fulfilment: 'on_request',
    sell_cutoff_hours: 48,
    sla_hours: 4,
    economics: {
      commission_pct: 15,
      supplier_vat_pct: 0,
      fees: []
    },
    plugin_defaults: {
      included_board: 'RO',
      base_occupancy: 2,
      max_occupancy: 4
    },
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  }
]

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load contracts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('contracts')
      if (stored) {
        setContracts(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setContracts(mockContracts)
        localStorage.setItem('contracts', JSON.stringify(mockContracts))
      }
    } catch (err) {
      setError(err as Error)
      setContracts(mockContracts) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveContracts = (newContracts: Contract[]) => {
    try {
      localStorage.setItem('contracts', JSON.stringify(newContracts))
      setContracts(newContracts)
    } catch (err) {
      console.error('Failed to save contracts:', err)
      throw new Error('Failed to save contracts')
    }
  }

  const createContract = async (data: Partial<Contract>): Promise<Contract> => {
    const newContract: Contract = {
      id: `contract_${Date.now()}`,
      supplier_id: data.supplier_id || '',
      resource_id: data.resource_id || '',
      currency: data.currency || 'EUR',
      tz: data.tz || 'Europe/London',
      valid_from: data.valid_from || '',
      valid_to: data.valid_to || '',
      active: data.active ?? true,
      fulfilment: data.fulfilment || 'on_request',
      sell_cutoff_hours: data.sell_cutoff_hours,
      sla_hours: data.sla_hours,
      economics: data.economics || {
        commission_pct: 0,
        supplier_vat_pct: 0,
        fees: []
      },
      plugin_defaults: data.plugin_defaults,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedContracts = [...contracts, newContract]
    saveContracts(updatedContracts)
    
    toast.success('Contract created successfully')
    return newContract
  }

  const updateContract = async (id: string, data: Partial<Contract>): Promise<Contract> => {
    const contractIndex = contracts.findIndex(c => c.id === id)
    if (contractIndex === -1) {
      throw new Error('Contract not found')
    }

    const updatedContract: Contract = {
      ...contracts[contractIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedContracts = [...contracts]
    updatedContracts[contractIndex] = updatedContract
    saveContracts(updatedContracts)
    
    toast.success('Contract updated successfully')
    return updatedContract
  }

  const deleteContract = async (id: string): Promise<void> => {
    const updatedContracts = contracts.filter(c => c.id !== id)
    saveContracts(updatedContracts)
    
    toast.success('Contract deleted successfully')
  }

  const getContract = (id: string): Contract | undefined => {
    return contracts.find(c => c.id === id)
  }

  const getContractsBySupplier = (supplierId: string): Contract[] => {
    return contracts.filter(c => c.supplier_id === supplierId)
  }

  const getContractsByResource = (resourceId: string): Contract[] => {
    return contracts.filter(c => c.resource_id === resourceId)
  }

  return {
    data: contracts,
    isLoading,
    error,
    createContract,
    updateContract,
    deleteContract,
    getContract,
    getContractsBySupplier,
    getContractsByResource
  }
}
