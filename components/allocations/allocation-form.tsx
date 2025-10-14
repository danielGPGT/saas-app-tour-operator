'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AllocationSchema } from '@/lib/schemas'
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
import { Allocation } from '@/types/domain'
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'

interface AllocationFormProps {
  allocation?: Allocation | null
  onSubmit: (data: Partial<Allocation>) => void
  onCancel: () => void
}

export function AllocationForm({ allocation, onSubmit, onCancel }: AllocationFormProps) {
  const { data: products } = useProducts()
  const { data: resources } = useResources()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(AllocationSchema),
    defaultValues: {
      resource_id: allocation?.resource_id || '',
      product_id: allocation?.product_id || '',
      start_date: allocation?.start_date || '',
      end_date: allocation?.end_date || '',
      pool_id: allocation?.pool_id || '',
      capacity: allocation?.capacity || 0,
      stop_sell: allocation?.stop_sell ?? false
    }
  })

  const selectedResourceId = watch('resource_id')
  const stopSell = watch('stop_sell')

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
  }

  const getResourceName = (resourceId: string) => {
    return resources?.find(r => r.id === resourceId)?.name || resourceId
  }

  const getProductName = (productId: string) => {
    return products?.find(p => p.id === productId)?.name || productId
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
  const availableProducts = products?.filter(p => p.resource_id === selectedResourceId && p.active) || []

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resource_id">Resource *</Label>
        <Select
          value={watch('resource_id')}
          onValueChange={(value) => {
            setValue('resource_id', value)
            setValue('product_id', '') // Reset product when resource changes
          }}
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
        <Label htmlFor="product_id">Product *</Label>
        <Select
          value={watch('product_id')}
          onValueChange={(value) => setValue('product_id', value)}
          disabled={!selectedResourceId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {availableProducts.map(product => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex items-center gap-2">
                  <span>{product.name}</span>
                  {product.code && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{product.code}</span>
                    </>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.product_id && (
          <p className="text-sm text-red-600">{errors.product_id.message}</p>
        )}
        {availableProducts.length === 0 && selectedResourceId && (
          <p className="text-sm text-muted-foreground">
            No active products found for this resource.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            {...register('start_date')}
          />
          {errors.start_date && (
            <p className="text-sm text-red-600">{errors.start_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            {...register('end_date')}
          />
          {errors.end_date && (
            <p className="text-sm text-red-600">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            min="0"
            {...register('capacity', { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.capacity && (
            <p className="text-sm text-red-600">{errors.capacity.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Number of packages available for this date range
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pool_id">Pool ID</Label>
          <Input
            id="pool_id"
            {...register('pool_id')}
            placeholder="e.g., may-2025-double"
          />
          {errors.pool_id && (
            <p className="text-sm text-red-600">{errors.pool_id.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Optional pool for shared capacity
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="stop_sell"
          checked={stopSell}
          onCheckedChange={(checked) => setValue('stop_sell', checked)}
        />
        <Label htmlFor="stop_sell">Stop sell</Label>
      </div>
      {stopSell && (
        <p className="text-sm text-muted-foreground">
          When enabled, this allocation will not be available for booking.
        </p>
      )}

      {/* Pool Information */}
      {watch('pool_id') && (
        <div className="p-4 border rounded-lg bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2">Pool Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Pool ID: <strong>{watch('pool_id')}</strong></div>
            <div>• Shared capacity across multiple products</div>
            <div>• Total pool capacity = minimum of all linked allocations</div>
            <div>• Useful for room categories with shared inventory</div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Allocation'}
        </Button>
      </div>
    </form>
  )
}
