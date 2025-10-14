'use client'

import { useState, useEffect } from 'react'
import { Package, PackageComponent } from '@/types/domain'

const STORAGE_KEY = 'tour_operator_packages'

const mockPackages: Package[] = [
  {
    id: 'pkg_1',
    tour_id: 'tour_1',
    category_id: 'cat_1',
    name: 'Grandstand Weekend Experience',
    description: '3-day grandstand package with accommodation and race tickets',
    status: 'active',
    visibility_b2c: true,
    visibility_b2b: true,
    markup_b2c_override: 30,
    markup_b2b_override: 18,
    components: [
      {
        id: 'comp_1',
        package_id: 'pkg_1',
        product_id: 'product_1',
        contract_id: 'contract_1',
        selection_type: 'required',
        date_scope: 'tour_nights',
        markup_override: 25,
        notes: 'Main accommodation for the weekend',
        sort_order: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'comp_2',
        package_id: 'pkg_1',
        product_id: 'product_2',
        contract_id: 'contract_2',
        selection_type: 'required',
        date_scope: 'single_date',
        markup_override: 20,
        notes: 'Grandstand tickets for all race days',
        sort_order: 2,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'pkg_2',
    tour_id: 'tour_1',
    category_id: 'cat_2',
    name: 'Ultimate VIP Experience',
    description: 'Premium 4-day VIP package with exclusive access and luxury accommodation',
    status: 'active',
    visibility_b2c: true,
    visibility_b2b: true,
    components: [
      {
        id: 'comp_3',
        package_id: 'pkg_2',
        product_id: 'product_3',
        contract_id: 'contract_3',
        selection_type: 'required',
        date_scope: 'tour_nights',
        markup_override: 50,
        notes: 'Luxury suite accommodation',
        sort_order: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'comp_4',
        package_id: 'pkg_2',
        product_id: 'product_4',
        contract_id: 'contract_4',
        selection_type: 'required',
        date_scope: 'single_date',
        markup_override: 40,
        notes: 'VIP hospitality access',
        sort_order: 2,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'comp_5',
        package_id: 'pkg_2',
        product_id: 'product_5',
        contract_id: 'contract_5',
        selection_type: 'optional',
        date_scope: 'single_date',
        markup_override: 35,
        notes: 'Airport transfers (optional)',
        sort_order: 3,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'pkg_3',
    tour_id: 'tour_2',
    category_id: 'cat_3',
    name: 'Corporate Hospitality Package',
    description: 'Business-focused package for corporate entertainment',
    status: 'draft',
    visibility_b2c: false,
    visibility_b2b: true,
    components: [
      {
        id: 'comp_6',
        package_id: 'pkg_3',
        product_id: 'product_6',
        contract_id: 'contract_6',
        selection_type: 'required',
        date_scope: 'tour_nights',
        markup_override: 30,
        notes: 'Business hotel accommodation',
        sort_order: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPackages(JSON.parse(stored))
      } else {
        setPackages(mockPackages)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPackages))
      }
    } catch (error) {
      console.error('Error loading packages:', error)
      setPackages(mockPackages)
    } finally {
      setLoading(false)
    }
  }

  const savePackages = (newPackages: Package[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPackages))
      setPackages(newPackages)
    } catch (error) {
      console.error('Error saving packages:', error)
    }
  }

  const createPackage = async (data: Partial<Package>): Promise<Package> => {
    const newPackage: Package = {
      id: `pkg_${Date.now()}`,
      tour_id: data.tour_id || '',
      category_id: data.category_id || '',
      name: data.name || '',
      description: data.description || '',
      status: data.status || 'draft',
      visibility_b2c: data.visibility_b2c ?? true,
      visibility_b2b: data.visibility_b2b ?? true,
      markup_b2c_override: data.markup_b2c_override,
      markup_b2b_override: data.markup_b2b_override,
      components: data.components || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedPackages = [...packages, newPackage]
    savePackages(updatedPackages)
    return newPackage
  }

  const updatePackage = async (id: string, data: Partial<Package>): Promise<Package | null> => {
    const updatedPackages = packages.map(pkg => 
      pkg.id === id 
        ? { ...pkg, ...data, updated_at: new Date().toISOString() }
        : pkg
    )
    
    savePackages(updatedPackages)
    return updatedPackages.find(pkg => pkg.id === id) || null
  }

  const deletePackage = async (id: string): Promise<boolean> => {
    const updatedPackages = packages.filter(pkg => pkg.id !== id)
    savePackages(updatedPackages)
    return true
  }

  const getPackagesByTour = (tourId: string): Package[] => {
    return packages.filter(pkg => pkg.tour_id === tourId)
  }

  const getPackagesByCategory = (categoryId: string): Package[] => {
    return packages.filter(pkg => pkg.category_id === categoryId)
  }

  const getPackageById = (id: string): Package | null => {
    return packages.find(pkg => pkg.id === id) || null
  }

  const addComponent = async (packageId: string, component: Partial<PackageComponent>): Promise<Package | null> => {
    const pkg = packages.find(p => p.id === packageId)
    if (!pkg) return null

    const newComponent: PackageComponent = {
      id: `comp_${Date.now()}`,
      package_id: packageId,
      product_id: component.product_id || '',
      contract_id: component.contract_id,
      selection_type: component.selection_type || 'required',
      date_scope: component.date_scope || 'tour_nights',
      date_range: component.date_range,
      markup_override: component.markup_override,
      notes: component.notes,
      sort_order: component.sort_order || pkg.components.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedPackage = {
      ...pkg,
      components: [...pkg.components, newComponent],
      updated_at: new Date().toISOString()
    }

    return updatePackage(packageId, updatedPackage)
  }

  const updateComponent = async (packageId: string, componentId: string, data: Partial<PackageComponent>): Promise<Package | null> => {
    const pkg = packages.find(p => p.id === packageId)
    if (!pkg) return null

    const updatedComponents = pkg.components.map(comp =>
      comp.id === componentId
        ? { ...comp, ...data, updated_at: new Date().toISOString() }
        : comp
    )

    const updatedPackage = {
      ...pkg,
      components: updatedComponents,
      updated_at: new Date().toISOString()
    }

    return updatePackage(packageId, updatedPackage)
  }

  const removeComponent = async (packageId: string, componentId: string): Promise<Package | null> => {
    const pkg = packages.find(p => p.id === packageId)
    if (!pkg) return null

    const updatedComponents = pkg.components.filter(comp => comp.id !== componentId)

    const updatedPackage = {
      ...pkg,
      components: updatedComponents,
      updated_at: new Date().toISOString()
    }

    return updatePackage(packageId, updatedPackage)
  }

  return {
    data: packages,
    loading,
    createPackage,
    updatePackage,
    deletePackage,
    getPackagesByTour,
    getPackagesByCategory,
    getPackageById,
    addComponent,
    updateComponent,
    removeComponent
  }
}
