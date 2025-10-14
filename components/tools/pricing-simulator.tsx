'use client'

import { useState } from 'react'
import { Calculator, Copy, AlertCircle, CheckCircle, Calendar, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, Resource, Allocation, RateBand, Contract } from '@/types/domain'
import { priceStay } from '@/lib/pricing'

interface PricingSimulatorProps {
  products: Product[]
  resources: Resource[]
  allocations: Allocation[]
  rateBands: RateBand[]
  contracts: Contract[]
}

export function PricingSimulator({ 
  products, 
  resources, 
  allocations, 
  rateBands, 
  contracts 
}: PricingSimulatorProps) {
  const [simulationParams, setSimulationParams] = useState({
    productId: '',
    contractId: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: [] as number[],
    channel: 'b2c' as 'b2c' | 'b2b'
  })
  
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    if (!simulationParams.productId || !simulationParams.contractId || 
        !simulationParams.startDate || !simulationParams.endDate) {
      setError('Please fill in all required fields')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Find matching rate band and contract
      const rateBand = rateBands.find(rb => 
        rb.product_id === simulationParams.productId && 
        rb.contract_id === simulationParams.contractId &&
        rb.active
      )

      const contract = contracts.find(c => c.id === simulationParams.contractId)

      if (!rateBand || !contract) {
        throw new Error('No matching rate band or contract found')
      }

      // Check availability
      const startDate = new Date(simulationParams.startDate)
      const endDate = new Date(simulationParams.endDate)
      const dates: string[] = []
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }

      const relevantAllocations = allocations.filter(a => {
        if (a.product_id !== simulationParams.productId || a.stop_sell) return false
        
        const allocationStart = new Date(a.start_date)
        const allocationEnd = new Date(a.end_date)
        const searchStart = new Date(dates[0])
        const searchEnd = new Date(dates[dates.length - 1])
        
        // Check if allocation date range overlaps with search dates
        return searchStart <= allocationEnd && searchEnd >= allocationStart
      })

      if (relevantAllocations.length === 0) {
        throw new Error('No available allocations for the selected dates')
      }

      // Calculate pricing
      const pricing = priceStay({
        band: rateBand,
        contract: contract,
        channel: simulationParams.channel,
        dates: dates,
        pax: {
          adults: simulationParams.adults,
          children: simulationParams.children
        }
      })

      const result = {
        product: products.find(p => p.id === simulationParams.productId),
        resource: resources.find(r => r.id === products.find(p => p.id === simulationParams.productId)?.resource_id),
        rateBand,
        contract,
        allocations: relevantAllocations,
        pricing,
        availability: {
          totalCapacity: relevantAllocations.reduce((sum, a) => sum + a.capacity, 0),
          minCapacity: Math.min(...relevantAllocations.map(a => a.capacity)),
          dates: dates.length,
          nights: dates.length - 1
        }
      }

      setSimulationResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSimulationParams(prev => ({ ...prev, [field]: value }))
    setSimulationResult(null)
    setError(null)
  }

  const copyResults = () => {
    if (simulationResult) {
      const resultsText = `Pricing Simulation Results:
Product: ${simulationResult.product?.name}
Dates: ${simulationParams.startDate} to ${simulationParams.endDate}
Guests: ${simulationParams.adults} adults ${simulationParams.children.length > 0 ? `+ ${simulationParams.children.length} children` : ''}
Channel: ${simulationParams.channel.toUpperCase()}
Total Price: €${simulationResult.pricing.total_due_now}
NET Rate: €${simulationResult.pricing.room_subtotal_net}
Markup: €${simulationResult.pricing.markup_amount}`
      
      navigator.clipboard.writeText(resultsText)
    }
  }

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || productId
  }

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id === resourceId)?.name || resourceId
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return '🏨'
      case 'event_ticket': return '🎫'
      case 'transfer': return '🚗'
      case 'lounge': return '🛋️'
      default: return '📦'
    }
  }

  const selectedProduct = products.find(p => p.id === simulationParams.productId)
  const selectedResource = selectedProduct ? resources.find(r => r.id === selectedProduct.resource_id) : null

  return (
    <div className="space-y-6">
      {/* Simulation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pricing Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={simulationParams.productId}
                onValueChange={(value) => {
                  handleInputChange('productId', value)
                  handleInputChange('contractId', '') // Reset contract
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.active).map(product => {
                    const resource = resources.find(r => r.id === product.resource_id)
                    return (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          <span>{getResourceTypeIcon(resource?.type || '')}</span>
                          <span>{product.name}</span>
                          <span className="text-muted-foreground">
                            • {getResourceName(product.resource_id)}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Contract Selection */}
            <div className="space-y-2">
              <Label htmlFor="contract">Contract *</Label>
              <Select
                value={simulationParams.contractId}
                onValueChange={(value) => handleInputChange('contractId', value)}
                disabled={!simulationParams.productId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contract" />
                </SelectTrigger>
                <SelectContent>
                  {contracts
                    .filter(c => c.active && c.resource_id === selectedResource?.id)
                    .map(contract => (
                      <SelectItem key={contract.id} value={contract.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{contract.supplier_id}</span>
                          <span className="text-muted-foreground">
                            • {contract.currency}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={simulationParams.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={simulationParams.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={simulationParams.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Occupancy and Channel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Adults *</Label>
              <Select
                value={simulationParams.adults.toString()}
                onValueChange={(value) => handleInputChange('adults', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Number of adults" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Adult' : 'Adults'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Select
                value={simulationParams.children.length.toString()}
                onValueChange={(value) => {
                  const count = parseInt(value)
                  const children = Array.from({ length: count }, (_, i) => 12) // Default age 12
                  handleInputChange('children', children)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Number of children" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 6 }, (_, i) => i).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Child' : num === 0 ? 'No Children' : 'Children'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel *</Label>
              <Select
                value={simulationParams.channel}
                onValueChange={(value) => handleInputChange('channel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2c">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      B2C (Direct Customers)
                    </div>
                  </SelectItem>
                  <SelectItem value="b2b">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      B2B (Travel Agents)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleCalculate}
              disabled={isCalculating || !simulationParams.productId || !simulationParams.contractId || 
                       !simulationParams.startDate || !simulationParams.endDate}
              className="gap-2"
            >
              <Calculator className="h-4 w-4" />
              {isCalculating ? 'Calculating...' : 'Calculate Pricing'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {simulationResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Simulation Results
              </CardTitle>
              <Button variant="outline" size="sm" onClick={copyResults}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Booking Details</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Product: {simulationResult.product?.name}</div>
                      <div>Resource: {simulationResult.resource?.name}</div>
                      <div>Dates: {simulationParams.startDate} - {simulationParams.endDate}</div>
                      <div>Nights: {simulationResult.availability.nights}</div>
                      <div>Guests: {simulationParams.adults} adults {simulationParams.children.length > 0 && `+ ${simulationParams.children.length} children`}</div>
                      <div>Channel: {simulationParams.channel.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Pricing Summary</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>NET Rate: €{simulationResult.pricing.room_subtotal_net}</div>
                      <div>Commission: -€{simulationResult.pricing.supplier_commission}</div>
                      <div>VAT: +€{simulationResult.pricing.supplier_vat}</div>
                      <div>Fees: +€{simulationResult.pricing.fees_included}</div>
                      <div>Markup: +€{simulationResult.pricing.markup_amount}</div>
                      <div className="font-bold text-lg">Total: €{simulationResult.pricing.total_due_now}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="mt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Room Subtotal (NET)</span>
                    <span>€{simulationResult.pricing.room_subtotal_net}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Supplier Commission (-{simulationResult.contract?.economics.commission_pct}%)</span>
                    <span>-€{simulationResult.pricing.supplier_commission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Commission</span>
                    <span>€{simulationResult.pricing.room_subtotal_net - simulationResult.pricing.supplier_commission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplier VAT (+{simulationResult.contract?.economics.supplier_vat_pct}%)</span>
                    <span>+€{simulationResult.pricing.supplier_vat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fees Included</span>
                    <span>+€{simulationResult.pricing.fees_included}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fees at Property</span>
                    <span>€{simulationResult.pricing.fees_pay_at_property}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Your Cost</span>
                      <span>€{simulationResult.pricing.room_subtotal_net - simulationResult.pricing.supplier_commission + simulationResult.pricing.supplier_vat + simulationResult.pricing.fees_included}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Markup (+{simulationResult.rateBand?.markup[simulationParams.channel === 'b2c' ? 'b2c_pct' : 'b2b_pct']}%)</span>
                    <span>+€{simulationResult.pricing.markup_amount}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Customer Price</span>
                      <span>€{simulationResult.pricing.total_due_now}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="availability" className="mt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Capacity</span>
                    <span>{simulationResult.availability.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Capacity</span>
                    <span>{simulationResult.availability.minCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Dates</span>
                    <span>{simulationResult.availability.dates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nights</span>
                    <span>{simulationResult.availability.nights}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Daily Allocations</div>
                  <div className="space-y-1">
                    {simulationResult.allocations.map((allocation: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{new Date(allocation.start_date).toLocaleDateString()} - {new Date(allocation.end_date).toLocaleDateString()}</span>
                        <span>{allocation.capacity} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
