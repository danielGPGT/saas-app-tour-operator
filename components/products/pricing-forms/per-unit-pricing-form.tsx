'use client'

import { Control, useWatch } from 'react-hook-form'
import { RateBand } from '@/types/domain'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PerUnitPricingFormProps {
  control: any
  register: any
  setValue: any
  errors: any
}

export function PerUnitPricingForm({ control, register, setValue, errors }: PerUnitPricingFormProps) {
  const watchedIncludes = useWatch({
    control,
    name: 'pricing_config.includes',
    defaultValue: []
  })

  const watchedRestrictions = useWatch({
    control,
    name: 'pricing_config.restrictions',
    defaultValue: []
  })

  const addInclude = () => {
    const currentIncludes = watchedIncludes || []
    setValue('pricing_config.includes', [...currentIncludes, ''])
  }

  const removeInclude = (index: number) => {
    const currentIncludes = watchedIncludes || []
    setValue('pricing_config.includes', currentIncludes.filter((_: any, i: number) => i !== index))
  }

  const updateInclude = (index: number, value: string) => {
    const currentIncludes = watchedIncludes || []
    const newIncludes = [...currentIncludes]
    newIncludes[index] = value
    setValue('pricing_config.includes', newIncludes)
  }

  const addRestriction = () => {
    const currentRestrictions = watchedRestrictions || []
    setValue('pricing_config.restrictions', [...currentRestrictions, ''])
  }

  const removeRestriction = (index: number) => {
    const currentRestrictions = watchedRestrictions || []
    setValue('pricing_config.restrictions', currentRestrictions.filter((_: any, i: number) => i !== index))
  }

  const updateRestriction = (index: number, value: string) => {
    const currentRestrictions = watchedRestrictions || []
    const newRestrictions = [...currentRestrictions]
    newRestrictions[index] = value
    setValue('pricing_config.restrictions', newRestrictions)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            📦 Equipment Pricing
            <Badge variant="secondary" className="text-xs">Per Unit</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate_per_unit">Rate Per Unit *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="rate_per_unit"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('pricing_config.rate_per_unit', { valueAsNumber: true })}
                  placeholder="25.00"
                />
              </div>
              {errors.pricing_config?.rate_per_unit && (
                <p className="text-sm text-red-600">{errors.pricing_config.rate_per_unit.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Rate per unit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rental_period">Rental Period</Label>
              <Input
                id="rental_period"
                {...register('pricing_config.rental_period')}
                placeholder="Daily"
              />
              <p className="text-xs text-muted-foreground">e.g., Daily, Weekly, Monthly</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_period">Validity Period (days)</Label>
              <Input
                id="validity_period"
                type="number"
                {...register('pricing_config.validity_period', { valueAsNumber: true })}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">How long the rental is valid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Equipment Includes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchedIncludes?.map((include: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={include}
                  onChange={(e) => updateInclude(index, e.target.value)}
                  placeholder="e.g., Memory Card, Extra Battery"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInclude(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInclude}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Inclusion
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchedRestrictions?.map((restriction: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={restriction}
                  onChange={(e) => updateRestriction(index, e.target.value)}
                  placeholder="e.g., €100 security deposit, No outdoor use"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRestriction(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRestriction}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Restriction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
