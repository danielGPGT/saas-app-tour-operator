'use client'

import { Control, useWatch } from 'react-hook-form'
import { RateBand } from '@/types/domain'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PerSessionPricingFormProps {
  control: any
  register: any
  setValue: any
  errors: any
}

export function PerSessionPricingForm({ control, register, setValue, errors }: PerSessionPricingFormProps) {
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
            📸 Photography/Service Pricing
            <Badge variant="secondary" className="text-xs">Per Session</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate_per_session">Session Rate *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="rate_per_session"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('pricing_config.rate_per_session', { valueAsNumber: true })}
                  placeholder="200.00"
                />
              </div>
              {errors.pricing_config?.rate_per_session && (
                <p className="text-sm text-red-600">{errors.pricing_config.rate_per_session.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Rate per session</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_duration_hours">Session Duration (hours)</Label>
              <Input
                id="session_duration_hours"
                type="number"
                step="0.5"
                {...register('pricing_config.session_duration_hours', { valueAsNumber: true })}
                placeholder="2"
              />
              <p className="text-xs text-muted-foreground">Session duration in hours</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_group_size">Maximum Group Size</Label>
              <Input
                id="max_group_size"
                type="number"
                {...register('pricing_config.max_group_size', { valueAsNumber: true })}
                placeholder="8"
              />
              <p className="text-xs text-muted-foreground">Maximum people per session</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity_period">Validity Period (days)</Label>
              <Input
                id="validity_period"
                type="number"
                {...register('pricing_config.validity_period', { valueAsNumber: true })}
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">How long the session booking is valid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Session Includes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchedIncludes?.map((include: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={include}
                  onChange={(e) => updateInclude(index, e.target.value)}
                  placeholder="e.g., 50 edited photos, Online gallery"
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
                  placeholder="e.g., Extra hour: €75, Print package available"
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
