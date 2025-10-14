'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SupplierSchema } from '@/lib/schemas'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Supplier } from '@/types/domain'

interface SupplierDefaultsFormProps {
  supplier?: Supplier | null
  onSubmit: (data: Partial<Supplier>) => void
}

export function SupplierDefaultsForm({ supplier, onSubmit }: SupplierDefaultsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(SupplierSchema.pick({ defaults: true })),
    defaultValues: {
      defaults: supplier?.defaults || {
        commission_pct: 0,
        supplier_vat_pct: 0,
        fees: [],
        markup: {
          b2c_pct: 0,
          b2b_pct: 0
        }
      }
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'defaults.fees'
  })

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addFee = () => {
    append({
      code: '',
      mode: 'per_room_per_night',
      amount: 0,
      payable: 'us'
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="commission_pct">Default Commission %</Label>
          <Input
            id="commission_pct"
            type="number"
            min="0"
            max="100"
            step="0.01"
            {...register('defaults.commission_pct', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.defaults?.commission_pct && (
            <p className="text-sm text-red-600">{errors.defaults.commission_pct.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier_vat_pct">Default Supplier VAT %</Label>
          <Input
            id="supplier_vat_pct"
            type="number"
            min="0"
            max="100"
            step="0.01"
            {...register('defaults.supplier_vat_pct', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.defaults?.supplier_vat_pct && (
            <p className="text-sm text-red-600">{errors.defaults.supplier_vat_pct.message}</p>
          )}
        </div>
      </div>

      {/* Default Markup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Markup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="b2c_pct">B2C Markup %</Label>
              <Input
                id="b2c_pct"
                type="number"
                min="0"
                max="500"
                step="0.01"
                {...register('defaults.markup.b2c_pct', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="b2b_pct">B2B Markup %</Label>
              <Input
                id="b2b_pct"
                type="number"
                min="0"
                max="500"
                step="0.01"
                {...register('defaults.markup.b2b_pct', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Default Fees</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFee}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No default fees configured. These will be used as defaults when creating contracts.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-6 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      {...register(`defaults.fees.${index}.code`)}
                      placeholder="e.g., RESORT_FEE"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <Select
                      value={watch(`defaults.fees.${index}.mode`)}
                      onValueChange={(value) => setValue(`defaults.fees.${index}.mode`, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_person_per_night">Per Person/Night</SelectItem>
                        <SelectItem value="per_room_per_night">Per Room/Night</SelectItem>
                        <SelectItem value="percent_of_room">% of Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(`defaults.fees.${index}.amount`, { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      {...register(`defaults.fees.${index}.rate_pct`, { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payable</Label>
                    <Select
                      value={watch(`defaults.fees.${index}.payable`)}
                      onValueChange={(value) => setValue(`defaults.fees.${index}.payable`, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">Us</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Defaults'}
        </Button>
      </div>
    </form>
  )
}
