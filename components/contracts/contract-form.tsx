'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ContractSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
        commission_pct: contract?.economics?.commission_pct || 0,
        supplier_vat_pct: contract?.economics?.supplier_vat_pct || 0,
        fees: contract?.economics?.fees || []
      },
      plugin_defaults: contract?.plugin_defaults || {}
    }
  })

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
  }

  const renderBasicsTab = () => (
    <div className="space-y-6">
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
    </div>
  )

  const renderFulfilmentTab = () => (
    <div className="space-y-6">
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
    </div>
  )

  const renderEconomicsTab = () => {
    const fees = watch('economics.fees') || []
    
    const addFee = () => {
      const newFees = [...fees, {
        code: '',
        mode: 'per_room_per_night',
        amount: 0,
        payable: 'us'
      }]
      setValue('economics.fees', newFees)
    }

    const updateFee = (index: number, field: string, value: any) => {
      const newFees = [...fees]
      newFees[index] = { ...newFees[index], [field]: value }
      setValue('economics.fees', newFees)
    }

    const removeFee = (index: number) => {
      const newFees = fees.filter((_, i) => i !== index)
      setValue('economics.fees', newFees)
    }

    return (
      <div className="space-y-6">
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
              placeholder="15.00"
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
              placeholder="10.00"
            />
            {errors.economics?.supplier_vat_pct && (
              <p className="text-sm text-red-600">{errors.economics.supplier_vat_pct.message}</p>
            )}
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="fees">
            <AccordionTrigger>Additional Fees & Charges</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Configure additional fees, taxes, and service charges
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFee}
                >
                  Add Fee
                </Button>
              </div>

              {fees.map((fee: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`fee_code_${index}`}>Fee Code *</Label>
                    <Select
                      value={fee.code}
                      onValueChange={(value) => updateFee(index, 'code', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service_fee">Service Fee</SelectItem>
                        <SelectItem value="booking_fee">Booking Fee</SelectItem>
                        <SelectItem value="processing_fee">Processing Fee</SelectItem>
                        <SelectItem value="city_tax">City Tax</SelectItem>
                        <SelectItem value="tourism_tax">Tourism Tax</SelectItem>
                        <SelectItem value="resort_fee">Resort Fee</SelectItem>
                        <SelectItem value="cleaning_fee">Cleaning Fee</SelectItem>
                        <SelectItem value="fuel_surcharge">Fuel Surcharge</SelectItem>
                        <SelectItem value="convenience_fee">Convenience Fee</SelectItem>
                        <SelectItem value="room_tax">Room Tax</SelectItem>
                        <SelectItem value="amenity_fee">Amenity Fee</SelectItem>
                        <SelectItem value="destination_fee">Destination Fee</SelectItem>
                        <SelectItem value="facility_fee">Facility Fee</SelectItem>
                        <SelectItem value="energy_surcharge">Energy Surcharge</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`fee_mode_${index}`}>Calculation Mode *</Label>
                    <Select
                      value={fee.mode}
                      onValueChange={(value) => updateFee(index, 'mode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_unit">Per Unit</SelectItem>
                        <SelectItem value="per_person">Per Person</SelectItem>
                        <SelectItem value="per_night">Per Night</SelectItem>
                        <SelectItem value="per_person_per_night">Per Person/Night</SelectItem>
                        <SelectItem value="percent_of_rate">% of Base Rate</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`fee_amount_${index}`}>
                      {fee.mode === 'percent_of_rate' ? 'Rate %' : 'Amount'}
                    </Label>
                    <Input
                      id={`fee_amount_${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max={fee.mode === 'percent_of_rate' ? 100 : undefined}
                      value={fee.amount || ''}
                      onChange={(e) => updateFee(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder={fee.mode === 'percent_of_rate' ? '5.0' : '10.00'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`fee_payable_${index}`}>Payable To *</Label>
                    <Select
                      value={fee.payable}
                      onValueChange={(value) => updateFee(index, 'payable', value)}
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

                  <div className="flex justify-end col-span-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFee(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              {fees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No additional fees configured</p>
                  <p className="text-sm">Click "Add Fee" to add service charges, taxes, etc.</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  const renderPluginTab = () => {
    const resourceType = watch('resource_id') ? 
      resources?.find(r => r.id === watch('resource_id'))?.type : null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deposit_policy">Deposit Policy</Label>
            <Textarea
              id="deposit_policy"
              {...register('plugin_defaults.deposit_policy')}
              placeholder="e.g., 10% deposit required 30 days before service"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
            <Textarea
              id="cancellation_policy"
              {...register('plugin_defaults.cancellation_policy')}
              placeholder="e.g., Free cancellation up to 24 hours before service"
              rows={3}
            />
          </div>
        </div>

        {/* Hotel-specific fields */}
        {resourceType === 'hotel' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin_time">Check-in Time</Label>
                <Input
                  id="checkin_time"
                  {...register('plugin_defaults.checkin_time')}
                  placeholder="15:00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout_time">Check-out Time</Label>
                <Input
                  id="checkout_time"
                  {...register('plugin_defaults.checkout_time')}
                  placeholder="12:00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum_stay">Minimum Stay (nights)</Label>
                <Input
                  id="minimum_stay"
                  type="number"
                  {...register('plugin_defaults.minimum_stay', { valueAsNumber: true })}
                  placeholder="3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_occupancy">Maximum Occupancy per Room</Label>
                <Input
                  id="max_occupancy"
                  type="number"
                  {...register('plugin_defaults.max_occupancy', { valueAsNumber: true })}
                  placeholder="4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="additional_person_charge">Additional Person Charge</Label>
                <Input
                  id="additional_person_charge"
                  type="number"
                  step="0.01"
                  {...register('plugin_defaults.additional_person_charge', { valueAsNumber: true })}
                  placeholder="30.00"
                />
                <p className="text-sm text-muted-foreground">
                  For 3rd/4th person in room
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_tax_rate">Room Tax Rate (%)</Label>
                <Input
                  id="room_tax_rate"
                  type="number"
                  step="0.01"
                  {...register('plugin_defaults.room_tax_rate', { valueAsNumber: true })}
                  placeholder="13.38"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Resort/Amenity Fees</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resort_fee_daily">Daily Resort Fee</Label>
                  <Input
                    id="resort_fee_daily"
                    type="number"
                    step="0.01"
                    {...register('plugin_defaults.resort_fee_daily', { valueAsNumber: true })}
                    placeholder="54.95"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resort_fee_taxable">Resort Fee Taxable</Label>
                  <Switch
                    id="resort_fee_taxable"
                    checked={watch('plugin_defaults.resort_fee_taxable')}
                    onCheckedChange={(checked) => setValue('plugin_defaults.resort_fee_taxable', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resort_fee_inclusions">Resort Fee Inclusions</Label>
                <Textarea
                  id="resort_fee_inclusions"
                  {...register('plugin_defaults.resort_fee_inclusions')}
                  placeholder="e.g., WiFi, fitness center access, local calls"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Rate Structure</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate_basis">Rate Basis</Label>
                  <Select
                    value={watch('plugin_defaults.rate_basis')}
                    onValueChange={(value) => setValue('plugin_defaults.rate_basis', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_double">Single/Double Occupancy</SelectItem>
                      <SelectItem value="per_person">Per Person</SelectItem>
                      <SelectItem value="per_room">Per Room</SelectItem>
                      <SelectItem value="variable">Variable by Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate_includes">Rate Includes</Label>
                  <Input
                    id="rate_includes"
                    {...register('plugin_defaults.rate_includes')}
                    placeholder="e.g., Breakfast, WiFi, Parking"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Room Block Management</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_block_id">Room Block ID</Label>
                  <Input
                    id="room_block_id"
                    {...register('plugin_defaults.room_block_id')}
                    placeholder="e.g., TPGPGT5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cutoff_date">Cutoff Date (days before)</Label>
                  <Input
                    id="cutoff_date"
                    type="number"
                    {...register('plugin_defaults.cutoff_date', { valueAsNumber: true })}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Incidentals & Guarantees</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentals_handling">Incidentals Handling</Label>
                  <Select
                    value={watch('plugin_defaults.incidentals_handling')}
                    onValueChange={(value) => setValue('plugin_defaults.incidentals_handling', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select handling" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest_pays">Guest pays directly</SelectItem>
                      <SelectItem value="company_pays">Company pays</SelectItem>
                      <SelectItem value="mixed">Mixed (specify in terms)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit_card_required">Credit Card Required at Check-in</Label>
                  <Switch
                    id="credit_card_required"
                    checked={watch('plugin_defaults.credit_card_required')}
                    onCheckedChange={(checked) => setValue('plugin_defaults.credit_card_required', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_guarantee">Room Guarantee Policy</Label>
                <Textarea
                  id="room_guarantee"
                  {...register('plugin_defaults.room_guarantee')}
                  placeholder="e.g., Credit card required at check-in for incidentals and damages"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* Transfer-specific fields */}
        {resourceType === 'transfer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup_lead_time">Pickup Lead Time (minutes)</Label>
              <Input
                id="pickup_lead_time"
                type="number"
                {...register('plugin_defaults.pickup_lead_time', { valueAsNumber: true })}
                placeholder="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_types">Vehicle Types</Label>
              <Input
                id="vehicle_types"
                {...register('plugin_defaults.vehicle_types')}
                placeholder="Sedan, Minivan, Bus"
              />
            </div>
          </div>
        )}

        {/* Ticket-specific fields */}
        {resourceType === 'ticket' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_method">Ticket Delivery Method</Label>
              <Select
                value={watch('plugin_defaults.delivery_method')}
                onValueChange={(value) => setValue('plugin_defaults.delivery_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="pickup">Pickup at Venue</SelectItem>
                  <SelectItem value="postal">Postal Mail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_days">Ticket Validity (days)</Label>
              <Input
                id="validity_days"
                type="number"
                {...register('plugin_defaults.validity_days', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label>Commission & Markup</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                {...register('plugin_defaults.commission_rate', { valueAsNumber: true })}
                placeholder="10.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="markup_percentage">Standard Markup (%)</Label>
              <Input
                id="markup_percentage"
                type="number"
                step="0.01"
                {...register('plugin_defaults.markup_percentage', { valueAsNumber: true })}
                placeholder="15.00"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Cancellation Terms</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rooming_list_deadline">Rooming List Deadline (days)</Label>
              <Input
                id="rooming_list_deadline"
                type="number"
                {...register('plugin_defaults.rooming_list_deadline', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modification_deadline">Modification Deadline (days)</Label>
              <Input
                id="modification_deadline"
                type="number"
                {...register('plugin_defaults.modification_deadline', { valueAsNumber: true })}
                placeholder="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation_schedule">Cancellation Schedule</Label>
            <Textarea
              id="cancellation_schedule"
              {...register('plugin_defaults.cancellation_schedule')}
              placeholder="e.g., Up to 120 days: 80% refund, 119-90 days: 50% refund, 89+ days: no refund"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Legal & Compliance</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="governing_law">Governing Law</Label>
              <Input
                id="governing_law"
                {...register('plugin_defaults.governing_law')}
                placeholder="e.g., Dutch law, Italian law"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                {...register('plugin_defaults.jurisdiction')}
                placeholder="e.g., Courts of Italy"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="force_majeure">Force Majeure Clause</Label>
            <Textarea
              id="force_majeure"
              {...register('plugin_defaults.force_majeure')}
              placeholder="Define force majeure events including pandemics, natural disasters, etc."
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Additional Terms</Label>
          <div className="space-y-2">
            <Label htmlFor="special_terms">Special Terms & Conditions</Label>
            <Textarea
              id="special_terms"
              {...register('plugin_defaults.special_terms')}
              placeholder="Any special terms, conditions, or notes for this contract..."
              rows={4}
            />
          </div>
        </div>
      </div>
    )
  }


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {tab === 'basics' && renderBasicsTab()}
      {tab === 'fulfilment' && renderFulfilmentTab()}
      {tab === 'economics' && renderEconomicsTab()}
      {tab === 'plugin' && renderPluginTab()}

    </form>
  )
}
