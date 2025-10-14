'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Eye, TrendingUp, Users } from 'lucide-react'
import type { InventoryItem } from '@/types/unified-inventory'

interface PricingSimulatorProps {
  item: InventoryItem
  contractData: {
    supplier_commission_rate: number
    vat_rate: number
    service_fee_per_ticket: number
    currency: string
  }
  ratesData: any[]
}

export function PricingSimulator({ item, contractData, ratesData }: PricingSimulatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedChannel, setSelectedChannel] = useState<string>('web')
  const [selectedAgeBand, setSelectedAgeBand] = useState<string>('adult')
  const [quantity, setQuantity] = useState(1)
  const [groupDiscount, setGroupDiscount] = useState(0)

  const channels = [
    { id: 'web', name: 'Web', markup: 0 },
    { id: 'b2b', name: 'B2B', markup: -0.1 },
    { id: 'internal', name: 'Internal', markup: -0.2 },
    { id: 'box_office', name: 'Box Office', markup: 0.05 },
    { id: 'reseller', name: 'Reseller', markup: 0.15 }
  ]

  const ageBands = [
    { id: 'adult', name: 'Adult', multiplier: 1.0 },
    { id: 'child', name: 'Child', multiplier: 0.5 },
    { id: 'senior', name: 'Senior', multiplier: 0.8 },
    { id: 'student', name: 'Student', multiplier: 0.7 },
    { id: 'infant', name: 'Infant', multiplier: 0.1 }
  ]

  const calculatePricing = () => {
    if (!selectedCategory || !ratesData.length) return null

    const rate = ratesData.find(r => r.category === selectedCategory)
    if (!rate) return null

    const channel = channels.find(c => c.id === selectedChannel)
    const ageBand = ageBands.find(a => a.id === selectedAgeBand)
    
    if (!channel || !ageBand) return null

    // Base rate from CSV
    const baseRate = rate[selectedAgeBand] || rate.adult
    
    // Apply age band multiplier
    const ageAdjustedRate = baseRate * ageBand.multiplier
    
    // Apply channel markup
    const channelRate = ageAdjustedRate * (1 + channel.markup)
    
    // Apply group discount
    const discountedRate = channelRate * (1 - groupDiscount / 100)
    
    // Add service fee
    const rateWithFee = discountedRate + contractData.service_fee_per_ticket
    
    // Apply VAT
    const finalRate = rateWithFee * (1 + contractData.vat_rate / 100)
    
    // Calculate totals
    const subtotal = discountedRate * quantity
    const serviceFees = contractData.service_fee_per_ticket * quantity
    const vatAmount = (subtotal + serviceFees) * (contractData.vat_rate / 100)
    const total = subtotal + serviceFees + vatAmount

    return {
      baseRate,
      ageAdjustedRate,
      channelRate,
      discountedRate,
      rateWithFee,
      finalRate,
      subtotal,
      serviceFees,
      vatAmount,
      total,
      savings: (channelRate - discountedRate) * quantity
    }
  }

  const pricing = calculatePricing()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calculator className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Pricing Simulator</h2>
        <p className="text-muted-foreground mt-2">
          Test your pricing across different scenarios
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Simulation Parameters</CardTitle>
            <CardDescription>Configure your test scenario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {item.categories.map(category => (
                    <SelectItem key={category.id} value={category.category_name}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sales Channel</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name} ({channel.markup > 0 ? '+' : ''}{(channel.markup * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Age Band</Label>
              <Select value={selectedAgeBand} onValueChange={setSelectedAgeBand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ageBands.map(band => (
                    <SelectItem key={band.id} value={band.id}>
                      {band.name} ({(band.multiplier * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div>
                <Label>Group Discount (%)</Label>
                <Input
                  type="number"
                  value={groupDiscount}
                  onChange={(e) => setGroupDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pricing Breakdown</CardTitle>
            <CardDescription>Detailed cost calculation</CardDescription>
          </CardHeader>
          <CardContent>
            {pricing ? (
              <div className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Rate:</span>
                    <span>{contractData.currency} {pricing.baseRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age Band ({selectedAgeBand}):</span>
                    <span>{contractData.currency} {pricing.ageAdjustedRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Channel ({selectedChannel}):</span>
                    <span>{contractData.currency} {pricing.channelRate.toFixed(2)}</span>
                  </div>
                  {groupDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Group Discount ({groupDiscount}%):</span>
                      <span>-{contractData.currency} {pricing.savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Fee:</span>
                    <span>{contractData.currency} {pricing.serviceFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT ({contractData.vat_rate}%):</span>
                    <span>{contractData.currency} {pricing.vatAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total ({quantity} tickets):</span>
                    <span>{contractData.currency} {pricing.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Per ticket:</span>
                    <span>{contractData.currency} {(pricing.total / quantity).toFixed(2)}</span>
                  </div>
                </div>

                {pricing.savings > 0 && (
                  <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    You save {contractData.currency} {pricing.savings.toFixed(2)} with group discount
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <Eye className="h-8 w-8 mx-auto mb-2" />
                <p>Select a category to see pricing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Scenarios</CardTitle>
          <CardDescription>Test common pricing scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedChannel('web')
                setSelectedAgeBand('adult')
                setQuantity(1)
                setGroupDiscount(0)
              }}
              className="h-auto p-3"
            >
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Single Adult</div>
                <div className="text-xs text-muted-foreground">Web channel</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setSelectedChannel('b2b')
                setSelectedAgeBand('adult')
                setQuantity(10)
                setGroupDiscount(5)
              }}
              className="h-auto p-3"
            >
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Group Booking</div>
                <div className="text-xs text-muted-foreground">10 adults, 5% discount</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setSelectedChannel('reseller')
                setSelectedAgeBand('child')
                setQuantity(1)
                setGroupDiscount(0)
              }}
              className="h-auto p-3"
            >
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Child Ticket</div>
                <div className="text-xs text-muted-foreground">Reseller channel</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
