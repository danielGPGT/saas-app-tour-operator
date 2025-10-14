'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RateBandSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { RateBand } from '@/types/domain'
import { useContracts } from '@/hooks/use-contracts'
import { useRateBands } from '@/hooks/use-rate-bands'
import { useAllocations } from '@/hooks/use-allocations'
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'
import { useRoomBlocks } from '@/hooks/use-room-blocks'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus, Calendar as CalendarIcon, Trash2, Edit, Euro } from 'lucide-react'
import { format } from 'date-fns'

interface RateBandFormProps {
  rateBand?: RateBand | null
  onSubmit: (data: Partial<RateBand>) => void
  onCancel: () => void
  tab?: string
  productId?: string
}

export function RateBandForm({ rateBand, onSubmit, onCancel, tab = 'pricing', productId }: RateBandFormProps) {
  const { data: contracts } = useContracts()
  const { data: rateBands } = useRateBands()
  const { data: allocations } = useAllocations()
  const { data: products } = useProducts()
  const { data: resources } = useResources()
  const { data: roomBlocks } = useRoomBlocks()
  
  // Move date rates state to component level to avoid hook order issues
  const [dateRates, setDateRates] = useState<{[date: string]: any}>(rateBand?.date_rates || {})
  const [newDateInput, setNewDateInput] = useState('')
  
  // Sync dateRates state when rateBand changes
  React.useEffect(() => {
    if (rateBand?.date_rates) {
      setDateRates(rateBand.date_rates)
    }
  }, [rateBand?.date_rates])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(RateBandSchema),
    mode: 'onChange',
    defaultValues: {
      product_id: rateBand?.product_id || productId || '',
      contract_id: rateBand?.contract_id || '',
      band_start: rateBand?.band_start || '',
      band_end: rateBand?.band_end || '',
      currency: rateBand?.currency || 'EUR',
      weekday_mask: rateBand?.weekday_mask || 127, // All days by default
      active: rateBand?.active ?? true,
      base_rate: rateBand?.base_rate || 0,
      pricing_unit: rateBand?.pricing_unit || 'per_room',
      additional_person_charge: rateBand?.additional_person_charge || 0,
      max_occupancy: rateBand?.max_occupancy || 4,
      markup: rateBand?.markup || {
        b2c_pct: 0,
        b2b_pct: 0
      }
    }
  })

  const selectedContractId = watch('contract_id')
  const active = watch('active')

  // Pool ID management
  const [openPoolCombo, setOpenPoolCombo] = useState(false)
  const [poolIdInput, setPoolIdInput] = useState('')

  const getExistingPoolIds = () => {
    if (!allocations || !products) return []
    const currentProduct = products.find(p => p.id === productId)
    if (!currentProduct) return []
    
    const productAllocations = allocations.filter(a => a.product_id === productId)
    const uniquePoolIds = [...new Set(productAllocations.map(a => a.pool_id))].filter(Boolean)
    
    return uniquePoolIds.map(poolId => ({
      value: poolId,
      label: poolId,
      description: `${productAllocations.filter(a => a.pool_id === poolId).length} allocations`
    }))
  }

  const existingPoolIds = getExistingPoolIds()

  const handleFormSubmit = (data: any) => {
    console.log('Form data before processing:', data);
    
    // Basic validation
    if (!data.contract_id) {
      alert('Please select a contract');
      return;
    }
    
    if (!data.band_start || !data.band_end) {
      alert('Please fill in start and end dates');
      return;
    }
    
    if (!data.base_rate || data.base_rate <= 0) {
      alert('Please enter a valid base rate');
      return;
    }
    
    console.log('Final form data:', data);
    onSubmit(data)
  }

  const selectedContract = contracts?.find(c => c.id === selectedContractId)

  // Weekday mask helper
  const weekdayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 4, label: 'Wednesday' },
    { value: 8, label: 'Thursday' },
    { value: 16, label: 'Friday' },
    { value: 32, label: 'Saturday' },
    { value: 64, label: 'Sunday' }
  ]

  const updateWeekdayMask = (dayValue: number, checked: boolean) => {
    const currentMask = watch('weekday_mask')
    const newMask = checked 
      ? currentMask | dayValue 
      : currentMask & ~dayValue
    setValue('weekday_mask', newMask)
  }

  const renderPricingTab = () => (
    <div className="space-y-6">
       <div className="space-y-2">
         <Label htmlFor="contract_id">Contract *</Label>
         <Select
           value={watch('contract_id')}
           onValueChange={(value) => setValue('contract_id', value)}
         >
           <SelectTrigger>
             <SelectValue placeholder="Select a contract" />
           </SelectTrigger>
           <SelectContent>
             {contracts?.filter(c => c.active).map(contract => (
               <SelectItem key={contract.id} value={contract.id}>
                 {contract.id} - {contract.supplier_id}
               </SelectItem>
             ))}
             <SelectItem value="buy-to-order">
               Buy-to-Order (No Contract)
             </SelectItem>
           </SelectContent>
         </Select>
         {errors.contract_id && (
           <p className="text-sm text-red-600">{errors.contract_id.message}</p>
         )}
         {selectedContract && (
           <p className="text-sm text-muted-foreground">
             Commission: {selectedContract.economics.commission_pct}% • 
             VAT: {selectedContract.economics.supplier_vat_pct}%
           </p>
         )}
      {watch('contract_id') === 'buy-to-order' && (
        <div className="space-y-4">
          <p className="text-sm text-orange-600 font-medium">
            ⚠️ Buy-to-Order: This item will be sourced later
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Pricing Formula</h5>
            <p className="text-sm text-blue-800">
              <strong>Sell Price =</strong> Base Rate × (1 + Markup %)
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Example: €80 × 1.50 = €120 (with 50% markup)
            </p>
          </div>
        </div>
      )}
       </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="band_start">Start Date *</Label>
          <Input
            id="band_start"
            type="date"
            {...register('band_start')}
          />
          {errors.band_start && (
            <p className="text-sm text-red-600">{errors.band_start.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="band_end">End Date *</Label>
          <Input
            id="band_end"
            type="date"
            {...register('band_end')}
          />
          {errors.band_end && (
            <p className="text-sm text-red-600">{errors.band_end.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={watch('currency')}
            onValueChange={(value) => setValue('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CHF">CHF</SelectItem>
            </SelectContent>
          </Select>
          {errors.currency && (
            <p className="text-sm text-red-600">{errors.currency.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricing_unit">Pricing Unit *</Label>
          <Select
            value={watch('pricing_unit')}
            onValueChange={(value) => setValue('pricing_unit', value as 'per_room' | 'per_person' | 'per_vehicle' | 'per_seat' | 'per_unit')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pricing unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per_room">Per Room (Hotels)</SelectItem>
              <SelectItem value="per_person">Per Person (Tours, Activities)</SelectItem>
              <SelectItem value="per_vehicle">Per Vehicle (Transfers)</SelectItem>
              <SelectItem value="per_seat">Per Seat (Flights, Buses)</SelectItem>
              <SelectItem value="per_unit">Per Unit (Tickets, Extras)</SelectItem>
            </SelectContent>
          </Select>
          {errors.pricing_unit && (
            <p className="text-sm text-red-600">{errors.pricing_unit.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="base_rate">
          {watch('contract_id') === 'buy-to-order' ? 'Estimated Cost *' : 'Base Rate *'}
        </Label>
        <Input
          id="base_rate"
          type="number"
          step="0.01"
          {...register('base_rate', { valueAsNumber: true })}
          placeholder={watch('contract_id') === 'buy-to-order' ? "80.00" : "150.00"}
        />
        {errors.base_rate && (
          <p className="text-sm text-red-600">{errors.base_rate.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {watch('contract_id') === 'buy-to-order' 
            ? 'Your estimated supplier cost per ' + (watch('pricing_unit')?.replace('per_', '') || 'unit')
            : 'Base price per ' + (watch('pricing_unit')?.replace('per_', '') || 'unit')
          }
        </p>
      </div>

      {watch('pricing_unit') === 'per_room' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="additional_person_charge">Additional Person Charge</Label>
            <Input
              id="additional_person_charge"
              type="number"
              step="0.01"
              {...register('additional_person_charge', { valueAsNumber: true })}
              placeholder="30.00"
            />
            <p className="text-xs text-muted-foreground">
              Extra charge for 3rd, 4th person, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_occupancy">Max Occupancy</Label>
            <Input
              id="max_occupancy"
              type="number"
              {...register('max_occupancy', { valueAsNumber: true })}
              placeholder="4"
            />
            <p className="text-xs text-muted-foreground">
              Maximum people per room
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={active}
          onCheckedChange={(checked) => setValue('active', checked)}
        />
        <Label htmlFor="active">Active rate band</Label>
      </div>

      <div className="p-4 border rounded-lg bg-blue-50">
        <h4 className="font-medium text-blue-900 mb-2">Pricing Calculation</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>1. NET Rate = Occupancy Price + Board Cost (if included)</div>
          <div>2. After Commission = NET Rate - Commission%</div>
          <div>3. After VAT = After Commission + Supplier VAT%</div>
          <div>4. Customer Price = After VAT + Markup%</div>
        </div>
      </div>
    </div>
  )

  const renderAvailabilityTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Weekday Availability</Label>
        <p className="text-sm text-muted-foreground">
          Select which days of the week this rate band is available
        </p>
        <div className="grid grid-cols-2 gap-2">
          {weekdayOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`day-${option.value}`}
                checked={(watch('weekday_mask') & option.value) > 0}
                onChange={(e) => updateWeekdayMask(option.value, e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor={`day-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Use the weekday selection above to control when this rate is available.</p>
      </div>
    </div>
  )

  const renderDateRatesTab = () => {
    const addDateRate = () => {
      if (newDateInput.trim()) {
        const updated = {
          ...dateRates,
          [newDateInput]: {
            single_double: 0,
            additional_person: 0,
            max_occupancy: 4,
            rate_includes: ''
          }
        }
        setDateRates(updated)
        setValue('date_rates', updated)
        setNewDateInput('')
      }
    }

    const updateDateRate = (date: string, field: string, value: any) => {
      const updated = {
        ...dateRates,
        [date]: {
          ...dateRates[date],
          [field]: value
        }
      }
      setDateRates(updated)
      setValue('date_rates', updated)
    }

    const removeDateRate = (date: string) => {
      const updated = { ...dateRates }
      delete updated[date]
      setDateRates(updated)
      setValue('date_rates', updated)
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Date-Specific Pricing</h3>
          <p className="text-sm text-muted-foreground">
            Set different rates for specific dates (e.g., weekday vs weekend)
          </p>
        </div>

        {/* Add new date rate */}
        <div className="flex gap-2">
          <Input
            type="date"
            value={newDateInput}
            onChange={(e) => setNewDateInput(e.target.value)}
            placeholder="YYYY-MM-DD"
            className="flex-1"
          />
          <Button type="button" onClick={addDateRate} disabled={!newDateInput}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(dateRates)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, rate]) => {
              const dateObj = new Date(date)
              const dayName = format(dateObj, 'EEEE')
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
              
              return (
                <div key={date} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">
                          {format(dateObj, 'MMM dd, yyyy')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {dayName} {isWeekend && '• Weekend'}
                        </p>
                      </div>
                      {isWeekend && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          Weekend
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDateRate(date)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Single/Double Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={rate.single_double || ''}
                        onChange={(e) => updateDateRate(date, 'single_double', parseFloat(e.target.value) || 0)}
                        placeholder="276.00"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Person Charge</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={rate.additional_person || ''}
                        onChange={(e) => updateDateRate(date, 'additional_person', parseFloat(e.target.value) || 0)}
                        placeholder="30.00"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Occupancy</Label>
                      <Select
                        value={rate.max_occupancy?.toString() || '4'}
                        onValueChange={(value) => updateDateRate(date, 'max_occupancy', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 person</SelectItem>
                          <SelectItem value="2">2 persons</SelectItem>
                          <SelectItem value="3">3 persons</SelectItem>
                          <SelectItem value="4">4 persons</SelectItem>
                          <SelectItem value="5">5 persons</SelectItem>
                          <SelectItem value="6">6 persons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Rate Includes</Label>
                      <Input
                        value={rate.rate_includes || ''}
                        onChange={(e) => updateDateRate(date, 'rate_includes', e.target.value)}
                        placeholder="Breakfast, WiFi, Parking"
                      />
                    </div>
                  </div>
                </div>
              )
            })}

          {Object.keys(dateRates).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No date-specific rates configured</p>
              <p className="text-sm">Enter a date above to set different rates for specific dates</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMarkupTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="markup_b2c">B2C Markup % *</Label>
          <Input
            id="markup_b2c"
            type="number"
            step="0.01"
            min="0"
            {...register('markup.b2c_pct', { valueAsNumber: true })}
            placeholder="25.00"
          />
          {errors.markup?.b2c_pct && (
            <p className="text-sm text-red-600">{errors.markup.b2c_pct.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="markup_b2b">B2B Markup % *</Label>
          <Input
            id="markup_b2b"
            type="number"
            step="0.01"
            min="0"
            {...register('markup.b2b_pct', { valueAsNumber: true })}
            placeholder="15.00"
          />
          {errors.markup?.b2b_pct && (
            <p className="text-sm text-red-600">{errors.markup.b2b_pct.message}</p>
          )}
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-blue-50">
        <h4 className="font-medium text-blue-900 mb-2">Pricing Calculation</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>1. NET Rate = Occupancy Price + Board Cost (if included)</div>
          <div>2. After Commission = NET Rate - Commission%</div>
          <div>3. After VAT = After Commission + Supplier VAT%</div>
          <div>4. Customer Price = After VAT + Markup%</div>
        </div>
      </div>
    </div>
  )


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {tab === 'pricing' && renderPricingTab()}
      {tab === 'date-rates' && renderDateRatesTab()}
      {tab === 'availability' && renderAvailabilityTab()}
      {tab === 'markup' && renderMarkupTab()}
    </form>
  )
}
