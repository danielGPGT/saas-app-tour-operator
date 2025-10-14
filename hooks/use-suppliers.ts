'use client'

import { useState, useEffect } from 'react'
import { Supplier } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockSuppliers: Supplier[] = [
  {
    id: 'supplier_1',
    name: 'NH Hotels',
    type: 'hotel',
    default_currency: 'EUR',
    active: true,
    defaults: {
      commission_pct: 10,
      supplier_vat_pct: 21,
      fees: [
        {
          code: 'RESORT_FEE',
          mode: 'per_room_per_night',
          amount: 15,
          payable: 'property'
        }
      ],
      markup: {
        b2c_pct: 60,
        b2b_pct: 20
      }
    },
    payment_terms: 'Net 30',
    bank: {
      iban: 'ES9121000418450200051332',
      swift: 'CAIXESBBXXX',
      account_name: 'NH Hotels Group',
      currency: 'EUR'
    },
    tax: {
      vat_number: 'ES12345678Z',
      country: 'Spain'
    },
    emails: [
      {
        name: 'Sales Team',
        email: 'sales@nh-hotels.com',
        role: 'Sales Manager'
      }
    ],
    phones: [
      {
        label: 'Main',
        number: '+34 91 398 4646'
      }
    ],
    documents: [
      {
        name: 'Contract Template',
        url: 'https://example.com/nh-contract.pdf'
      }
    ],
    notes: 'Premium hotel chain with excellent locations',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'supplier_2',
    name: 'BookingWholesale',
    type: 'wholesaler',
    default_currency: 'EUR',
    active: true,
    defaults: {
      commission_pct: 15,
      supplier_vat_pct: 0,
      fees: [],
      markup: {
        b2c_pct: 40,
        b2b_pct: 15
      }
    },
    payment_terms: 'Prepaid',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'internal_procurement',
    name: 'Internal Procurement',
    type: 'virtual',
    default_currency: 'EUR',
    active: true,
    defaults: {
      commission_pct: 0,
      supplier_vat_pct: 0,
      fees: [],
      markup: {
        b2c_pct: 50,
        b2b_pct: 30
      }
    },
    payment_terms: 'Buy-to-Order',
    notes: 'Virtual supplier for buy-to-order items. Used when no actual supplier contract exists yet.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load suppliers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('suppliers')
      if (stored) {
        setSuppliers(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setSuppliers(mockSuppliers)
        localStorage.setItem('suppliers', JSON.stringify(mockSuppliers))
      }
    } catch (err) {
      setError(err as Error)
      setSuppliers(mockSuppliers) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSuppliers = (newSuppliers: Supplier[]) => {
    try {
      localStorage.setItem('suppliers', JSON.stringify(newSuppliers))
      setSuppliers(newSuppliers)
    } catch (err) {
      console.error('Failed to save suppliers:', err)
      throw new Error('Failed to save suppliers')
    }
  }

  const createSupplier = async (data: Partial<Supplier>): Promise<Supplier> => {
    const newSupplier: Supplier = {
      id: `supplier_${Date.now()}`,
      name: data.name || '',
      type: data.type || 'other',
      default_currency: data.default_currency || 'EUR',
      active: data.active ?? true,
      defaults: data.defaults,
      payment_terms: data.payment_terms,
      bank: data.bank,
      tax: data.tax,
      emails: data.emails,
      phones: data.phones,
      documents: data.documents,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedSuppliers = [...suppliers, newSupplier]
    saveSuppliers(updatedSuppliers)
    
    toast.success('Supplier created successfully')
    return newSupplier
  }

  const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const supplierIndex = suppliers.findIndex(s => s.id === id)
    if (supplierIndex === -1) {
      throw new Error('Supplier not found')
    }

    const updatedSupplier: Supplier = {
      ...suppliers[supplierIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedSuppliers = [...suppliers]
    updatedSuppliers[supplierIndex] = updatedSupplier
    saveSuppliers(updatedSuppliers)
    
    toast.success('Supplier updated successfully')
    return updatedSupplier
  }

  const deleteSupplier = async (id: string): Promise<void> => {
    const updatedSuppliers = suppliers.filter(s => s.id !== id)
    saveSuppliers(updatedSuppliers)
    
    toast.success('Supplier deleted successfully')
  }

  const getSupplier = (id: string): Supplier | undefined => {
    return suppliers.find(s => s.id === id)
  }

  return {
    data: suppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplier
  }
}
