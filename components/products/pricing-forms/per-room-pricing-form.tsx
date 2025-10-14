'use client'

import { Control, useWatch } from 'react-hook-form'
import { RateBand } from '@/types/domain'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PerRoomPricingFormProps {
  control: any
  register: any
  setValue: any
  errors: any
}

export function PerRoomPricingForm({ control, register, setValue, errors }: PerRoomPricingFormProps) {
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
            🏨 Room Pricing
            <Badge variant="secondary" className="text-xs">Per Room/Night</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_room_rate">Base Room Rate *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="base_room_rate"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('pricing_config.base_room_rate', { valueAsNumber: true })}
                  placeholder="150.00"
                />
              </div>
              {errors.pricing_config?.base_room_rate && (
                <p className="text-sm text-red-600">{errors.pricing_config.base_room_rate.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Rate for 1-2 persons per room/night</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_person_charge">Additional Person Charge</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="additional_person_charge"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('pricing_config.additional_person_charge', { valueAsNumber: true })}
                  placeholder="30.00"
                />
              </div>
              <p className="text-xs text-muted-foreground">Extra charge for 3rd/4th person</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_occupancy">Maximum Occupancy</Label>
              <Input
                id="max_occupancy"
                type="number"
                {...register('pricing_config.max_occupancy', { valueAsNumber: true })}
                placeholder="4"
              />
              <p className="text-xs text-muted-foreground">Maximum persons per room</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_period">Validity Period (days)</Label>
              <Input
                id="validity_period"
                type="number"
                {...register('pricing_config.validity_period', { valueAsNumber: true })}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">How long the booking is valid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Rate Includes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchedIncludes?.map((include: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={include}
                  onChange={(e) => updateInclude(index, e.target.value)}
                  placeholder="e.g., Breakfast, WiFi, Parking"
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
                  placeholder="e.g., Children under 5 free, No smoking"
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
