'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Zap, Package, Users, Calendar, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import type { InventoryItem, UnifiedContract } from '@/types/unified-inventory'

interface SmartAllocationGeneratorProps {
  item: InventoryItem
  contract: UnifiedContract
  onGenerateAllocations: (data: { allocations: any[], pools: any[] }) => void
  onCancel: () => void
}

export function SmartAllocationGenerator({ item, contract, onGenerateAllocations, onCancel }: SmartAllocationGeneratorProps) {
  const [allocationTemplate, setAllocationTemplate] = useState<'standard' | 'premium' | 'custom'>('standard')
  const [selectedRoomCategories, setSelectedRoomCategories] = useState<string[]>([])
  const [totalRooms, setTotalRooms] = useState(100)
  const [allocationStrategy, setAllocationStrategy] = useState<'equal' | 'weighted' | 'custom'>('equal')
  const [customAllocations, setCustomAllocations] = useState<Array<{categoryId: string, quantity: number}>>([])
  const [poolIdPrefix, setPoolIdPrefix] = useState('')
  const [validityDays, setValidityDays] = useState(365)

  // Pre-defined templates
  const templates = {
    standard: {
      name: 'Standard Hotel Block',
      description: 'Equal allocation across all room types',
      strategy: 'equal' as const,
      roomTypes: item.categories.map(cat => cat.id)
    },
    premium: {
      name: 'Premium Package',
      description: 'Weighted allocation favoring premium rooms',
      strategy: 'weighted' as const,
      roomTypes: item.categories.map(cat => cat.id)
    },
    custom: {
      name: 'Custom Allocation',
      description: 'Manually set quantities per room type',
      strategy: 'custom' as const,
      roomTypes: []
    }
  }

  const generateAllocations = () => {
    if (selectedRoomCategories.length === 0) {
      toast.error('Please select at least one room category')
      return
    }

    const allocations: any[] = []
    const pools: any[] = []
    const validFrom = new Date().toISOString().split('T')[0]
    const validTo = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const basePoolId = poolIdPrefix || `${item.name.toLowerCase().replace(/\s+/g, '-')}-${contract.contract_name.toLowerCase().replace(/\s+/g, '-')}`

    if (allocationStrategy === 'equal') {
      // Equal distribution
      const roomsPerCategory = Math.floor(totalRooms / selectedRoomCategories.length)
      const remainder = totalRooms % selectedRoomCategories.length

      selectedRoomCategories.forEach((categoryId, index) => {
        const quantity = roomsPerCategory + (index < remainder ? 1 : 0)
        if (quantity > 0) {
          const category = item.categories.find(cat => cat.id === categoryId)
          allocations.push({
            item_id: item.id,
            item_type: item.item_type,
            supplier_id: contract.supplier_id,
            category_ids: [categoryId],
            quantity,
            allocation_pool_id: `${basePoolId}-pool`,
            label: `${category?.category_name} Block`,
            description: `Allocated ${quantity} ${category?.category_name} rooms`,
            valid_from: validFrom,
            valid_to: validTo,
            active: true,
            // Hotel-specific allocation data
            room_allocations: [{
              room_group_ids: [categoryId],
              quantity,
              label: `${category?.category_name} Block`,
              allocation_pool_id: `${basePoolId}-pool`
            }]
          })
        }
      })
    } else if (allocationStrategy === 'weighted') {
      // Weighted distribution (premium rooms get more)
      const weights = selectedRoomCategories.map(categoryId => {
        const category = item.categories.find(cat => cat.id === categoryId)
        return {
          id: categoryId,
          name: category?.category_name || '',
          weight: category?.category_name?.toLowerCase().includes('premium') || 
                  category?.category_name?.toLowerCase().includes('suite') ? 2 : 1
        }
      })
      
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
      
      weights.forEach(weight => {
        const quantity = Math.floor((totalRooms * weight.weight) / totalWeight)
        if (quantity > 0) {
          allocations.push({
            item_id: item.id,
            item_type: item.item_type,
            supplier_id: contract.supplier_id,
            category_ids: [weight.id],
            quantity,
            allocation_pool_id: `${basePoolId}-pool`,
            label: `${weight.name} Block`,
            description: `Allocated ${quantity} ${weight.name} rooms (weighted)`,
            valid_from: validFrom,
            valid_to: validTo,
            active: true,
            // Hotel-specific allocation data
            room_allocations: [{
              room_group_ids: [weight.id],
              quantity,
              label: `${weight.name} Block`,
              allocation_pool_id: `${basePoolId}-pool`
            }]
          })
        }
      })
    } else if (allocationStrategy === 'custom') {
      // Custom allocation
      customAllocations.forEach(allocation => {
        if (allocation.quantity > 0) {
          const category = item.categories.find(cat => cat.id === allocation.categoryId)
          allocations.push({
            item_id: item.id,
            item_type: item.item_type,
            supplier_id: contract.supplier_id,
            category_ids: [allocation.categoryId],
            quantity: allocation.quantity,
            allocation_pool_id: `${basePoolId}-pool`,
            label: `${category?.category_name} Block`,
            description: `Allocated ${allocation.quantity} ${category?.category_name} rooms`,
            valid_from: validFrom,
            valid_to: validTo,
            active: true,
            // Hotel-specific allocation data
            room_allocations: [{
              room_group_ids: [allocation.categoryId],
              quantity: allocation.quantity,
              label: `${category?.category_name} Block`,
              allocation_pool_id: `${basePoolId}-pool`
            }]
          })
        }
      })
    }

    // Create a single pool for all allocations
    const totalAllocatedRooms = allocations.reduce((sum, alloc) => sum + alloc.quantity, 0)
    const poolData = {
      pool_id: `${basePoolId}-pool`,
      item_id: item.id,
      item_name: item.name,
      item_type: item.item_type,
      total_capacity: totalAllocatedRooms,
      available_spots: totalAllocatedRooms,
      current_bookings: 0,
      daily_availability: {},
      allows_overbooking: false,
      waitlist_enabled: false,
      status: 'healthy' as const
    }
    pools.push(poolData)

    onGenerateAllocations({ allocations, pools })
    toast.success(`Generated ${allocations.length} allocations and 1 pool`)
  }

  const updateCustomAllocation = (categoryId: string, quantity: number) => {
    setCustomAllocations(prev => {
      const existing = prev.find(a => a.categoryId === categoryId)
      if (existing) {
        return prev.map(a => a.categoryId === categoryId ? { ...a, quantity } : a)
      } else {
        return [...prev, { categoryId, quantity }]
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold">Smart Allocation Generator</h2>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Allocation Template</CardTitle>
          <CardDescription>Choose a pre-configured allocation strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(templates).map(([key, template]) => (
              <div
                key={key}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  allocationTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setAllocationTemplate(key as any)
                  setAllocationStrategy(template.strategy)
                  if (key !== 'custom') {
                    setSelectedRoomCategories(template.roomTypes)
                  }
                }}
              >
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Room Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Room Categories</CardTitle>
            <CardDescription>Select which room types to allocate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {item.categories.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-${category.id}`}
                    checked={selectedRoomCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRoomCategories([...selectedRoomCategories, category.id])
                      } else {
                        setSelectedRoomCategories(selectedRoomCategories.filter(id => id !== category.id))
                      }
                    }}
                  />
                  <label htmlFor={`room-${category.id}`} className="text-sm">
                    {category.category_name}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allocation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Allocation Settings</CardTitle>
            <CardDescription>Configure the allocation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Total Rooms</Label>
              <Input
                type="number"
                value={totalRooms}
                onChange={(e) => setTotalRooms(parseInt(e.target.value) || 0)}
                placeholder="100"
              />
            </div>

            <div>
              <Label>Pool ID Prefix</Label>
              <Input
                value={poolIdPrefix}
                onChange={(e) => setPoolIdPrefix(e.target.value)}
                placeholder="f1-weekend-2025"
              />
            </div>

            <div>
              <Label>Validity Period (days)</Label>
              <Input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 365)}
                placeholder="365"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Allocation Quantities */}
      {allocationStrategy === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Custom Quantities</CardTitle>
            <CardDescription>Set specific quantities for each room type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedRoomCategories.map(categoryId => {
                const category = item.categories.find(cat => cat.id === categoryId)
                const currentQuantity = customAllocations.find(a => a.categoryId === categoryId)?.quantity || 0
                
                return (
                  <div key={categoryId} className="flex items-center justify-between">
                    <label className="text-sm font-medium">{category?.category_name}</label>
                    <Input
                      type="number"
                      value={currentQuantity}
                      onChange={(e) => updateCustomAllocation(categoryId, parseInt(e.target.value) || 0)}
                      className="w-24"
                      placeholder="0"
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {allocationStrategy !== 'custom' && selectedRoomCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Allocation Preview
            </CardTitle>
            <CardDescription>Preview of how rooms will be allocated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedRoomCategories.map(categoryId => {
                const category = item.categories.find(cat => cat.id === categoryId)
                let quantity = 0
                
                if (allocationStrategy === 'equal') {
                  quantity = Math.floor(totalRooms / selectedRoomCategories.length)
                } else if (allocationStrategy === 'weighted') {
                  const isPremium = category?.category_name?.toLowerCase().includes('premium') || 
                                   category?.category_name?.toLowerCase().includes('suite')
                  const weight = isPremium ? 2 : 1
                  const totalWeight = selectedRoomCategories.reduce((sum, id) => {
                    const cat = item.categories.find(c => c.id === id)
                    const isCatPremium = cat?.category_name?.toLowerCase().includes('premium') || 
                                       cat?.category_name?.toLowerCase().includes('suite')
                    return sum + (isCatPremium ? 2 : 1)
                  }, 0)
                  quantity = Math.floor((totalRooms * weight) / totalWeight)
                }
                
                return (
                  <div key={categoryId} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span>{category?.category_name}</span>
                    <Badge variant="outline">{quantity} rooms</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={generateAllocations} disabled={selectedRoomCategories.length === 0}>
          <Package className="h-4 w-4 mr-2" />
          Generate Allocations
        </Button>
      </div>
    </div>
  )
}
