'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackageCategory } from '@/types/domain'
import { PackageCategorySchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Palette, Eye, EyeOff, Users, Building } from 'lucide-react'

interface PackageCategoryFormProps {
  category?: PackageCategory | null
  tourId: string
  onSubmit: (data: Partial<PackageCategory>) => void
  onCancel: () => void
}

const colorOptions = [
  { value: '#3B82F6', label: 'Blue', bg: 'bg-blue-500' },
  { value: '#10B981', label: 'Green', bg: 'bg-green-500' },
  { value: '#F59E0B', label: 'Amber', bg: 'bg-amber-500' },
  { value: '#EF4444', label: 'Red', bg: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Purple', bg: 'bg-purple-500' },
  { value: '#EC4899', label: 'Pink', bg: 'bg-pink-500' },
  { value: '#6B7280', label: 'Gray', bg: 'bg-gray-500' },
  { value: '#14B8A6', label: 'Teal', bg: 'bg-teal-500' }
]

export function PackageCategoryForm({ category, tourId, onSubmit, onCancel }: PackageCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Partial<PackageCategory>>({
    resolver: zodResolver(PackageCategorySchema),
    defaultValues: {
      tour_id: tourId,
      name: category?.name || '',
      description: category?.description || '',
      color_tag: category?.color_tag || '#6B7280',
      default_markup_b2c: category?.default_markup_b2c || undefined,
      default_markup_b2b: category?.default_markup_b2b || undefined,
      visibility_b2c: category?.visibility_b2c ?? true,
      visibility_b2b: category?.visibility_b2b ?? true,
      active: category?.active ?? true
    }
  })

  const watchedColorTag = watch('color_tag')
  const watchedVisibilityB2C = watch('visibility_b2c')
  const watchedVisibilityB2B = watch('visibility_b2b')
  const watchedActive = watch('active')

  const handleFormSubmit = async (data: Partial<PackageCategory>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Building className="h-4 w-4" />
          Basic Information
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., VIP Packages, Grandstand Packages"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe this category and what types of packages it contains..."
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Visual Identity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Palette className="h-4 w-4" />
          Visual Identity
        </div>
        
        <div className="space-y-2">
          <Label>Color Tag</Label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setValue('color_tag', color.value)}
                className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  watchedColorTag === color.value 
                    ? 'border-foreground' 
                    : 'border-muted hover:border-foreground/50'
                }`}
              >
                <div className={`w-full h-6 rounded ${color.bg}`} />
                <span className="text-xs mt-1 block text-center">{color.label}</span>
                {watchedColorTag === color.value && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-background rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Default Markup */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="h-4 w-4" />
          Default Markup
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="default_markup_b2c">B2C Markup %</Label>
            <Input
              id="default_markup_b2c"
              type="number"
              step="0.1"
              min="0"
              max="100"
              {...register('default_markup_b2c', { valueAsNumber: true })}
              placeholder="e.g., 25"
            />
            {errors.default_markup_b2c && (
              <p className="text-sm text-red-600">{errors.default_markup_b2c.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_markup_b2b">B2B Markup %</Label>
            <Input
              id="default_markup_b2b"
              type="number"
              step="0.1"
              min="0"
              max="100"
              {...register('default_markup_b2b', { valueAsNumber: true })}
              placeholder="e.g., 15"
            />
            {errors.default_markup_b2b && (
              <p className="text-sm text-red-600">{errors.default_markup_b2b.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Visibility & Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="h-4 w-4" />
          Visibility & Status
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="visibility_b2c"
              checked={watchedVisibilityB2C}
              onCheckedChange={(checked) => setValue('visibility_b2c', checked)}
            />
            <Label htmlFor="visibility_b2c" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visible to B2C Customers
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="visibility_b2b"
              checked={watchedVisibilityB2B}
              onCheckedChange={(checked) => setValue('visibility_b2b', checked)}
            />
            <Label htmlFor="visibility_b2b" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Visible to B2B Partners
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={watchedActive}
              onCheckedChange={(checked) => setValue('active', checked)}
            />
            <Label htmlFor="active">Active Category</Label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">Preview</div>
        <div className="p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            {watchedColorTag && (
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: watchedColorTag }}
              />
            )}
            <span className="font-medium">{watch('name') || 'Category Name'}</span>
            <Badge variant={watchedActive ? "default" : "secondary"}>
              {watchedActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {watch('description') && (
            <p className="text-sm text-muted-foreground">{watch('description')}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Badge variant={watchedVisibilityB2C ? "default" : "secondary"}>
              B2C {watchedVisibilityB2C ? 'Visible' : 'Hidden'}
            </Badge>
            <Badge variant={watchedVisibilityB2B ? "default" : "secondary"}>
              B2B {watchedVisibilityB2B ? 'Visible' : 'Hidden'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}
