'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ContractSchema } from '@/lib/schemas'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Contract } from '@/types/domain'
import { useSuppliers } from '@/hooks/use-suppliers'
import { useResources } from '@/hooks/use-resources'

interface ContractFormProps {
  contract?: Contract | null
  onSubmit: (data: Partial<Contract>) => void
  onCancel: () => void
  tab?: string
}

export function ContractForm({ contract, onSubmit, onCancel, tab = 'basics' }: ContractFormProps) {
  const { data: suppliers } = useSuppliers()
  const { data: resources } = useResources()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(ContractSchema),
    defaultValues: {
      supplier_id: contract?.supplier_id || '',
      resource_id: contract?.resource_id || '',
      currency: contract?.currency || 'EUR',
      tz: contract?.tz || '',
      valid_from: contract?.valid_from || '',
      valid_to: contract?.valid_to || '',
      active: contract?.active ?? true,
      fulfilment: contract?.fulfilment || 'instant',
      sell_cutoff_hours: contract?.sell_cutoff_hours || undefined,
      sla_hours: contract?.sla_hours || undefined,
      economics: {
        commission_pct: contract?.economics.commission_pct || 0,
        supplier_vat_pct: contract?.economics.supplier_vat_pct || 0,
        fees: contract?.economics.fees || []
      },
      plugin_defaults: contract?.plugin_defaults || {}
    }
  })

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
  }

  // Wrap all content in a single form
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {tab === 'basics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_id">Supplier *</Label>
            <Select
              value={watch('supplier_id')}
              onValueChange={(value) => setValue('supplier_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers?.filter(s => s.active).map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplier_id && (
              <p className="text-sm text-red-600">{errors.supplier_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource_id">Resource *</Label>
            <Select
              value={watch('resource_id')}
              onValueChange={(value) => setValue('resource_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources?.filter(r => r.active).map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.resource_id && (
              <p className="text-sm text-red-600">{errors.resource_id.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tz">Timezone *</Label>
            <Input
              id="tz"
              {...register('tz')}
              placeholder="Europe/London"
            />
            {errors.tz && (
              <p className="text-sm text-red-600">{errors.tz.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valid_from">Valid From *</Label>
            <Input
              id="valid_from"
              type="date"
              {...register('valid_from')}
            />
            {errors.valid_from && (
              <p className="text-sm text-red-600">{errors.valid_from.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_to">Valid To *</Label>
            <Input
              id="valid_to"
              type="date"
              {...register('valid_to')}
            />
            {errors.valid_to && (
              <p className="text-sm text-red-600">{errors.valid_to.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={watch('active')}
            onCheckedChange={(checked) => setValue('active', checked)}
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Contract'}
          </Button>
        </div>
      </form>
    )
  }

  // Fulfilment tab
  if (tab === 'fulfilment') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fulfilment">Fulfilment Type *</Label>
            <Select
              value={watch('fulfilment')}
              onValueChange={(value) => setValue('fulfilment', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fulfilment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="on_request">On Request</SelectItem>
                <SelectItem value="buy_to_order">Buy to Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sell_cutoff_hours">Sell Cutoff Hours</Label>
            <Input
              id="sell_cutoff_hours"
              type="number"
              {...register('sell_cutoff_hours', { valueAsNumber: true })}
              placeholder="24"
            />
            <p className="text-sm text-muted-foreground">
              Hours before departure when sales must stop
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sla_hours">SLA Hours</Label>
            <Input
              id="sla_hours"
              type="number"
              {...register('sla_hours', { valueAsNumber: true })}
              placeholder="2"
            />
            <p className="text-sm text-muted-foreground">
              Service level agreement in hours
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Contract'}
          </Button>
        </div>
      </form>
    )
  }

  // Economics tab
  if (tab === 'economics') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="economics">
          <AccordionTrigger>Economics</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission_pct">Commission % *</Label>
                <Input
                  id="commission_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('economics.commission_pct', { valueAsNumber: true })}
                />
                {errors.economics?.commission_pct && (
                  <p className="text-sm text-red-600">{errors.economics.commission_pct.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_vat_pct">Supplier VAT % *</Label>
                <Input
                  id="supplier_vat_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('economics.supplier_vat_pct', { valueAsNumber: true })}
                />
                {errors.economics?.supplier_vat_pct && (
                  <p className="text-sm text-red-600">{errors.economics.supplier_vat_pct.message}</p>
                )}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="fees">
                <AccordionTrigger>Additional Fees</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Configure city tax, resort fees, and other charges
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentFees = watch('economics.fees') || []
                        setValue('economics.fees', [...currentFees, {
                          code: '',
                          mode: 'per_room_per_night',
                          amount: 0,
                          payable: 'us'
                        }])
                      }}
                    >
                      Add Fee
                    </Button>
                  </div>

                  {(watch('economics.fees') || []).map((fee: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor={`fee_code_${index}`}>Fee Code *</Label>
                        <Select
                          value={fee.code}
                          onValueChange={(value) => {
                            const currentFees = watch('economics.fees') || []
                            const updatedFees = [...currentFees]
                            updatedFees[index] = { ...updatedFees[index], code: value }
                            setValue('economics.fees', updatedFees)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="city_tax">City Tax</SelectItem>
                            <SelectItem value="resort_fee">Resort Fee</SelectItem>
                            <SelectItem value="service_fee">Service Fee</SelectItem>
                            <SelectItem value="cleaning_fee">Cleaning Fee</SelectItem>
                            <SelectItem value="tourism_tax">Tourism Tax</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`fee_mode_${index}`}>Calculation Mode *</Label>
                        <Select
                          value={fee.mode}
                          onValueChange={(value) => {
                            const currentFees = watch('economics.fees') || []
                            const updatedFees = [...currentFees]
                            updatedFees[index] = { ...updatedFees[index], mode: value }
                            setValue('economics.fees', updatedFees)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per_room_per_night">Per Room/Night</SelectItem>
                            <SelectItem value="per_person_per_night">Per Person/Night</SelectItem>
                            <SelectItem value="percent_of_room">% of Room Rate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`fee_amount_${index}`}>
                          {fee.mode === 'percent_of_room' ? 'Rate %' : 'Amount'}
                        </Label>
                        <Input
                          id={`fee_amount_${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          max={fee.mode === 'percent_of_room' ? 100 : undefined}
                          value={fee.amount || ''}
                          onChange={(e) => {
                            const currentFees = watch('economics.fees') || []
                            const updatedFees = [...currentFees]
                            updatedFees[index] = { 
                              ...updatedFees[index], 
                              [fee.mode === 'percent_of_room' ? 'rate_pct' : 'amount']: parseFloat(e.target.value) || 0 
                            }
                            setValue('economics.fees', updatedFees)
                          }}
                          placeholder={fee.mode === 'percent_of_room' ? '5.0' : '10.00'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`fee_payable_${index}`}>Payable To *</Label>
                        <Select
                          value={fee.payable}
                          onValueChange={(value) => {
                            const currentFees = watch('economics.fees') || []
                            const updatedFees = [...currentFees]
                            updatedFees[index] = { ...updatedFees[index], payable: value }
                            setValue('economics.fees', updatedFees)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payable" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">Us (We Pay)</SelectItem>
                            <SelectItem value="property">Property (Customer Pays)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentFees = watch('economics.fees') || []
                            const updatedFees = currentFees.filter((_: any, i: number) => i !== index)
                            setValue('economics.fees', updatedFees)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(watch('economics.fees') || []).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No additional fees configured</p>
                      <p className="text-sm">Click "Add Fee" to add city tax, resort fees, etc.</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
        </Accordion>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Contract'}
          </Button>
        </div>
      </form>
    )
  }

  // Plugin Defaults tab
  if (tab === 'defaults') {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="included_board">Included Board</Label>
            <Select
              value={watch('plugin_defaults.included_board')}
              onValueChange={(value) => setValue('plugin_defaults.included_board', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select board type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RO">Room Only (RO)</SelectItem>
                <SelectItem value="BB">Bed & Breakfast (BB)</SelectItem>
                <SelectItem value="HB">Half Board (HB)</SelectItem>
                <SelectItem value="FB">Full Board (FB)</SelectItem>
                <SelectItem value="AI">All Inclusive (AI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_occupancy">Base Occupancy</Label>
            <Input
              id="base_occupancy"
              type="number"
              min="1"
              max="10"
              {...register('plugin_defaults.base_occupancy', { valueAsNumber: true })}
              placeholder="2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_occupancy">Max Occupancy</Label>
            <Input
              id="max_occupancy"
              type="number"
              min="1"
              max="20"
              {...register('plugin_defaults.max_occupancy', { valueAsNumber: true })}
              placeholder="4"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Contract'}
          </Button>
        </div>
      </form>
    )
  }

  // Fallback - should not happen
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Invalid tab selected</p>
    </div>
  )
}
