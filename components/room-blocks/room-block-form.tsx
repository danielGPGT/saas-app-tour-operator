'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RoomBlockFormSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RoomBlock } from '@/types/domain'

interface RoomBlockFormProps {
  roomBlock?: RoomBlock | null
  onSubmit: (data: Partial<RoomBlock>) => void
  onCancel: () => void
  isCreating?: boolean
}

export function RoomBlockForm({ roomBlock, onSubmit, onCancel, isCreating = false }: RoomBlockFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(RoomBlockFormSchema),
    defaultValues: {
      name: roomBlock?.name || '',
      description: roomBlock?.description || '',
      total_rooms: roomBlock?.total_rooms || 0,
      cutoff_date: roomBlock?.cutoff_date || 30,
      status: roomBlock?.status || 'tentative',
      block_start: roomBlock?.block_start || '',
      block_end: roomBlock?.block_end || '',
      min_nights: roomBlock?.min_nights || undefined,
      max_nights: roomBlock?.max_nights || undefined
    }
  })

  const handleFormSubmit = (data: any) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Room Block Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., TPGPGT5"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_rooms">Total Rooms *</Label>
          <Input
            id="total_rooms"
            type="number"
            {...register('total_rooms', { valueAsNumber: true })}
            placeholder="20"
          />
          {errors.total_rooms && (
            <p className="text-sm text-red-600">{errors.total_rooms.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="e.g., F1 Monza 2026 - GPGT"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="block_start">Block Start Date *</Label>
          <Input
            id="block_start"
            type="date"
            {...register('block_start')}
          />
          {errors.block_start && (
            <p className="text-sm text-red-600">{errors.block_start.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="block_end">Block End Date *</Label>
          <Input
            id="block_end"
            type="date"
            {...register('block_end')}
          />
          {errors.block_end && (
            <p className="text-sm text-red-600">{errors.block_end.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cutoff_date">Cutoff Date (days before)</Label>
          <Input
            id="cutoff_date"
            type="number"
            {...register('cutoff_date', { valueAsNumber: true })}
            placeholder="30"
          />
          <p className="text-sm text-muted-foreground">
            Days before arrival when block expires
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tentative">Tentative</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="released">Released</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_nights">Minimum Nights</Label>
          <Input
            id="min_nights"
            type="number"
            {...register('min_nights', { valueAsNumber: true })}
            placeholder="3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_nights">Maximum Nights</Label>
          <Input
            id="max_nights"
            type="number"
            {...register('max_nights', { valueAsNumber: true })}
            placeholder="7"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isCreating ? 'Create Room Block' : 'Save Room Block'}
        </Button>
      </div>
    </form>
  )
}
