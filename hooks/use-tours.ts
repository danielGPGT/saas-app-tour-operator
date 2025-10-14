'use client'

import { useState, useEffect } from 'react'
import { Tour } from '@/types/domain'

const STORAGE_KEY = 'tour_operator_tours'

const mockTours: Tour[] = [
  {
    id: 'tour_1',
    name: 'Madrid City Break',
    code: 'MAD-CITY-4D',
    description: 'Explore the vibrant capital of Spain with visits to the Royal Palace, Prado Museum, and traditional tapas tour.',
    start_date: '2025-03-15',
    end_date: '2025-03-18',
    status: 'active',
    active: true,
    max_capacity: 25,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'tour_2',
    name: 'Barcelona Weekend Getaway',
    code: 'BCN-WEEKEND-3D',
    description: 'Discover the architectural wonders of Gaudí and enjoy the Mediterranean atmosphere.',
    start_date: '2025-04-12',
    end_date: '2025-04-14',
    status: 'published',
    active: true,
    max_capacity: 20,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'tour_3',
    name: 'Seville Cultural Experience',
    code: 'SEV-CULTURE-5D',
    description: 'Immerse yourself in Andalusian culture with flamenco shows, historic monuments, and local cuisine.',
    start_date: '2025-05-20',
    end_date: '2025-05-24',
    status: 'draft',
    active: true,
    max_capacity: 30,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'tour_4',
    name: 'Valencia Food & Wine Tour',
    code: 'VAL-FOOD-3D',
    description: 'Taste authentic paella, visit local wineries, and explore the futuristic City of Arts and Sciences.',
    start_date: '2025-06-10',
    end_date: '2025-06-12',
    status: 'completed',
    active: false,
    max_capacity: 15,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export function useTours() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTours()
  }, [])

  const loadTours = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setTours(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setTours(mockTours)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTours))
      }
    } catch (error) {
      console.error('Error loading tours:', error)
      setTours(mockTours)
    } finally {
      setLoading(false)
    }
  }

  const saveTours = (newTours: Tour[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTours))
      setTours(newTours)
    } catch (error) {
      console.error('Error saving tours:', error)
    }
  }

  const createTour = async (data: Partial<Tour>): Promise<Tour> => {
    const newTour: Tour = {
      id: `tour_${Date.now()}`,
      name: data.name || '',
      code: data.code || '',
      description: data.description || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      status: data.status || 'draft',
      active: data.active ?? true,
      max_capacity: data.max_capacity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedTours = [...tours, newTour]
    saveTours(updatedTours)
    return newTour
  }

  const updateTour = async (id: string, data: Partial<Tour>): Promise<Tour | null> => {
    const updatedTours = tours.map(tour => 
      tour.id === id 
        ? { ...tour, ...data, updated_at: new Date().toISOString() }
        : tour
    )
    
    saveTours(updatedTours)
    return updatedTours.find(tour => tour.id === id) || null
  }

  const deleteTour = async (id: string): Promise<boolean> => {
    const updatedTours = tours.filter(tour => tour.id !== id)
    saveTours(updatedTours)
    return true
  }

  const getTourById = (id: string): Tour | null => {
    return tours.find(tour => tour.id === id) || null
  }

  const getToursByStatus = (status: Tour['status']): Tour[] => {
    return tours.filter(tour => tour.status === status)
  }

  const getActiveTours = (): Tour[] => {
    return tours.filter(tour => tour.active)
  }

  return {
    data: tours,
    loading,
    createTour,
    updateTour,
    deleteTour,
    getTourById,
    getToursByStatus,
    getActiveTours
  }
}
