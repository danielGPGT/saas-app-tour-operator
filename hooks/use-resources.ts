'use client'

import { useState, useEffect } from 'react'
import { Resource } from '@/types/domain'
import { toast } from 'sonner'

// Mock data for development
const mockResources: Resource[] = [
  {
    id: 'resource_1',
    name: 'NH Madrid Centro',
    type: 'accommodation',
    tz: 'Europe/Madrid',
    location: 'Madrid, Spain',
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'resource_2',
    name: 'Santiago Bernabéu Stadium',
    type: 'event_ticket',
    tz: 'Europe/Madrid',
    location: 'Madrid, Spain',
    active: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'resource_3',
    name: 'Madrid Airport Transfers',
    type: 'transfer',
    tz: 'Europe/Madrid',
    location: 'Madrid, Spain',
    active: true,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z'
  },
  {
    id: 'resource_4',
    name: 'VIP Lounge Terminal 4',
    type: 'lounge',
    tz: 'Europe/Madrid',
    location: 'Madrid Airport, Spain',
    active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'resource_5',
    name: 'Hotel Ritz Paris',
    type: 'accommodation',
    tz: 'Europe/Paris',
    location: 'Paris, France',
    active: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'resource_6',
    name: 'Louvre Museum',
    type: 'event_ticket',
    tz: 'Europe/Paris',
    location: 'Paris, France',
    active: false,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z'
  }
]

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load resources from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('resources')
      if (stored) {
        setResources(JSON.parse(stored))
      } else {
        // Initialize with mock data
        setResources(mockResources)
        localStorage.setItem('resources', JSON.stringify(mockResources))
      }
    } catch (err) {
      setError(err as Error)
      setResources(mockResources) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveResources = (newResources: Resource[]) => {
    try {
      localStorage.setItem('resources', JSON.stringify(newResources))
      setResources(newResources)
    } catch (err) {
      console.error('Failed to save resources:', err)
      throw new Error('Failed to save resources')
    }
  }

  const createResource = async (data: Partial<Resource>): Promise<Resource> => {
    const newResource: Resource = {
      id: `resource_${Date.now()}`,
      name: data.name || '',
      type: data.type || 'accommodation',
      tz: data.tz || 'Europe/London',
      location: data.location,
      active: data.active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedResources = [...resources, newResource]
    saveResources(updatedResources)
    
    toast.success('Resource created successfully')
    return newResource
  }

  const updateResource = async (id: string, data: Partial<Resource>): Promise<Resource> => {
    const resourceIndex = resources.findIndex(r => r.id === id)
    if (resourceIndex === -1) {
      throw new Error('Resource not found')
    }

    const updatedResource: Resource = {
      ...resources[resourceIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    const updatedResources = [...resources]
    updatedResources[resourceIndex] = updatedResource
    saveResources(updatedResources)
    
    toast.success('Resource updated successfully')
    return updatedResource
  }

  const deleteResource = async (id: string): Promise<void> => {
    const updatedResources = resources.filter(r => r.id !== id)
    saveResources(updatedResources)
    
    toast.success('Resource deleted successfully')
  }

  const getResource = (id: string): Resource | undefined => {
    return resources.find(r => r.id === id)
  }

  const getResourcesByType = (type: string): Resource[] => {
    return resources.filter(r => r.type === type)
  }

  const getActiveResources = (): Resource[] => {
    return resources.filter(r => r.active)
  }

  return {
    data: resources,
    isLoading,
    error,
    createResource,
    updateResource,
    deleteResource,
    getResource,
    getResourcesByType,
    getActiveResources
  }
}
