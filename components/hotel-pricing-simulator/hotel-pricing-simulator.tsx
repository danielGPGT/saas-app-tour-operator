'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  Calculator, 
  Calendar as CalendarIcon, 
  Users, 
  Bed, 
  Utensils, 
  TrendingUp,
  Clock,
  MapPin,
  Star,
  DollarSign
} from 'lucide-react'
import { format, addDays, differenceInDays, isWithinInterval } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { InventoryItem, UnifiedRate, UnifiedContract } from '@/types/unified-inventory'

interface HotelPricingSimulatorProps {
  item: InventoryItem
  rates: UnifiedRate[]
  contracts: UnifiedContract[]
}

interface BookingScenario {
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
  roomType: string
  boardType: string
  nights: number
}

export function HotelPricingSimulator({ item, rates, contracts }: HotelPricingSimulatorProps) {
  const [checkIn, setCheckIn] = useState<Date>(new Date())
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 2))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [selectedRoomType, setSelectedRoomType] = useState<string>('')
  const [selectedBoardType, setSelectedBoardType] = useState<string>('bb')
  const [groupDiscount, setGroupDiscount] = useState(0)
  const [earlyBirdDiscount, setEarlyBirdDiscount] = useState(0)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false)

  const boardTypes = [
    { id: 'ro', name: 'Room Only', cost: 0, icon: Bed },
    { id: 'bb', name: 'Bed & Breakfast', cost: 25, icon: Utensils },
    { id: 'hb', name: 'Half Board', cost: 45, icon: Utensils },
    { id: 'fb', name: 'Full Board', cost: 65, icon: Utensils },
    { id: 'ai', name: 'All Inclusive', cost: 85, icon: Utensils }
  ]

  const nights = differenceInDays(checkOut, checkIn)
  const totalGuests = adults + children

  // Get available rates for the selected room type and date range
  const availableRates = useMemo(() => {
    if (!selectedRoomType) return []
    
    return rates.filter(rate => 
      rate.item_id === item.id &&
      rate.category_id === selectedRoomType &&
      rate.active &&
      isWithinInterval(checkIn, {
        start: new Date(rate.valid_from),
        end: new Date(rate.valid_to)
      })
    )
  }, [rates, item.id, selectedRoomType, checkIn])

  // Calculate rate periods for the stay
  const ratePeriods = useMemo(() => {
    if (!selectedRoomType || availableRates.length === 0) return []
    
    const periods = []
    let currentDate = new Date(checkIn)
    
    while (currentDate < checkOut) {
      // Find the rate that applies to this date
      const applicableRate = availableRates.find(rate => 
        currentDate >= new Date(rate.valid_from) && 
        currentDate < new Date(rate.valid_to)
      )
      
      if (applicableRate) {
        // Find the end of this rate period (either rate end or stay end)
        const rateEndDate = new Date(Math.min(
          new Date(applicableRate.valid_to).getTime(),
          checkOut.getTime()
        ))
        
        const nightsInPeriod = differenceInDays(rateEndDate, currentDate)
        
        periods.push({
          rate: applicableRate,
          startDate: new Date(currentDate),
          endDate: new Date(rateEndDate),
          nights: nightsInPeriod,
          baseRate: applicableRate.base_rate
        })
        
        currentDate = rateEndDate
      } else {
        // No rate found for this date - break
        break
      }
    }
    
    return periods
  }, [availableRates, checkIn, checkOut, selectedRoomType])

  // Get contract for this item
  const contract = contracts.find(c => c.item_id === item.id && c.active)

  const calculatePricing = () => {
    if (!selectedRoomType || ratePeriods.length === 0) return null

    const currency = contract?.currency || 'AED'
    
    // Get contract plugin data
    const pluginData = contract?.plugin_data || {}
    
    // Get hotel-specific fees and taxes from plugin data
    const supplierCommissionRate = pluginData.supplier_commission_rate || 0
    const supplierVatRate = pluginData.supplier_vat_rate || 0
    const defaultMarkupPercentage = pluginData.default_markup_percentage || 0
    const cityTax = pluginData.city_tax
    const resortFee = pluginData.resort_fee
    
    // Board type cost (included in room rate)
    const boardConfig = boardTypes.find(b => b.id === selectedBoardType)
    const boardCost = boardConfig?.cost || 0
    
    // Calculate pricing for each rate period
    const periodPricing = ratePeriods.map(period => {
      const roomRate = period.baseRate + boardCost
      const markedUpRate = roomRate * (1 + defaultMarkupPercentage)
      const earlyBirdRate = markedUpRate * (1 - earlyBirdDiscount / 100)
      const groupRate = earlyBirdRate * (1 - groupDiscount / 100)
      const periodSubtotal = groupRate * period.nights
      
      return {
        ...period,
        roomRate,
        markedUpRate,
        earlyBirdRate,
        groupRate,
        subtotal: periodSubtotal
      }
    })
    
    // Calculate total subtotal across all periods
    const subtotal = periodPricing.reduce((sum, period) => sum + period.subtotal, 0)
    
    // Calculate weighted average base rate for display
    const totalNights = periodPricing.reduce((sum, period) => sum + period.nights, 0)
    const weightedAverageBaseRate = periodPricing.reduce((sum, period) => 
      sum + (period.baseRate * period.nights), 0) / totalNights
    
    // Calculate city tax
    let cityTaxAmount = 0
    if (cityTax) {
      if (cityTax.mode === 'per_person_per_night') {
        cityTaxAmount = cityTax.amount * totalGuests * nights
      } else if (cityTax.mode === 'per_room_per_night') {
        cityTaxAmount = cityTax.amount * nights
      }
    }
    
    // Calculate resort fee
    let resortFeeAmount = 0
    if (resortFee) {
      resortFeeAmount = resortFee.amount * nights
    }
    
    // Calculate supplier commission (this is what we pay the supplier)
    const supplierCommission = subtotal * supplierCommissionRate
    
    // Calculate supplier VAT (VAT on our cost)
    const supplierVat = supplierCommission * supplierVatRate
    
    // Calculate customer VAT (VAT on selling price)
    const customerVatRate = contract?.vat_rate || 0
    const customerVat = (subtotal + cityTaxAmount + resortFeeAmount) * (customerVatRate / 100)
    
    // Calculate total
    const total = subtotal + cityTaxAmount + resortFeeAmount + customerVat

    return {
      baseRate: weightedAverageBaseRate,
      boardCost,
      roomRate: weightedAverageBaseRate + boardCost,
      markedUpRate: (weightedAverageBaseRate + boardCost) * (1 + defaultMarkupPercentage),
      earlyBirdRate: (weightedAverageBaseRate + boardCost) * (1 + defaultMarkupPercentage) * (1 - earlyBirdDiscount / 100),
      groupRate: (weightedAverageBaseRate + boardCost) * (1 + defaultMarkupPercentage) * (1 - earlyBirdDiscount / 100) * (1 - groupDiscount / 100),
      subtotal,
      cityTaxAmount,
      resortFeeAmount,
      customerVat,
      supplierCommission,
      supplierVat,
      total,
      nights,
      currency,
      contract,
      rate: ratePeriods[0]?.rate,
      pluginData,
      cityTax,
      resortFee,
      defaultMarkupPercentage,
      periodPricing,
      ratePeriods
    }
  }

  const pricing = calculatePricing()

  const quickScenarios = [
    {
      name: 'Weekend Getaway',
      description: '2 nights, 2 adults, BB',
      action: () => {
        setCheckIn(new Date())
        setCheckOut(addDays(new Date(), 2))
        setAdults(2)
        setChildren(0)
        setSelectedBoardType('bb')
        setGroupDiscount(0)
        setEarlyBirdDiscount(0)
      }
    },
    {
      name: 'Family Vacation',
      description: '7 nights, 2 adults, 2 children, HB',
      action: () => {
        setCheckIn(new Date())
        setCheckOut(addDays(new Date(), 7))
        setAdults(2)
        setChildren(2)
        setSelectedBoardType('hb')
        setGroupDiscount(10)
        setEarlyBirdDiscount(5)
      }
    },
    {
      name: 'Business Trip',
      description: '3 nights, 1 adult, Room Only',
      action: () => {
        setCheckIn(new Date())
        setCheckOut(addDays(new Date(), 3))
        setAdults(1)
        setChildren(0)
        setSelectedBoardType('ro')
        setGroupDiscount(0)
        setEarlyBirdDiscount(0)
      }
    },
    {
      name: 'Luxury Stay',
      description: '5 nights, 2 adults, All Inclusive',
      action: () => {
        setCheckIn(new Date())
        setCheckOut(addDays(new Date(), 5))
        setAdults(2)
        setChildren(0)
        setSelectedBoardType('ai')
        setGroupDiscount(15)
        setEarlyBirdDiscount(10)
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Hotel Pricing Simulator</h3>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Booking Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Booking Details
            </CardTitle>
            <CardDescription>Configure your stay parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in</Label>
                <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkIn && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="w-80 p-3">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={(date) => {
                          if (date) {
                            setCheckIn(date)
                            if (date >= checkOut) {
                              setCheckOut(addDays(date, 1))
                            }
                          }
                          setIsCheckInOpen(false)
                        }}
                        initialFocus
                        className="rounded-md border"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Check-out</Label>
                <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkOut && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="w-80 p-3">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={(date) => {
                          if (date && date > checkIn) {
                            setCheckOut(date)
                          }
                          setIsCheckOutOpen(false)
                        }}
                        disabled={(date) => date <= checkIn}
                        initialFocus
                        className="rounded-md border"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Guests */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Adults</Label>
                <Input
                  type="number"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label>Children</Label>
                <Input
                  type="number"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  min="0"
                  max="10"
                />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <Label>Room Type</Label>
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {item.categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Board Type */}
            <div>
              <Label>Board Type</Label>
              <Select value={selectedBoardType} onValueChange={setSelectedBoardType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boardTypes.map(board => {
                    const Icon = board.icon
                    return (
                      <SelectItem key={board.id} value={board.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {board.name} {board.cost > 0 && `(+${board.cost}/night)`}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Discounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Group Discount (%)</Label>
                <Input
                  type="number"
                  value={groupDiscount}
                  onChange={(e) => setGroupDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <Label>Early Bird (%)</Label>
                <Input
                  type="number"
                  value={earlyBirdDiscount}
                  onChange={(e) => setEarlyBirdDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing Breakdown
            </CardTitle>
            <CardDescription>Detailed cost calculation</CardDescription>
          </CardHeader>
          <CardContent>
            {pricing ? (
              <div className="space-y-4">
                {/* Stay Summary */}
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <div className="font-medium text-blue-800 mb-2">Stay Summary</div>
                  <div className="text-blue-700 space-y-1">
                    <div>Check-in: {format(checkIn, "PPP")}</div>
                    <div>Check-out: {format(checkOut, "PPP")}</div>
                    <div>Nights: {nights} night{nights !== 1 ? 's' : ''}</div>
                    <div>Guests: {adults} adult{adults !== 1 ? 's' : ''} {children > 0 && `+ ${children} child${children !== 1 ? 'ren' : ''}`}</div>
                    <div>Room: {item.categories.find(c => c.id === selectedRoomType)?.category_name}</div>
                    <div>Board: {boardTypes.find(b => b.id === selectedBoardType)?.name} {boardTypes.find(b => b.id === selectedBoardType)?.cost > 0 && `(+${boardTypes.find(b => b.id === selectedBoardType)?.cost}/night)`}</div>
                  </div>
                </div>

                {/* Rate Period Breakdown */}
                {pricing.ratePeriods && pricing.ratePeriods.length > 1 && (
                  <div className="bg-blue-50 p-3 rounded text-sm mb-4">
                    <div className="font-medium text-blue-800 mb-2">Rate Period Breakdown:</div>
                    <div className="space-y-2">
                      {pricing.ratePeriods.map((period, index) => (
                        <div key={index} className="flex justify-between text-blue-700">
                          <span>
                            {format(period.startDate, "MMM dd")} - {format(period.endDate, "MMM dd")} 
                            ({period.nights} night{period.nights !== 1 ? 's' : ''})
                          </span>
                          <span>{pricing.currency} {period.baseRate.toFixed(2)}/night</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Rate (per night):</span>
                    <span>{pricing.currency} {pricing.roomRate.toFixed(2)}</span>
                  </div>
                  {pricing.defaultMarkupPercentage > 0 && (
                    <div className="flex justify-between">
                      <span>Markup ({(pricing.defaultMarkupPercentage * 100).toFixed(1)}%):</span>
                      <span>{pricing.currency} {(pricing.markedUpRate - pricing.roomRate).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Room Rate (per night):</span>
                    <span>{pricing.currency} {pricing.markedUpRate.toFixed(2)}</span>
                  </div>
                  
                  {earlyBirdDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Early Bird ({earlyBirdDiscount}%):</span>
                      <span>-{pricing.currency} {((pricing.markedUpRate - pricing.earlyBirdRate) * nights).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {groupDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Group Discount ({groupDiscount}%):</span>
                      <span>-{pricing.currency} {((pricing.earlyBirdRate - pricing.groupRate) * nights).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Subtotal ({nights} nights):</span>
                    <span>{pricing.currency} {pricing.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Hotel-specific fees and taxes */}
                  {pricing.cityTaxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>City Tax ({pricing.cityTax?.mode === 'per_person_per_night' ? 'pppn' : 'prpn'}):</span>
                      <span>{pricing.currency} {pricing.cityTaxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {pricing.resortFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Resort Fee:</span>
                      <span>{pricing.currency} {pricing.resortFeeAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Customer VAT ({pricing.contract?.vat_rate || 0}%):</span>
                    <span>{pricing.currency} {pricing.customerVat.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{pricing.currency} {pricing.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Per night:</span>
                    <span>{pricing.currency} {(pricing.total / nights).toFixed(2)}</span>
                  </div>
                </div>

                {/* Supplier Economics */}
                {(pricing.supplierCommission > 0 || pricing.supplierVat > 0) && (
                  <div className="bg-blue-50 p-3 rounded text-sm mt-4">
                    <div className="font-medium text-blue-800 mb-2">Supplier Economics:</div>
                    <div className="text-blue-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Our Cost to Supplier:</span>
                        <span>{pricing.currency} {pricing.supplierCommission.toFixed(2)}</span>
                      </div>
                      {pricing.supplierVat > 0 && (
                        <div className="flex justify-between">
                          <span>Supplier VAT:</span>
                          <span>{pricing.currency} {pricing.supplierVat.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium">
                        <span>Total Supplier Cost:</span>
                        <span>{pricing.currency} {(pricing.supplierCommission + pricing.supplierVat).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Our Margin:</span>
                        <span>{pricing.currency} {(pricing.total - pricing.supplierCommission - pricing.supplierVat).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show actual data being used */}
                {(pricing.contract || pricing.rate) && (
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <div className="font-medium text-green-800 mb-2">Using Real Hotel Contract Data:</div>
                    {pricing.contract && (
                      <div className="text-green-700 space-y-1">
                        <div>Contract: {pricing.contract.contract_name}</div>
                        <div>Customer VAT: {pricing.contract.vat_rate}%</div>
                        {pricing.pluginData.supplier_commission_rate && (
                          <div>Supplier Commission: {(pricing.pluginData.supplier_commission_rate * 100).toFixed(1)}%</div>
                        )}
                        {pricing.pluginData.supplier_vat_rate && (
                          <div>Supplier VAT: {(pricing.pluginData.supplier_vat_rate * 100).toFixed(1)}%</div>
                        )}
                        {pricing.defaultMarkupPercentage > 0 && (
                          <div>Markup: {(pricing.defaultMarkupPercentage * 100).toFixed(1)}%</div>
                        )}
                        {pricing.cityTax && (
                          <div>City Tax: {pricing.cityTax.amount} {pricing.currency} {pricing.cityTax.mode === 'per_person_per_night' ? 'pppn' : 'prpn'}</div>
                        )}
                        {pricing.resortFee && (
                          <div>Resort Fee: {pricing.resortFee.amount} {pricing.currency} prpn</div>
                        )}
                      </div>
                    )}
                    {pricing.rate && (
                      <div className="text-green-700">
                        <div>Rate: {pricing.rate.rate_name || 'Active Rate'}</div>
                        <div>Valid: {pricing.rate.valid_from} to {pricing.rate.valid_to}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calculator className="h-8 w-8 mx-auto mb-2" />
                <p>Select a room type to see pricing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Scenarios</CardTitle>
          <CardDescription>Test common booking scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickScenarios.map((scenario, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={scenario.action}
                className="h-auto p-3 text-left"
              >
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {scenario.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
