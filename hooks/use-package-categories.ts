'use client'

import { useState, useEffect } from 'react'
import { PackageCategory } from '@/types/domain'

const STORAGE_KEY = 'tour_operator_package_categories'

const mockPackageCategories: PackageCategory[] = [
  {
    id: 'cat_1',
    tour_id: 'tour_1',
    name: 'Grandstand Packages',
    description: 'Core spectator bundles with grandstand seating',
    color_tag: '#3B82F6',
    default_markup_b2c: 25,
    default_markup_b2b: 15,
    visibility_b2c: true,
    visibility_b2b: true,
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat_2',
    tour_id: 'tour_1',
    name: 'VIP Packages',
    description: 'Premium experiences with exclusive access',
    color_tag: '#10B981',
    default_markup_b2c: 40,
    default_markup_b2b: 25,
    visibility_b2c: true,
    visibility_b2b: true,
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat_3',
    tour_id: 'tour_2',
    name: 'Hospitality Packages',
    description: 'Corporate hospitality and entertainment packages',
    color_tag: '#8B5CF6',
    default_markup_b2c: 35,
    default_markup_b2b: 20,
    visibility_b2c: false,
    visibility_b2b: true,
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat_4',
    tour_id: 'tour_2',
    name: 'Budget Packages',
    description: 'Affordable options for cost-conscious travelers',
    color_tag: '#F59E0B',
    default_markup_b2c: 15,
    default_markup_b2b: 10,
    visibility_b2c: true,
    visibility_b2b: true,
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export function usePackageCategories() {
  const [categories, setCategories] = useState<PackageCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCategories(JSON.parse(stored))
      } else {
        setCategories(mockPackageCategories)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPackageCategories))
      }
    } catch (error) {
      console.error('Error loading package categories:', error)
      setCategories(mockPackageCategories)
    } finally {
      setLoading(false)
    }
  }

  const saveCategories = (newCategories: PackageCategory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories))
      setCategories(newCategories)
    } catch (error) {
      console.error('Error saving package categories:', error)
    }
  }

  const createCategory = async (data: Partial<PackageCategory>): Promise<PackageCategory> => {
    const newCategory: PackageCategory = {
      id: `cat_${Date.now()}`,
      tour_id: data.tour_id || '',
      name: data.name || '',
      description: data.description || '',
      color_tag: data.color_tag || '#6B7280',
      default_markup_b2c: data.default_markup_b2c,
      default_markup_b2b: data.default_markup_b2b,
      visibility_b2c: data.visibility_b2c ?? true,
      visibility_b2b: data.visibility_b2b ?? true,
      active: data.active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedCategories = [...categories, newCategory]
    saveCategories(updatedCategories)
    return newCategory
  }

  const updateCategory = async (id: string, data: Partial<PackageCategory>): Promise<PackageCategory | null> => {
    const updatedCategories = categories.map(category => 
      category.id === id 
        ? { ...category, ...data, updated_at: new Date().toISOString() }
        : category
    )
    
    saveCategories(updatedCategories)
    return updatedCategories.find(category => category.id === id) || null
  }

  const deleteCategory = async (id: string): Promise<boolean> => {
    const updatedCategories = categories.filter(category => category.id !== id)
    saveCategories(updatedCategories)
    return true
  }

  const getCategoriesByTour = (tourId: string): PackageCategory[] => {
    return categories.filter(category => category.tour_id === tourId)
  }

  const getCategoryById = (id: string): PackageCategory | null => {
    return categories.find(category => category.id === id) || null
  }

  const getActiveCategories = (tourId?: string): PackageCategory[] => {
    return categories.filter(category => 
      category.active && (tourId ? category.tour_id === tourId : true)
    )
  }

  return {
    data: categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByTour,
    getCategoryById,
    getActiveCategories
  }
}
