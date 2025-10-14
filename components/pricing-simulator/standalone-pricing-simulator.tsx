'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, Eye, TrendingUp, Users, Zap, Target } from 'lucide-react'
import { toast } from 'sonner'
import type { InventoryItem, UnifiedRate } from '@/types/unified-inventory'

interface StandalonePricingSimulatorProps {
  item: InventoryItem
  rates: UnifiedRate[]
  contracts: any[]
  onClose?: () => void
}

export function StandalonePricingSimulator({ item, rates, contracts, onClose }: StandalonePricingSimulatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedChannel, setSelectedChannel] = useState<string>('web')
  const [selectedAgeBand, setSelectedAgeBand] = useState<string>('adult')
  const [quantity, setQuantity] = useState(1)
  const [groupDiscount, setGroupDiscount] = useState(0)
  const [customRate, setCustomRate] = useState(0)

  const channels = [
    { id: 'web', name: 'Web', markup: 0, color: 'bg-blue-100 text-blue-700' },
    { id: 'b2b', name: 'B2B', markup: -0.1, color: 'bg-green-100 text-green-700' },
    { id: 'internal', name: 'Internal', markup: -0.2, color: 'bg-purple-100 text-purple-700' },
    { id: 'box_office', name: 'Box Office', markup: 0.05, color: 'bg-orange-100 text-orange-700' },
    { id: 'reseller', name: 'Reseller', markup: 0.15, color: 'bg-red-100 text-red-700' }
  ]

  const ageBands = [
    { id: 'adult', name: 'Adult', multiplier: 1.0, color: 'bg-gray-100' },
    { id: 'child', name: 'Child', multiplier: 0.5, color: 'bg-yellow-100' },
    { id: 'senior', name: 'Senior', multiplier: 0.8, color: 'bg-blue-100' },
    { id: 'student', name: 'Student', multiplier: 0.7, color: 'bg-green-100' },
    { id: 'infant', name: 'Infant', multiplier: 0.1, color: 'bg-pink-100' }
  ]

  const calculatePricing = () => {
    if (!selectedCategory) return null

    const channel = channels.find(c => c.id === selectedChannel)
    const ageBand = ageBands.find(a => a.id === selectedAgeBand)
    
    if (!channel || !ageBand) return null

    // Find the actual rate for this category
    const actualRate = rates.find(rate => 
      rate.item_id === item.id && 
      rate.category_id === selectedCategory &&
      rate.active
    )

    // Find the contract for this item
    const contract = contracts.find(c => c.item_id === item.id && c.active)
    
    // Use actual rate data or fallback to custom rate
    const baseRate = actualRate?.base_rate || customRate || 100
    
    // Get contract terms
    const commissionRate = contract?.supplier_commission_rate || 0
    const vatRate = contract?.vat_rate || 0
    const serviceFee = contract?.service_fee_per_ticket || 2.50
    const currency = contract?.currency || 'AED'
    
    // Apply age band multiplier
    const ageAdjustedRate = baseRate * ageBand.multiplier
    
    // Apply channel markup
    const channelRate = ageAdjustedRate * (1 + channel.markup)
    
    // Apply group discount
    const discountedRate = channelRate * (1 - groupDiscount / 100)
    
    // Add service fee
    const rateWithFee = discountedRate + serviceFee
    
    // Apply VAT
    const finalRate = rateWithFee * (1 + vatRate / 100)
    
    // Calculate totals
    const subtotal = discountedRate * quantity
    const serviceFees = serviceFee * quantity
    const vatAmount = (subtotal + serviceFees) * (vatRate / 100)
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
      savings: (channelRate - discountedRate) * quantity,
      channel,
      ageBand,
      contract,
      actualRate,
      currency
    }
  }

  const pricing = calculatePricing()

  // Get actual rates for quick scenarios
  const getActualRate = () => {
    const actualRate = rates.find(rate => 
      rate.item_id === item.id && 
      rate.active
    )
    return actualRate?.base_rate || 500
  }

  const quickScenarios = [
    {
      name: 'Single Adult',
      icon: Users,
      description: 'Web channel, 1 adult',
      action: () => {
        setSelectedChannel('web')
        setSelectedAgeBand('adult')
        setQuantity(1)
        setGroupDiscount(0)
        setCustomRate(getActualRate())
      }
    },
    {
      name: 'Group Booking',
      icon: TrendingUp,
      description: '10 adults, 5% discount',
      action: () => {
        setSelectedChannel('b2b')
        setSelectedAgeBand('adult')
        setQuantity(10)
        setGroupDiscount(5)
        setCustomRate(getActualRate())
      }
    },
    {
      name: 'Family Package',
      icon: Users,
      description: '2 adults, 2 children',
      action: () => {
        setSelectedChannel('web')
        setSelectedAgeBand('adult')
        setQuantity(4)
        setGroupDiscount(10)
        setCustomRate(getActualRate())
      }
    },
    {
      name: 'VIP Reseller',
      icon: Target,
      description: 'Premium pricing',
      action: () => {
        setSelectedChannel('reseller')
        setSelectedAgeBand('adult')
        setQuantity(1)
        setGroupDiscount(0)
        setCustomRate(getActualRate() * 2) // Double the actual rate for VIP
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Pricing Simulator</h2>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulator">Live Simulator</TabsTrigger>
          <TabsTrigger value="scenarios">Quick Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Input Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Simulation Parameters
                </CardTitle>
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
                  <Label>Base Rate (AED)</Label>
                  <Input
                    type="number"
                    value={customRate}
                    onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                    placeholder="500"
                  />
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
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${channel.color.split(' ')[0]}`} />
                            {channel.name} ({channel.markup > 0 ? '+' : ''}{(channel.markup * 100).toFixed(0)}%)
                          </div>
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
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${band.color}`} />
                            {band.name} ({(band.multiplier * 100).toFixed(0)}%)
                          </div>
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

            {/* Pricing Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Pricing Breakdown
                </CardTitle>
                <CardDescription>Detailed cost calculation</CardDescription>
              </CardHeader>
              <CardContent>
                {pricing ? (
                  <div className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Rate:</span>
                        <span>{pricing.currency} {pricing.baseRate.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Age Band ({pricing.ageBand.name}):</span>
                        <span>{pricing.currency} {pricing.ageAdjustedRate.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Channel ({pricing.channel.name}):</span>
                        <span>{pricing.currency} {pricing.channelRate.toFixed(2)}</span>
                      </div>
                      {groupDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Group Discount ({groupDiscount}%):</span>
                          <span>-{pricing.currency} {pricing.savings.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Service Fee:</span>
                        <span>{pricing.currency} {pricing.serviceFees.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT ({pricing.contract?.vat_rate || 0}%):</span>
                        <span>{pricing.currency} {pricing.vatAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total ({quantity} tickets):</span>
                        <span>{pricing.currency} {pricing.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Per ticket:</span>
                        <span>{pricing.currency} {(pricing.total / quantity).toFixed(2)}</span>
                      </div>
                    </div>

                    {pricing.savings > 0 && (
                      <div className="bg-green-50 p-3 rounded text-sm text-green-700">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        You save {pricing.currency} {pricing.savings.toFixed(2)} with group discount
                      </div>
                    )}

                    {/* Show actual data being used */}
                    {(pricing.contract || pricing.actualRate) && (
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <div className="font-medium text-blue-800 mb-2">Using Real Data:</div>
                        {pricing.contract && (
                          <div className="text-blue-700">
                            <div>Contract: {pricing.contract.contract_name}</div>
                            <div>VAT: {pricing.contract.vat_rate}% | Service Fee: {pricing.currency} {pricing.contract.service_fee_per_ticket}</div>
                          </div>
                        )}
                        {pricing.actualRate && (
                          <div className="text-blue-700">
                            <div>Rate: {pricing.actualRate.rate_name || 'Active Rate'}</div>
                            <div>Base: {pricing.currency} {pricing.actualRate.base_rate} | Valid: {pricing.actualRate.valid_from} to {pricing.actualRate.valid_to}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-8 w-8 mx-auto mb-2" />
                    <p>Configure parameters to see pricing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="text-center">
            <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Quick Scenarios</h3>
            <p className="text-muted-foreground mt-2">
              Test common pricing scenarios with one click
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {quickScenarios.map((scenario, index) => {
              const Icon = scenario.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={scenario.action}
                  className="h-auto p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {scenario.description}
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Channel Comparison</CardTitle>
              <CardDescription>Compare pricing across different channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {channels.map(channel => {
                  const testRate = 500 // Base rate
                  const channelRate = testRate * (1 + channel.markup)
                  const finalRate = (channelRate + 2.50) * 1.05 // Service fee + VAT
                  
                  return (
                    <div key={channel.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${channel.color.split(' ')[0]}`} />
                        <span className="text-sm font-medium">{channel.name}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">AED {finalRate.toFixed(2)}</span>
                        <span className="text-muted-foreground ml-2">
                          ({channel.markup > 0 ? '+' : ''}{(channel.markup * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
