'use client'

import { useState } from 'react'
import { 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  Eye,
  ShoppingCart,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, Resource } from '@/types/domain'

interface SearchResult {
  id: string
  product: Product
  resource: Resource
  rateBand: any
  contract: any
  allocation: any
  pricing: {
    total_due_now: number
    room_subtotal_net: number
    supplier_commission: number
    supplier_vat: number
    fees_included: number
    fees_pay_at_property: number
    markup_amount: number
    breakdown: any
  }
  availability: {
    capacity: number
    available: number
    max_bookable: number
  }
  isBuyToOrder?: boolean
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  searchParams: any
}

export function SearchResults({ results, isLoading, searchParams }: SearchResultsProps) {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)

  const handleBook = (result: SearchResult) => {
    setSelectedResult(result)
    setIsBookingDialogOpen(true)
  }

  const handleHold = (result: SearchResult) => {
    // TODO: Implement hold functionality
    console.log('Hold result:', result.id)
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

  const getOccupancyText = (adults: number, children: number[]) => {
    let text = `${adults} ${adults === 1 ? 'Adult' : 'Adults'}`
    if (children.length > 0) {
      text += ` + ${children.length} ${children.length === 1 ? 'Child' : 'Children'}`
    }
    return text
  }

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          No available inventory found for your search criteria. Try adjusting your dates or product selection.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {searchParams.channel.toUpperCase()}
          </Badge>
          <Badge variant="outline">
            {calculateNights(searchParams.startDate, searchParams.endDate)} night{calculateNights(searchParams.startDate, searchParams.endDate) !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getResourceTypeIcon(result.resource.type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{result.product.name}</CardTitle>
                      {result.isBuyToOrder && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          ⚠️ Buy-to-Order
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {result.resource.name}
                      {result.resource.location && (
                        <>
                          <span>•</span>
                          {result.resource.location}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  €{result.pricing.total_due_now.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total for {getOccupancyText(searchParams.adults, searchParams.children)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Availability */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {result.availability.available} of {result.availability.capacity} available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(searchParams.startDate).toLocaleDateString()} - {new Date(searchParams.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">NET Rate</div>
                <div className="font-medium">€{result.pricing.room_subtotal_net}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Commission</div>
                <div className="font-medium">-€{result.pricing.supplier_commission}</div>
              </div>
              <div>
                <div className="text-muted-foreground">VAT</div>
                <div className="font-medium">+€{result.pricing.supplier_vat}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Markup</div>
                <div className="font-medium">+€{result.pricing.markup_amount}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Breakdown
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Pricing Breakdown</DialogTitle>
                      <DialogDescription>
                        Detailed cost breakdown for {result.product.name}
                      </DialogDescription>
                    </DialogHeader>
                    <PricingBreakdown result={result} searchParams={searchParams} />
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHold(result)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Hold (24h)
                </Button>
              </div>
              
              <Button onClick={() => handleBook(result)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Review and confirm your booking for {selectedResult?.product.name}
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <BookingConfirmation 
              result={selectedResult} 
              searchParams={searchParams}
              onConfirm={() => setIsBookingDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PricingBreakdown({ result, searchParams }: { result: SearchResult, searchParams: any }) {
  const calculateNights = (startDate: string, endDate: string) => {
    console.log('calculateNights input:', { startDate, endDate })
    
    // Handle different date formats
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    console.log('Parsed dates:', { start, end })
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid dates:', { startDate, endDate, start, end })
      return 0
    }
    
    // Calculate nights correctly: end date - start date = nights stayed
    // For hotel bookings: check-in Dec 4, check-out Dec 8 = 4 nights
    const diffTime = end.getTime() - start.getTime()
    const nights = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    console.log('Calculated nights:', nights, '(check-in:', startDate, 'check-out:', endDate, ')')
    return nights
  }
  const nights = calculateNights(searchParams.startDate, searchParams.endDate)
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="nightly">Nightly</TabsTrigger>
          <TabsTrigger value="costs">Cost Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Booking Details</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Product: {result.product.name}</div>
                <div>Dates: {new Date(searchParams.startDate).toLocaleDateString()} - {new Date(searchParams.endDate).toLocaleDateString()}</div>
                <div>Nights: {nights}</div>
                <div>Guests: {searchParams.adults} adults {searchParams.children.length > 0 && `+ ${searchParams.children.length} children`}</div>
                <div>Channel: {searchParams.channel.toUpperCase()}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Availability</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Total Capacity: {result.availability.capacity}</div>
                <div>Available: {result.availability.available}</div>
                <div>Max Bookable: {result.availability.max_bookable}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nightly" className="space-y-4">
          <div className="text-sm font-medium">Nightly Breakdown</div>
          <div className="space-y-2">
            {Array.from({ length: nights }, (_, i) => {
              const date = new Date(searchParams.startDate)
              date.setDate(date.getDate() + i)
              return (
                <div key={i} className="flex justify-between text-sm">
                  <span>{date.toLocaleDateString()}</span>
                  <span>€{Math.round(result.pricing.room_subtotal_net / nights)}</span>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Room Subtotal (NET)</span>
              <span>€{result.pricing.room_subtotal_net}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Supplier Commission (-{result.contract?.economics.commission_pct}%)</span>
              <span>-€{result.pricing.supplier_commission}</span>
            </div>
            <div className="flex justify-between">
              <span>After Commission</span>
              <span>€{result.pricing.room_subtotal_net - result.pricing.supplier_commission}</span>
            </div>
            <div className="flex justify-between">
              <span>Supplier VAT (+{result.contract?.economics.supplier_vat_pct}%)</span>
              <span>+€{result.pricing.supplier_vat}</span>
            </div>
            {result.pricing.fees_included > 0 && (
              <div className="flex justify-between">
                <span>Fees Included (We Pay)</span>
                <span>+€{result.pricing.fees_included.toFixed(2)}</span>
              </div>
            )}
            {result.pricing.fees_pay_at_property > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Fees at Property (Customer Pays)</span>
                <span>€{result.pricing.fees_pay_at_property.toFixed(2)}</span>
              </div>
            )}
            
            {/* Detailed Fees Breakdown */}
            {result.contract?.economics?.fees && result.contract.economics.fees.length > 0 && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium mb-2">Fee Details:</div>
                <div className="space-y-1 text-xs">
                  {result.contract.economics.fees.map((fee: any, index: number) => {
                    const nights = calculateNights(searchParams.startDate, searchParams.endDate)
                    let feeAmount = 0
                    
                    // Debug the fee structure and search params
                    console.log('Fee structure:', fee)
                    console.log('Search params:', searchParams)
                    console.log('Nights calculated:', nights)
                    
                    if (fee.mode === 'per_person_per_night') {
                      const amount = fee.amount || 0
                      feeAmount = searchParams.adults * nights * amount
                    } else if (fee.mode === 'per_room_per_night') {
                      const amount = fee.amount || 0
                      feeAmount = nights * amount
                    } else if (fee.mode === 'percent_of_room') {
                      const ratePct = fee.rate_pct || 0
                      feeAmount = result.pricing.room_subtotal_net * (ratePct / 100)
                    }
                    
                    console.log(`Fee ${fee.code}: mode=${fee.mode}, amount=${fee.amount}, rate_pct=${fee.rate_pct}, calculated=${feeAmount}`)
                    
                    return (
                      <div key={index} className="flex justify-between">
                        <span className="capitalize">
                          {fee.code.replace('_', ' ')} 
                          {fee.payable === 'property' && ' (at property)'}
                        </span>
                        <span>€{feeAmount.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Your Cost</span>
                <span>€{result.pricing.room_subtotal_net - result.pricing.supplier_commission + result.pricing.supplier_vat + result.pricing.fees_included}</span>
              </div>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Markup (+{result.rateBand?.markup[searchParams.channel === 'b2c' ? 'b2c_pct' : 'b2b_pct']}%)</span>
              <span>+€{result.pricing.markup_amount}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Customer Price</span>
                <span>€{result.pricing.total_due_now}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingConfirmation({ result, searchParams, onConfirm }: { 
  result: SearchResult, 
  searchParams: any, 
  onConfirm: () => void 
}) {
  const handleConfirmBooking = () => {
    // TODO: Implement booking confirmation
    console.log('Confirming booking for:', result.id)
    onConfirm()
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-green-50">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <CheckCircle className="h-4 w-4" />
          <span className="font-medium">Booking Available</span>
        </div>
        <div className="text-sm text-green-700">
          {result.availability.available} units available for booking
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Product</span>
          <span className="font-medium">{result.product.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Dates</span>
          <span>{new Date(searchParams.startDate).toLocaleDateString()} - {new Date(searchParams.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Guests</span>
          <span>{searchParams.adults} adults {searchParams.children.length > 0 && `+ ${searchParams.children.length} children`}</span>
        </div>
        <div className="flex justify-between">
          <span>Channel</span>
          <span>{searchParams.channel.toUpperCase()}</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total Price</span>
            <span>€{result.pricing.total_due_now}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onConfirm}>
          Cancel
        </Button>
        <Button onClick={handleConfirmBooking}>
          Confirm Booking
        </Button>
      </div>
    </div>
  )
}
