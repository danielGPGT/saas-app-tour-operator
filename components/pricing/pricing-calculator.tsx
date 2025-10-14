/**
 * PRICING CALCULATOR COMPONENT
 * Demonstrates the multi-channel pricing flow with real-time calculations
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, Building2, Globe, Users, TrendingUp, DollarSign } from 'lucide-react'
import { createPricingEngine } from '@/lib/pricing-engine'
import { useData } from '@/contexts/data-context'
import type { PricingRequest, PricingResponse } from '@/lib/pricing-engine'

export function PricingCalculator() {
  const [searchCriteria, setSearchCriteria] = useState({
    item_id: '',
    offer_id: '',
    rate_id: '',
    quantity: 1,
    channel: 'web' as 'web' | 'b2b' | 'internal'
  })

  const [pricingResult, setPricingResult] = useState<PricingResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const {
    inventoryItems,
    unifiedOffers,
    unifiedRates,
    unifiedContracts,
    unifiedPricingPolicies,
    allocations
  } = useData()

  // Create pricing engine
  const pricingEngine = useMemo(() => 
    createPricingEngine(unifiedRates, unifiedOffers, unifiedContracts, unifiedPricingPolicies, allocations),
    [unifiedRates, unifiedOffers, unifiedContracts, unifiedPricingPolicies, allocations]
  )

  // Get available offers for selected item
  const availableOffers = useMemo(() => {
    if (!searchCriteria.item_id) return []
    return unifiedOffers.filter(o => 
      o.item_id.toString() === searchCriteria.item_id && 
      o.channel === searchCriteria.channel
    )
  }, [searchCriteria.item_id, searchCriteria.channel, unifiedOffers])

  // Get available rates for selected offer
  const availableRates = useMemo(() => {
    if (!searchCriteria.offer_id) return []
    return unifiedRates.filter(r => 
      r.offer_id.toString() === searchCriteria.offer_id
    )
  }, [searchCriteria.offer_id, unifiedRates])

  const handleCalculatePrice = () => {
    if (!searchCriteria.offer_id || !searchCriteria.rate_id) {
      alert('Please select an offer and rate')
      return
    }

    setIsCalculating(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const result = pricingEngine.computePrice({
        offer_id: parseInt(searchCriteria.offer_id),
        rate_id: parseInt(searchCriteria.rate_id),
        quantity: searchCriteria.quantity,
        channel: searchCriteria.channel
      })
      
      setPricingResult(result)
      setIsCalculating(false)
    }, 500)
  }

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'web': return <Globe className="h-4 w-4" />
      case 'b2b': return <Users className="h-4 w-4" />
      default: return <Building2 className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Multi-Channel Pricing Calculator
          </CardTitle>
          <CardDescription>
            Test the pricing engine with different channels and scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item">Inventory Item</Label>
              <Select
                value={searchCriteria.item_id}
                onValueChange={(value) => setSearchCriteria({ 
                  ...searchCriteria, 
                  item_id: value, 
                  offer_id: '',
                  rate_id: ''
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select inventory item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Sales Channel</Label>
              <Select
                value={searchCriteria.channel}
                onValueChange={(value: any) => setSearchCriteria({ 
                  ...searchCriteria, 
                  channel: value,
                  offer_id: '',
                  rate_id: ''
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Web Direct</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="b2b">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>B2B Agents</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="internal">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Internal</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {availableOffers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="offer">Available Offers</Label>
              <Select
                value={searchCriteria.offer_id}
                onValueChange={(value) => setSearchCriteria({ 
                  ...searchCriteria, 
                  offer_id: value,
                  rate_id: ''
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an offer" />
                </SelectTrigger>
                <SelectContent>
                  {availableOffers.map(offer => (
                    <SelectItem key={offer.id} value={offer.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{offer.offer_name}</span>
                        <Badge variant={offer.channel === 'web' ? 'default' : 'secondary'}>
                          {offer.channel.toUpperCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableRates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="rate">Rate Bands</Label>
              <Select
                value={searchCriteria.rate_id}
                onValueChange={(value) => setSearchCriteria({ 
                  ...searchCriteria, 
                  rate_id: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a rate band" />
                </SelectTrigger>
                <SelectContent>
                  {availableRates.map(rate => (
                    <SelectItem key={rate.id} value={rate.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>NET {formatCurrency(rate.base_rate || 0)}</span>
                        <span className="text-xs text-muted-foreground">
                          {rate.valid_from} to {rate.valid_to}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={searchCriteria.quantity}
              onChange={(e) => setSearchCriteria({ 
                ...searchCriteria, 
                quantity: parseInt(e.target.value) || 1
              })}
            />
          </div>

          <Button 
            onClick={handleCalculatePrice}
            disabled={!searchCriteria.offer_id || !searchCriteria.rate_id || isCalculating}
            className="w-full"
          >
            {isCalculating ? (
              <>
                <Calculator className="h-4 w-4 mr-2 animate-pulse" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Price
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Result */}
      {pricingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pricing Breakdown
            </CardTitle>
            <CardDescription>
              How the final customer price is calculated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Final Price */}
            <div className="text-center p-6 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(pricingResult.gross_rate * searchCriteria.quantity)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total for {searchCriteria.quantity} unit{searchCriteria.quantity !== 1 ? 's' : ''}
              </div>
            </div>

            <Separator />

            {/* Pricing Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Price Breakdown:</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>NET Rate (per unit):</span>
                    <span>{formatCurrency(pricingResult.breakdown.base_net)}</span>
                  </div>
                  
                  {pricingResult.breakdown.contract_economics.commission_rate > 0 && (
                    <div className="flex justify-between">
                      <span>Commission:</span>
                      <span>{pricingResult.breakdown.contract_economics.commission_rate}%</span>
                    </div>
                  )}
                  
                  {pricingResult.breakdown.contract_economics.supplier_vat > 0 && (
                    <div className="flex justify-between">
                      <span>Supplier VAT:</span>
                      <span>{pricingResult.breakdown.contract_economics.supplier_vat}%</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium">
                    <span>Markup Applied:</span>
                    <span className="text-green-600">
                      {pricingResult.breakdown.markup_policy.strategy === 'markup_pct' 
                        ? `${pricingResult.breakdown.markup_policy.value}%`
                        : formatCurrency(pricingResult.breakdown.markup_policy.applied_markup)
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total NET:</span>
                    <span>{formatCurrency(pricingResult.breakdown.base_net * searchCriteria.quantity)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Markup Amount:</span>
                    <span className="text-green-600">
                      {formatCurrency(pricingResult.breakdown.markup_policy.applied_markup * searchCriteria.quantity)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Final Price:</span>
                    <span>{formatCurrency(pricingResult.gross_rate * searchCriteria.quantity)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-2">
              <h4 className="font-medium">Availability:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{pricingResult.availability.allocated}</div>
                  <div className="text-muted-foreground">Allocated</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${pricingResult.availability.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pricingResult.availability.available}
                  </div>
                  <div className="text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${pricingResult.availability.can_book ? 'text-green-600' : 'text-red-600'}`}>
                    {pricingResult.availability.can_book ? 'Yes' : 'No'}
                  </div>
                  <div className="text-muted-foreground">Can Book</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
