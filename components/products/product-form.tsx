'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProductSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Product } from '@/types/domain'
import { useResources } from '@/hooks/use-resources'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: Partial<Product>) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { data: resources } = useResources()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      resource_id: product?.resource_id || '',
      name: product?.name || '',
      code: product?.code || '',
      attrs: product?.attrs || {},
      active: product?.active ?? true
    }
  })

  const active = watch('active')
  const selectedResourceId = watch('resource_id')

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return '🏨'
      case 'event_ticket': return '🎫'
      case 'transfer': return '🚗'
      case 'lounge': return '🛋️'
      default: return '📦'
    }
  }

  const selectedResource = resources?.find(r => r.id === selectedResourceId)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                <div className="flex items-center gap-2">
                  <span>{getResourceTypeIcon(resource.type)}</span>
                  <span>{resource.name}</span>
                  <span className="text-muted-foreground">({resource.type})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.resource_id && (
          <p className="text-sm text-red-600">{errors.resource_id.message}</p>
        )}
        {selectedResource && (
          <p className="text-sm text-muted-foreground">
            Selected: {selectedResource.name} • {selectedResource.location || 'No location'}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Standard Double Room"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Product Code</Label>
        <Input
          id="code"
          {...register('code')}
          placeholder="e.g., STD_DBL, VIP_LOUNGE"
        />
        {errors.code && (
          <p className="text-sm text-red-600">{errors.code.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Optional code for easy identification and integration
        </p>
      </div>

      {/* Dynamic attributes based on resource type */}
      {selectedResource && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <Label className="text-sm font-medium">
            {selectedResource.type.charAt(0).toUpperCase() + selectedResource.type.slice(1)} Attributes
          </Label>
          
          {selectedResource.type === 'accommodation' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupancy">Max Occupancy</Label>
                <Input
                  id="occupancy"
                  type="number"
                  min="1"
                  max="8"
                  placeholder="2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room_type">Room Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="twin">Twin</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {selectedResource.type === 'event_ticket' && (
            <div className="space-y-2">
              <Label htmlFor="category">Ticket Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Admission</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="season">Season Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedResource.type === 'transfer' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="minivan">Minivan</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="4"
                />
              </div>
            </div>
          )}

          {selectedResource.type === 'lounge' && (
            <div className="space-y-2">
              <Label htmlFor="access_type">Access Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={active}
          onCheckedChange={(checked) => setValue('active', checked)}
        />
        <Label htmlFor="active">Active product</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  )
}
