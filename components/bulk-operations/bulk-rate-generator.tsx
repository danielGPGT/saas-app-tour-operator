'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Zap, Package, Calculator, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { InventoryItem, UnifiedContract } from '@/types/unified-inventory'

interface BulkRateGeneratorProps {
  item: InventoryItem
  contract: UnifiedContract
  onGenerateRates: (rates: any[]) => void
  onCancel: () => void
}

export function BulkRateGenerator({ item, contract, onGenerateRates, onCancel }: BulkRateGeneratorProps) {
  const [baseRate, setBaseRate] = useState(100)
  const [markupPercentage, setMarkupPercentage] = useState(60)
  const [selectedBoardTypes, setSelectedBoardTypes] = useState<string[]>(['bed_breakfast'])
  const [selectedOccupancyTypes, setSelectedOccupancyTypes] = useState<string[]>(['double'])
  const [selectedRoomCategories, setSelectedRoomCategories] = useState<string[]>([])
  const [validityDays, setValidityDays] = useState(365)
  const [generatedRates, setGeneratedRates] = useState<any[]>([])

  // Board type options
  const boardTypes = [
    { id: 'room_only', label: 'Room Only', cost: 0 },
    { id: 'bed_breakfast', label: 'Bed & Breakfast', cost: 15 },
    { id: 'half_board', label: 'Half Board', cost: 35 },
    { id: 'full_board', label: 'Full Board', cost: 55 },
    { id: 'all_inclusive', label: 'All Inclusive', cost: 75 }
  ]

  // Occupancy type options
  const occupancyTypes = [
    { id: 'single', label: 'Single', multiplier: 1.0 },
    { id: 'double', label: 'Double', multiplier: 1.0 },
    { id: 'triple', label: 'Triple', multiplier: 1.2 },
    { id: 'quad', label: 'Quad', multiplier: 1.4 }
  ]

  const generateRates = () => {
    if (selectedRoomCategories.length === 0) {
      toast.error('Please select at least one room category')
      return
    }

    const rates: any[] = []
    const markup = markupPercentage / 100
    const validFrom = new Date().toISOString().split('T')[0]
    const validTo = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Generate rates for each combination
    for (const roomCategoryId of selectedRoomCategories) {
      const roomCategory = item.categories.find(cat => cat.id === roomCategoryId)
      if (!roomCategory) continue

      for (const boardType of selectedBoardTypes) {
        const boardConfig = boardTypes.find(bt => bt.id === boardType)
        if (!boardConfig) continue

        for (const occupancyType of selectedOccupancyTypes) {
          const occupancyConfig = occupancyTypes.find(ot => ot.id === occupancyType)
          if (!occupancyConfig) continue

          // Calculate rate
          const boardCost = boardConfig.cost
          const occupancyMultiplier = occupancyConfig.multiplier
          const calculatedBaseRate = (baseRate + boardCost) * occupancyMultiplier
          const sellingPrice = calculatedBaseRate * (1 + markup)

          rates.push({
            // Core rate fields
            contract_id: contract.id,
            item_id: item.id,
            itemName: item.name,
            item_type: item.item_type,
            category_id: roomCategoryId,
            categoryName: roomCategory.category_name,
            supplier_id: contract.supplier_id,
            supplierName: contract.supplierName,
            base_rate: calculatedBaseRate,
            markup_percentage: markup,
            selling_price: sellingPrice,
            currency: contract.currency,
            valid_from: validFrom,
            valid_to: validTo,
            days_of_week: contract.days_of_week || { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
            active: true,
            inventory_type: 'contract',
            allocation_pool_id: contract.plugin_data?.allocation_pool_id,
            
            // Plugin-specific metadata for hotel rates
            plugin_meta: {
              occupancy_type: occupancyType,
              board_type: boardType,
              board_cost: boardCost,
              contract_linked: true
            },
            
            // Rate details for hotel-specific information
            rate_details: {
              room_type: roomCategory.category_name,
              occupancy_type: occupancyType,
              board_type: boardType,
              board_cost: boardCost,
              pricing_unit: 'per_room_per_night',
              capacity_info: {
                min_occupancy: occupancyType === 'single' ? 1 : 2,
                max_occupancy: occupancyType === 'single' ? 1 : parseInt(occupancyType.replace(/\D/g, '')) || 2
              }
            }
          })
        }
      }
    }

    setGeneratedRates(rates)
    toast.success(`Generated ${rates.length} rates`)
  }

  const handleCreateRates = () => {
    onGenerateRates(generatedRates)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Bulk Rate Generator</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rate Configuration</CardTitle>
            <CardDescription>Set up the base parameters for rate generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Base Rate</Label>
                <Input
                  type="number"
                  value={baseRate}
                  onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                  placeholder="100"
                />
              </div>
              <div>
                <Label>Markup %</Label>
                <Input
                  type="number"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                  placeholder="60"
                />
              </div>
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

        {/* Room Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Room Categories</CardTitle>
            <CardDescription>Select which room types to create rates for</CardDescription>
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
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Board Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Board Types</CardTitle>
            <CardDescription>Select meal plan options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {boardTypes.map(boardType => (
                <div key={boardType.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`board-${boardType.id}`}
                      checked={selectedBoardTypes.includes(boardType.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBoardTypes([...selectedBoardTypes, boardType.id])
                        } else {
                          setSelectedBoardTypes(selectedBoardTypes.filter(id => id !== boardType.id))
                        }
                      }}
                    />
                    <label htmlFor={`board-${boardType.id}`} className="text-sm">
                      {boardType.label}
                    </label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{boardType.cost}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Occupancy Types</CardTitle>
            <CardDescription>Select occupancy options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {occupancyTypes.map(occupancy => (
                <div key={occupancy.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`occupancy-${occupancy.id}`}
                      checked={selectedOccupancyTypes.includes(occupancy.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOccupancyTypes([...selectedOccupancyTypes, occupancy.id])
                        } else {
                          setSelectedOccupancyTypes(selectedOccupancyTypes.filter(id => id !== occupancy.id))
                        }
                      }}
                    />
                    <label htmlFor={`occupancy-${occupancy.id}`} className="text-sm">
                      {occupancy.label}
                    </label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ×{occupancy.multiplier}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Rates Preview */}
      {generatedRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Generated Rates Preview ({generatedRates.length} rates)
            </CardTitle>
            <CardDescription>Review the rates that will be created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {generatedRates.slice(0, 10).map((rate, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rate.categoryName}</Badge>
                    <Badge variant="secondary">{rate.rate_details.occupancy_type}</Badge>
                    <Badge variant="outline">{rate.rate_details.board_type}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{rate.currency} {rate.base_rate.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Selling: {rate.currency} {rate.selling_price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {generatedRates.length > 10 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... and {generatedRates.length - 10} more rates
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button onClick={generateRates} disabled={selectedRoomCategories.length === 0}>
            <Calculator className="h-4 w-4 mr-2" />
            Generate Rates
          </Button>
          {generatedRates.length > 0 && (
            <Button onClick={handleCreateRates}>
              <Package className="h-4 w-4 mr-2" />
              Create {generatedRates.length} Rates
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
