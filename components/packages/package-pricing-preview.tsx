'use client'

import { useState, useEffect } from 'react'
import { Package, PackageCategory, Product, Contract } from '@/types/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calculator, Users, Building, Eye, EyeOff } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import { useContracts } from '@/hooks/use-contracts'
import { useRateBands } from '@/hooks/use-rate-bands'
import { priceStay } from '@/lib/pricing'

interface PackagePricingPreviewProps {
  packageData: Package
  category: PackageCategory
  tourStartDate: string
  tourEndDate: string
}

interface PricingBreakdown {
  componentCost: number
  markup: number
  totalPrice: number
  markupPercentage: number
}

export function PackagePricingPreview({ 
  packageData, 
  category, 
  tourStartDate, 
  tourEndDate 
}: PackagePricingPreviewProps) {
  const [channel, setChannel] = useState<'b2c' | 'b2b'>('b2c')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [pricing, setPricing] = useState<Record<string, PricingBreakdown>>({})

  const { data: products } = useProducts()
  const { data: contracts } = useContracts()
  const { data: rateBands } = useRateBands()

  useEffect(() => {
    calculatePricing()
  }, [packageData, category, channel, adults, children, tourStartDate, tourEndDate])

  const calculatePricing = async () => {
    if (!packageData.components.length) return

    const newPricing: Record<string, PricingBreakdown> = {}
    
    // Generate date array for tour nights
    const dates = []
    const startDate = new Date(tourStartDate)
    const endDate = new Date(tourEndDate)
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    for (const component of packageData.components) {
      const product = products?.find(p => p.id === component.product_id)
      const contract = contracts?.find(c => c.id === component.contract_id)
      
      if (!product || !contract) continue

      try {
        // Find matching rate band
        const rateBand = rateBands?.find(rb => 
          rb.product_id === component.product_id &&
          rb.contract_id === component.contract_id &&
          dates.some(date => date >= rb.band_start && date <= rb.band_end)
        )

        if (!rateBand) continue

        // Calculate pricing using priceStay function
        const pricingResult = priceStay({
          rateBand,
          contract,
          dates,
          adults,
          children,
          channel: channel as 'B2C' | 'B2B'
        })

        // Apply component markup override if specified
        let finalMarkup = pricingResult.markup_percentage
        if (component.markup_override !== undefined) {
          finalMarkup = component.markup_override
        } else if (packageData.markup_b2c_override !== undefined && channel === 'b2c') {
          finalMarkup = packageData.markup_b2c_override
        } else if (packageData.markup_b2b_override !== undefined && channel === 'b2b') {
          finalMarkup = packageData.markup_b2b_override
        } else if (category.default_markup_b2c && channel === 'b2c') {
          finalMarkup = category.default_markup_b2c
        } else if (category.default_markup_b2b && channel === 'b2b') {
          finalMarkup = category.default_markup_b2b
        }

        const componentCost = pricingResult.cost_per_unit * dates.length
        const markup = (componentCost * finalMarkup) / 100
        const totalPrice = componentCost + markup

        newPricing[component.id] = {
          componentCost,
          markup,
          totalPrice,
          markupPercentage: finalMarkup
        }
      } catch (error) {
        console.error('Error calculating pricing for component:', component.id, error)
      }
    }

    setPricing(newPricing)
  }

  const getTotalCost = () => {
    return Object.values(pricing).reduce((sum, p) => sum + p.componentCost, 0)
  }

  const getTotalMarkup = () => {
    return Object.values(pricing).reduce((sum, p) => sum + p.markup, 0)
  }

  const getTotalPrice = () => {
    return Object.values(pricing).reduce((sum, p) => sum + p.totalPrice, 0)
  }

  const getProductName = (productId: string) => {
    return products?.find(p => p.id === productId)?.name || 'Unknown Product'
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Pricing Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Toggle */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="channel"
              checked={channel === 'b2c'}
              onCheckedChange={(checked) => setChannel(checked ? 'b2c' : 'b2b')}
            />
            <Label htmlFor="channel" className="flex items-center gap-2">
              {channel === 'b2c' ? (
                <>
                  <Users className="h-4 w-4" />
                  B2C Pricing
                </>
              ) : (
                <>
                  <Building className="h-4 w-4" />
                  B2B Pricing
                </>
              )}
            </Label>
          </div>
        </div>

        {/* Occupancy */}
        <div className="space-y-3">
          <Label>Occupancy</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="adults" className="text-sm">Adults</Label>
              <Input
                id="adults"
                type="number"
                min="1"
                max="10"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children" className="text-sm">Children</Label>
              <Input
                id="children"
                type="number"
                min="0"
                max="10"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Package</span>
            <Badge variant="outline">{packageData.name}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Category</span>
            <div className="flex items-center gap-2">
              {category.color_tag && (
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color_tag }}
                />
              )}
              <span className="text-sm">{category.name}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Duration</span>
            <span className="text-sm">
              {new Date(tourEndDate).getTime() - new Date(tourStartDate).getTime() > 0 
                ? Math.ceil((new Date(tourEndDate).getTime() - new Date(tourStartDate).getTime()) / (1000 * 60 * 60 * 24))
                : 1
              } nights
            </span>
          </div>
        </div>

        <Separator />

        {/* Component Breakdown */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Component Breakdown</Label>
          {packageData.components.map((component) => {
            const componentPricing = pricing[component.id]
            if (!componentPricing) return null

            return (
              <div key={component.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {getProductName(component.product_id)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {component.selection_type}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Cost:</span>
                    <div className="font-medium">€{componentPricing.componentCost.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Markup:</span>
                    <div className="font-medium">€{componentPricing.markup.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-medium">€{componentPricing.totalPrice.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Markup: {componentPricing.markupPercentage.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Cost</span>
            <span className="text-sm">€{getTotalCost().toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Markup</span>
            <span className="text-sm">€{getTotalMarkup().toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Package Total</span>
            <span className="font-semibold text-lg">€{getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full">
            Preview Package
          </Button>
          <Button variant="outline" className="w-full">
            Save as Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
