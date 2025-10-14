'use client'

import { Control, useWatch } from 'react-hook-form'
import { RateBand } from '@/types/domain'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PerVehiclePricingFormProps {
  control: any
  register: any
  setValue: any
  errors: any
}

export function PerVehiclePricingForm({ control, register, setValue, errors }: PerVehiclePricingFormProps) {
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
            🚗 Transfer Pricing
            <Badge variant="secondary" className="text-xs">Per Vehicle</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate_per_vehicle">Vehicle Rate *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="rate_per_vehicle"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('pricing_config.rate_per_vehicle', { valueAsNumber: true })}
                  placeholder="120.00"
                />
              </div>
              {errors.pricing_config?.rate_per_vehicle && (
                <p className="text-sm text-red-600">{errors.pricing_config.rate_per_vehicle.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Rate per vehicle</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_capacity">Vehicle Capacity</Label>
              <Input
                id="vehicle_capacity"
                type="number"
                {...register('pricing_config.vehicle_capacity', { valueAsNumber: true })}
                placeholder="8"
              />
              <p className="text-xs text-muted-foreground">Maximum passengers</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="route_from">Route From</Label>
              <Input
                id="route_from"
                {...register('pricing_config.route_from')}
                placeholder="Airport"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="route_to">Route To</Label>
              <Input
                id="route_to"
                {...register('pricing_config.route_to')}
                placeholder="Hotel Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                {...register('pricing_config.duration_minutes', { valueAsNumber: true })}
                placeholder="45"
              />
              <p className="text-xs text-muted-foreground">Transfer duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transfer Includes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchedIncludes?.map((include: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={include}
                  onChange={(e) => updateInclude(index, e.target.value)}
                  placeholder="e.g., Meet & Greet, Luggage Handling"
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
                  placeholder="e.g., Maximum 2 large suitcases, No pets"
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
