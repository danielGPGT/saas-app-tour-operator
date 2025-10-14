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
  } = useForm<Partial<Contract>>({
    resolver: zodResolver(ContractSchema),
    defaultValues: {
      supplier_id: contract?.supplier_id || '',
      resource_id: contract?.resource_id || '',
      name: contract?.name || '',
      status: contract?.status || 'draft',
      start_date: contract?.start_date || '',
      end_date: contract?.end_date || '',
      currency: contract?.currency || 'EUR',
      fulfilment: contract?.fulfilment || 'on_request',
      auto_confirm: contract?.auto_confirm ?? false,
      plugin_defaults: contract?.plugin_defaults || {},
      fees: contract?.fees || []
    }
  })

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
  }

  const renderBasicsTab = () => (
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
            {suppliers?.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.supplier_id && (
          <p className="text-sm text-red-500">{errors.supplier_id.message}</p>
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
            {resources?.map((resource) => (
              <SelectItem key={resource.id} value={resource.id}>
                {resource.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.resource_id && (
          <p className="text-sm text-red-500">{errors.resource_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Contract Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Summer 2024 Rate Agreement"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={watch('status')}
          onValueChange={(value) => setValue('status', value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          type="date"
          {...register('start_date')}
        />
        {errors.start_date && (
          <p className="text-sm text-red-500">{errors.start_date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          type="date"
          {...register('end_date')}
        />
        {errors.end_date && (
          <p className="text-sm text-red-500">{errors.end_date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={watch('currency')}
          onValueChange={(value) => setValue('currency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderFulfilmentTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fulfilment">Fulfilment Type</Label>
          <Select
            value={watch('fulfilment')}
            onValueChange={(value) => setValue('fulfilment', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant</SelectItem>
              <SelectItem value="on_request">On Request</SelectItem>
              <SelectItem value="buy_to_order">Buy to Order</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto_confirm"
            checked={watch('auto_confirm')}
            onCheckedChange={(checked) => setValue('auto_confirm', checked)}
          />
          <Label htmlFor="auto_confirm">Auto-confirm bookings</Label>
        </div>
      </div>
    </div>
  )

  const renderEconomicsTab = () => {
    const fees = watch('fees') || []
    
    const addFee = () => {
      const newFees = [...fees, { name: '', amount: 0, type: 'fixed' }]
      setValue('fees', newFees)
    }

    const updateFee = (index: number, field: string, value: any) => {
      const newFees = [...fees]
      newFees[index] = { ...newFees[index], [field]: value }
      setValue('fees', newFees)
    }

    const removeFee = (index: number) => {
      const newFees = fees.filter((_, i) => i !== index)
      setValue('fees', newFees)
    }

    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="additional-fees">
            <AccordionTrigger>Additional Fees</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {fees.map((fee, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div className="space-y-2">
                      <Label>Fee Name</Label>
                      <Input
                        value={fee.name}
                        onChange={(e) => updateFee(index, 'name', e.target.value)}
                        placeholder="e.g., City Tax"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fee.amount}
                        onChange={(e) => updateFee(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={fee.type}
                        onValueChange={(value) => updateFee(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="per_night">Per Night</SelectItem>
                          <SelectItem value="per_person">Per Person</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeFee(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFee}>
                  Add Fee
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  const renderPluginTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Plugin-specific settings will be configured here based on the resource type.
      </p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {tab === 'basics' && renderBasicsTab()}
      {tab === 'fulfilment' && renderFulfilmentTab()}
      {tab === 'economics' && renderEconomicsTab()}
      {tab === 'plugin' && renderPluginTab()}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
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
