'use client'

import React, { useState } from 'react'
import { useForm, Control } from 'react-hook-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RateBand } from '@/types/domain'
import { useContracts } from '@/hooks/use-contracts'
import { useRateBands } from '@/hooks/use-rate-bands'
import { useAllocations } from '@/hooks/use-allocations'
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'
import { useRoomBlocks } from '@/hooks/use-room-blocks'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus, Calendar as CalendarIcon, Trash2, Edit, Euro, Info } from 'lucide-react'
import { format } from 'date-fns'
import { 
  PerRoomPricingForm, 
  PerPersonPricingForm, 
  PerVehiclePricingForm, 
  PerUnitPricingForm, 
  PerSessionPricingForm 
} from './pricing-forms'

interface RateBandFormProps {
  rateBand?: RateBand | null
  onSubmit: (data: Partial<RateBand>) => void
  onCancel: () => void
  tab?: string
  productId?: string
}

const pricingStrategyOptions = [
  { value: 'per_room', label: 'Per Room', description: 'Hotels, Accommodation', icon: '🏨' },
  { value: 'per_person', label: 'Per Person', description: 'Tickets, Activities', icon: '🎫' },
  { value: 'per_vehicle', label: 'Per Vehicle', description: 'Transfers, Tours', icon: '🚗' },
  { value: 'per_unit', label: 'Per Unit', description: 'Equipment, Rentals', icon: '📦' },
  { value: 'per_session', label: 'Per Session', description: 'Photography, Services', icon: '📸' }
]

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
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(RateBandSchema),
    mode: 'onChange',
    defaultValues: {
      product_id: rateBand?.product_id || productId || '',
      contract_id: rateBand?.contract_id || '',
      room_block_id: rateBand?.room_block_id || '',
      band_start: rateBand?.band_start || '',
      band_end: rateBand?.band_end || '',
      
      // Rate type and fulfilment
      rate_type: rateBand?.rate_type || 'STANDARD',
      fulfilment_type: rateBand?.fulfilment_type || 'instant',
      status: rateBand?.status || 'active',
      
      // Pricing strategy
      pricing_strategy: rateBand?.pricing_strategy || 'per_room',
      
      // Pricing configuration
      pricing_config: rateBand?.pricing_config || {
        // Default to hotel pricing
        base_room_rate: undefined,
        additional_person_charge: undefined,
        max_occupancy: undefined,
        includes: [],
        restrictions: [],
        validity_period: undefined
      },
      
      // Date-specific pricing
      date_rates: rateBand?.date_rates || {},
      
      // Buy-to-order
      estimated_cost: rateBand?.estimated_cost || undefined,
      buffer_margin_percent: rateBand?.buffer_margin_percent || undefined,
      
      // Tax config
      tax_config: rateBand?.tax_config || {}
    }
  })

  const selectedContractId = watch('contract_id')
  const selectedStrategy = watch('pricing_strategy')
  const active = watch('status') === 'active'

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
    console.log('Form data before processing:', data)
    
    // Basic validation
    if (!data.band_start || !data.band_end) {
      alert('Please fill in start and end dates')
      return
    }
    
    // Process date rates
    const processedData = {
      ...data,
      date_rates: Object.keys(dateRates).length > 0 ? dateRates : undefined
    }
    
    console.log('Processed form data:', processedData)
    onSubmit(processedData)
  }

  const selectedContract = contracts?.find(c => c.id === selectedContractId)

  // Date rates management
  const addDateRate = () => {
    if (newDateInput) {
      const newDateRates = {
        ...dateRates,
        [newDateInput]: {
          rate: 0,
          additional_info: ''
        }
      }
      setDateRates(newDateRates)
      setValue('date_rates', newDateRates)
      setNewDateInput('')
    }
  }

  const removeDateRate = (date: string) => {
    const newDateRates = { ...dateRates }
    delete newDateRates[date]
    setDateRates(newDateRates)
    setValue('date_rates', newDateRates)
  }

  const updateDateRate = (date: string, field: string, value: any) => {
    const newDateRates = {
      ...dateRates,
      [date]: {
        ...dateRates[date],
        [field]: value
      }
    }
    setDateRates(newDateRates)
    setValue('date_rates', newDateRates)
  }

  const renderPricingStrategyForm = () => {
    const commonProps = {
      control: control as any,
      register,
      setValue,
      errors
    }

    switch (selectedStrategy) {
      case 'per_room':
        return <PerRoomPricingForm {...commonProps} />
      case 'per_person':
        return <PerPersonPricingForm {...commonProps} />
      case 'per_vehicle':
        return <PerVehiclePricingForm {...commonProps} />
      case 'per_unit':
        return <PerUnitPricingForm {...commonProps} />
      case 'per_session':
        return <PerSessionPricingForm {...commonProps} />
      default:
        return <PerRoomPricingForm {...commonProps} />
    }
  }

  const renderPricingTab = () => (
    <div className="space-y-6">
      {/* Contract Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Contract & Fulfilment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ Buy-to-Order: This item will be sourced later
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate_type">Rate Type</Label>
              <Select
                value={watch('rate_type')}
                onValueChange={(value: 'STANDARD' | 'BUY_TO_ORDER') => setValue('rate_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="BUY_TO_ORDER">Buy-to-Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fulfilment_type">Fulfilment Type</Label>
              <Select
                value={watch('fulfilment_type')}
                onValueChange={(value: 'instant' | 'manual' | 'buy_to_order') => setValue('fulfilment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="buy_to_order">Buy-to-Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategy Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Pricing Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pricing_strategy">How is this priced? *</Label>
            <Select
              value={selectedStrategy}
              onValueChange={(value: 'per_room' | 'per_person' | 'per_vehicle' | 'per_unit' | 'per_session') => setValue('pricing_strategy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pricing strategy" />
              </SelectTrigger>
              <SelectContent>
                {pricingStrategyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                      <span className="text-muted-foreground">- {option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pricing_strategy && (
              <p className="text-sm text-red-600">{errors.pricing_strategy.message}</p>
            )}
          </div>
          
          {/* Show selected strategy info */}
          {selectedStrategy && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {pricingStrategyOptions.find(o => o.value === selectedStrategy)?.icon}
                </span>
                <span className="font-medium text-blue-900">
                  {pricingStrategyOptions.find(o => o.value === selectedStrategy)?.label}
                </span>
              </div>
              <p className="text-sm text-blue-800">
                {pricingStrategyOptions.find(o => o.value === selectedStrategy)?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Pricing Form */}
      {selectedStrategy && renderPricingStrategyForm()}

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Date Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={active}
              onCheckedChange={(checked) => setValue('status', checked ? 'active' : 'requires_procurement')}
            />
            <Label htmlFor="status">Active</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDateRatesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Date-Specific Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Override the base rate for specific dates. Leave empty to use base pricing.
          </div>

          {/* Add new date rate */}
          <div className="flex gap-2">
            <Input
              type="date"
              value={newDateInput}
              onChange={(e) => setNewDateInput(e.target.value)}
              placeholder="Select date"
              className="flex-1"
            />
            <Button type="button" onClick={addDateRate} disabled={!newDateInput}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing date rates */}
          <div className="space-y-3">
            {Object.entries(dateRates).map(([date, rateData]) => (
              <div key={date} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{format(new Date(date), 'PPP')}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDateRate(date)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Rate Override</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        value={rateData.rate || ''}
                        onChange={(e) => updateDateRate(date, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Additional Info</Label>
                    <Input
                      value={rateData.additional_info || ''}
                      onChange={(e) => updateDateRate(date, 'additional_info', e.target.value)}
                      placeholder="Special notes for this date"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(dateRates).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No date-specific rates set</p>
              <p className="text-xs">Base pricing will be used for all dates</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderBuyToOrderTab = () => {
    const isBuyToOrder = watch('contract_id') === 'buy-to-order'
    
    return (
      <div className="space-y-6">
        {!isBuyToOrder ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Select "Buy-to-Order (No Contract)" in the Pricing tab to configure estimated costs</p>
          </div>
        ) : (
          <>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h4 className="font-medium text-orange-900">Buy-to-Order Configuration</h4>
              </div>
              <p className="text-sm text-orange-800">
                This item will be sold with estimated costs. Actual procurement happens later.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Estimated Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Estimated Cost *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                    <Input
                      id="estimated_cost"
                      type="number"
                      step="0.01"
                      className="pl-8"
                      {...register('estimated_cost', { valueAsNumber: true })}
                      placeholder="80.00"
                    />
                  </div>
                  {errors.estimated_cost && (
                    <p className="text-sm text-red-600">{errors.estimated_cost.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter your estimated supplier cost. This will be used to calculate selling prices.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Pricing Formula</h5>
                  <p className="text-sm text-blue-800">
                    <strong>Sell Price =</strong> Estimated Cost × (1 + Markup %)
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Example: €80 × 1.50 = €120 (with 50% markup)
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    )
  }

  const renderMarkupTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Markup Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>Markup configuration has been moved to the pricing strategy forms</p>
            <p className="text-xs mt-2">Configure markup per pricing strategy in the Pricing tab</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTaxConfigTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tax & Fee Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate %</Label>
              <div className="relative">
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.1"
                  {...register('tax_config.tax_rate', { valueAsNumber: true })}
                  placeholder="10"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee_daily">Daily Fee</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="fee_daily"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('tax_config.fee_daily', { valueAsNumber: true })}
                  placeholder="5.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee_inclusions">Fee Inclusions</Label>
              <Input
                id="fee_inclusions"
                {...register('tax_config.fee_inclusions')}
                placeholder="WiFi, Parking, Gym access"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="fee_taxable"
                checked={watch('tax_config.fee_taxable')}
                onCheckedChange={(checked) => setValue('tax_config.fee_taxable', checked)}
              />
              <Label htmlFor="fee_taxable">Fee is taxable</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Main render based on active tab
  if (tab === 'pricing') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {renderPricingTab()}
      </form>
    )
  }

  if (tab === 'date-rates') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {renderDateRatesTab()}
      </form>
    )
  }

  if (tab === 'buy-to-order') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {renderBuyToOrderTab()}
      </form>
    )
  }

  if (tab === 'markup') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {renderMarkupTab()}
      </form>
    )
  }

  if (tab === 'tax-config') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {renderTaxConfigTab()}
      </form>
    )
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>Select a tab to configure the rate band</p>
    </div>
  )
}