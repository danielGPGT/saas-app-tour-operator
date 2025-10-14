'use client'

import { useState, useEffect } from 'react'
import { Booking, BookingPricingSnapshot } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockBookings: Booking[] = [
  {
    id: 'booking_1',
    product_id: 'product_1',
    contract_id: 'contract_1',
    start_date: '2024-05-15',
    end_date: '2024-05-17',
    qty: 1,
    status: 'CONFIRMED',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'booking_2',
    product_id: 'product_2',
    contract_id: 'contract_1',
    start_date: '2024-05-20',
    end_date: '2024-05-22',
    qty: 1,
    status: 'CONFIRMED',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z'
  },
  {
    id: 'booking_3',
    product_id: 'product_4',
    contract_id: 'contract_2',
    start_date: '2024-05-25',
    end_date: '2024-05-25',
    qty: 2,
    status: 'CONFIRMED',
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z'
  },
  {
    id: 'booking_4',
    product_id: 'product_6',
    contract_id: 'contract_1',
    start_date: '2024-05-30',
    end_date: '2024-05-30',
    qty: 1,
    status: 'CANCELLED',
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-19T10:00:00Z'
  }
]

const mockPricingSnapshots: BookingPricingSnapshot[] = [
  {
    id: 'snapshot_1',
    booking_id: 'booking_1',
    currency: 'EUR',
    contract_currency: 'EUR',
    fx_rate: 1.0,
    room_subtotal_net: 240,
    supplier_commission: 24,
    supplier_vat: 45.36,
    fees_included: 30,
    fees_pay_at_property: 0,
    markup_amount: 140.64,
    total_due_now: 432,
    breakdown: {
      dates: ['2024-05-15', '2024-05-16'],
      occKey: 'double',
      boardCostPppn: 15
    },
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'snapshot_2',
    booking_id: 'booking_2',
    currency: 'EUR',
    contract_currency: 'EUR',
    fx_rate: 1.0,
    room_subtotal_net: 300,
    supplier_commission: 30,
    supplier_vat: 56.7,
    fees_included: 30,
    fees_pay_at_property: 0,
    markup_amount: 175.8,
    total_due_now: 532.5,
    breakdown: {
      dates: ['2024-05-20', '2024-05-21'],
      occKey: 'double',
      boardCostPppn: 15
    },
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    id: 'snapshot_3',
    booking_id: 'booking_3',
    currency: 'EUR',
    contract_currency: 'EUR',
    fx_rate: 1.0,
    room_subtotal_net: 50,
    supplier_commission: 7.5,
    supplier_vat: 8.475,
    fees_included: 0,
    fees_pay_at_property: 0,
    markup_amount: 20.025,
    total_due_now: 70,
    breakdown: {
      dates: ['2024-05-25'],
      occKey: 'single',
      boardCostPppn: 0
    },
    created_at: '2024-01-17T10:00:00Z'
  },
  {
    id: 'snapshot_4',
    booking_id: 'booking_4',
    currency: 'EUR',
    contract_currency: 'EUR',
    fx_rate: 1.0,
    room_subtotal_net: 90,
    supplier_commission: 13.5,
    supplier_vat: 15.255,
    fees_included: 0,
    fees_pay_at_property: 0,
    markup_amount: 36.045,
    total_due_now: 126,
    breakdown: {
      dates: ['2024-05-30'],
      occKey: 'single',
      boardCostPppn: 0
    },
    created_at: '2024-01-18T10:00:00Z'
  }
]

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pricingSnapshots, setPricingSnapshots] = useState<BookingPricingSnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load bookings from localStorage on mount
  useEffect(() => {
    try {
      const storedBookings = localStorage.getItem('bookings')
      const storedSnapshots = localStorage.getItem('pricingSnapshots')
      
      if (storedBookings && storedSnapshots) {
        setBookings(JSON.parse(storedBookings))
        setPricingSnapshots(JSON.parse(storedSnapshots))
      } else {
        // Initialize with mock data
        setBookings(mockBookings)
        setPricingSnapshots(mockPricingSnapshots)
        localStorage.setItem('bookings', JSON.stringify(mockBookings))
        localStorage.setItem('pricingSnapshots', JSON.stringify(mockPricingSnapshots))
      }
    } catch (err) {
      setError(err as Error)
      setBookings(mockBookings)
      setPricingSnapshots(mockPricingSnapshots)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveBookings = (newBookings: Booking[]) => {
    try {
      localStorage.setItem('bookings', JSON.stringify(newBookings))
      setBookings(newBookings)
    } catch (err) {
      console.error('Failed to save bookings:', err)
      throw new Error('Failed to save bookings')
    }
  }

  const savePricingSnapshots = (newSnapshots: BookingPricingSnapshot[]) => {
    try {
      localStorage.setItem('pricingSnapshots', JSON.stringify(newSnapshots))
      setPricingSnapshots(newSnapshots)
    } catch (err) {
      console.error('Failed to save pricing snapshots:', err)
      throw new Error('Failed to save pricing snapshots')
    }
  }

  const createBooking = async (data: Partial<Booking>, pricingSnapshot: BookingPricingSnapshot): Promise<Booking> => {
    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      product_id: data.product_id || '',
      contract_id: data.contract_id || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      qty: data.qty || 1,
      status: data.status || 'CONFIRMED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const newSnapshot: BookingPricingSnapshot = {
      ...pricingSnapshot,
      id: `snapshot_${Date.now()}`,
      booking_id: newBooking.id,
      created_at: new Date().toISOString()
    }

    const updatedBookings = [...bookings, newBooking]
    const updatedSnapshots = [...pricingSnapshots, newSnapshot]
    
    saveBookings(updatedBookings)
    savePricingSnapshots(updatedSnapshots)
    
    toast.success('Booking created successfully')
    return newBooking
  }

  const updateBooking = async (id: string, data: Partial<Booking>): Promise<Booking> => {
    const bookingIndex = bookings.findIndex(b => b.id === id)
    if (bookingIndex === -1) {
      throw new Error('Booking not found')
    }

    const updatedBooking: Booking = {
      ...bookings[bookingIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedBookings = [...bookings]
    updatedBookings[bookingIndex] = updatedBooking
    saveBookings(updatedBookings)
    
    toast.success('Booking updated successfully')
    return updatedBooking
  }

  const cancelBooking = async (id: string): Promise<void> => {
    await updateBooking(id, { status: 'CANCELLED' })
  }

  const getBooking = (id: string): Booking | undefined => {
    return bookings.find(b => b.id === id)
  }

  const getBookingWithPricing = (id: string) => {
    const booking = getBooking(id)
    const pricing = pricingSnapshots.find(s => s.booking_id === id)
    return booking ? { ...booking, pricing_snapshot: pricing } : undefined
  }

  const getBookingsByProduct = (productId: string): Booking[] => {
    return bookings.filter(b => b.product_id === productId)
  }

  const getBookingsByContract = (contractId: string): Booking[] => {
    return bookings.filter(b => b.contract_id === contractId)
  }

  const getConfirmedBookings = (): Booking[] => {
    return bookings.filter(b => b.status === 'CONFIRMED')
  }

  const getCancelledBookings = (): Booking[] => {
    return bookings.filter(b => b.status === 'CANCELLED')
  }

  return {
    data: bookings,
    pricingSnapshots,
    isLoading,
    error,
    createBooking,
    updateBooking,
    cancelBooking,
    getBooking,
    getBookingWithPricing,
    getBookingsByProduct,
    getBookingsByContract,
    getConfirmedBookings,
    getCancelledBookings
  }
}
