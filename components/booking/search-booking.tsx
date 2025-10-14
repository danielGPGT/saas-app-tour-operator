/**
 * SEARCH & BOOKING COMPONENT
 * Uses the pricing engine to search and book inventory
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Users, MapPin, Building2, Ticket, Car, Compass, Utensils } from 'lucide-react'
import { createPricingEngine, searchRates, type PricingResponse } from '@/lib/pricing-engine'
import type { 
  InventoryItem, 
  UnifiedRate, 
  UnifiedOffer, 
  UnifiedContract, 
  UnifiedPricingPolicy,
  Allocation 
} from '@/types/unified-inventory'

interface SearchBookingProps {
  items: InventoryItem[]
  rates: UnifiedRate[]
  offers: UnifiedOffer[]
  contracts: UnifiedContract[]
  policies: UnifiedPricingPolicy[]
  allocations: Allocation[]
  onBook: (bookingData: any) => void
}

const ITEM_ICONS = {
  hotel: Building2,
  ticket: Ticket,
  transfer: Car,
  activity: Compass,
  meal: Utensils,
  other: MapPin
}

export function SearchBooking({
  items,
  rates,
  offers,
  contracts,
  policies,
  allocations,
  onBook
}: SearchBookingProps) {
  const [searchCriteria, setSearchCriteria] = useState({
    item_id: '',
    check_in: '',
    check_out: '',
    quantity: 1,
    channel: 'web' as 'web' | 'b2b' | 'internal'
  })

  const [searchResults, setSearchResults] = useState<Array<{
    offer: UnifiedOffer
    rate: UnifiedRate
    price?: PricingResponse
  }>>([])

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Create pricing engine
  const pricingEngine = useMemo(() => 
    createPricingEngine(rates, offers, contracts, policies, allocations),
    [rates, offers, contracts, policies, allocations]
  )

  const handleSearch = () => {
    if (!searchCriteria.item_id || !searchCriteria.check_in || !searchCriteria.check_out) {
      alert('Please fill in all required fields')
      return
    }

    const item = items.find(i => i.id.toString() === searchCriteria.item_id)
    if (!item) return

    setSelectedItem(item)

    // Search for available rates
    const results = searchRates(
      item,
      searchCriteria.check_in,
      searchCriteria.check_out,
      searchCriteria.quantity,
      searchCriteria.channel,
      offers,
      rates
    )

    // Compute prices for each result
    const resultsWithPrices = results.map(({ offer, rate }) => {
      const price = pricingEngine.computePrice({
        offer_id: offer.id,
        rate_id: rate.id,
        quantity: searchCriteria.quantity,
        check_in: searchCriteria.check_in,
        check_out: searchCriteria.check_out,
        channel: searchCriteria.channel
      })

      return { offer, rate, price }
    })

    setSearchResults(resultsWithPrices)
  }

  const handleBook = (offer: UnifiedOffer, rate: UnifiedRate, price: PricingResponse) => {
    const bookingData = {
      offer_id: offer.id,
      rate_id: rate.id,
      customer_price: price.gross_rate * searchCriteria.quantity,
      currency: price.currency,
      quantity: searchCriteria.quantity,
      check_in: searchCriteria.check_in,
      check_out: searchCriteria.check_out,
      channel: searchCriteria.channel,
      pricing_snapshot: pricingEngine.createBookingSnapshot(
        `booking_${Date.now()}`,
        price,
        searchCriteria.quantity
      )
    }

    onBook(bookingData)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Book Inventory</CardTitle>
          <CardDescription>
            Find available inventory and get real-time pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item">Inventory Item *</Label>
              <Select
                value={searchCriteria.item_id}
                onValueChange={(value) => setSearchCriteria({ ...searchCriteria, item_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select inventory item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => {
                    const Icon = ITEM_ICONS[item.item_type as keyof typeof ITEM_ICONS] || ITEM_ICONS.other
                    return (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Sales Channel</Label>
              <Select
                value={searchCriteria.channel}
                onValueChange={(value: any) => setSearchCriteria({ ...searchCriteria, channel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web (Direct)</SelectItem>
                  <SelectItem value="b2b">B2B (Agents)</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in">Check-in Date *</Label>
              <Input
                id="check_in"
                type="date"
                value={searchCriteria.check_in}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, check_in: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_out">Check-out Date *</Label>
              <Input
                id="check_out"
                type="date"
                value={searchCriteria.check_out}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, check_out: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={searchCriteria.quantity}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, quantity: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Search Availability
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Options</CardTitle>
            <CardDescription>
              Found {searchResults.length} available option{searchResults.length !== 1 ? 's' : ''} for {selectedItem?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchResults.map(({ offer, rate, price }) => (
              <div key={`${offer.id}-${rate.id}`} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rate.categoryName}</h4>
                      <Badge variant={offer.channel === 'web' ? 'default' : offer.channel === 'b2b' ? 'secondary' : 'outline'}>
                        {offer.channel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{offer.contractName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{rate.valid_from} to {rate.valid_to}</span>
                      </div>
                    </div>
                  </div>

                  {price && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {price.currency} {price.gross_rate.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per unit
                      </div>
                    </div>
                  )}
                </div>

                {price && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-2">Pricing Breakdown</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Net Rate:</span>
                            <span>{price.currency} {price.breakdown.base_net.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Markup ({price.breakdown.markup_policy.strategy}):</span>
                            <span>{price.currency} {price.breakdown.markup_policy.applied_markup.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{price.currency} {price.gross_rate.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-medium mb-2">Availability</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <span>{price.availability.allocated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available:</span>
                            <span className={price.availability.available > 0 ? 'text-green-600' : 'text-red-600'}>
                              {price.availability.available}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Can Book:</span>
                            <span className={price.availability.can_book ? 'text-green-600' : 'text-red-600'}>
                              {price.availability.can_book ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleBook(offer, rate, price)}
                        disabled={!price.availability.can_book}
                        className="min-w-24"
                      >
                        {price.availability.can_book ? 'Book Now' : 'Unavailable'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {searchResults.length === 0 && selectedItem && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No available options found for the selected criteria.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
