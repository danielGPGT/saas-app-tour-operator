'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, PackageComponent, PackageCategory } from '@/types/domain'
import { PackageSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileText, Eye, EyeOff, Users, Building, Plus, Trash2, Edit, MoreHorizontal, Check, ChevronsUpDown } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'

interface PackageFormProps {
  packageData?: Package | null
  tourId: string
  categories: PackageCategory[]
  onSubmit: (data: Partial<Package>) => void
  onCancel: () => void
}

const selectionTypeLabels = {
  required: 'Required',
  optional: 'Optional', 
  choice: 'Choice of'
}


export function PackageForm({ packageData, tourId, categories, onSubmit, onCancel }: PackageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingComponent, setEditingComponent] = useState<PackageComponent | null>(null)
  const [openProductCombos, setOpenProductCombos] = useState<Record<number, boolean>>({})

  const { data: products } = useProducts()
  const { data: resources } = useResources()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Partial<Package>>({
    resolver: zodResolver(PackageSchema),
    defaultValues: {
      tour_id: tourId,
      category_id: packageData?.category_id || '',
      name: packageData?.name || '',
      description: packageData?.description || '',
      status: packageData?.status || 'draft',
      visibility_b2c: packageData?.visibility_b2c ?? true,
      visibility_b2b: packageData?.visibility_b2b ?? true,
      price_override: packageData?.price_override || undefined,
      components: packageData?.components || []
    }
  })

  const watchedComponents = watch('components') || []
  const watchedStatus = watch('status')
  const watchedVisibilityB2C = watch('visibility_b2c')
  const watchedVisibilityB2B = watch('visibility_b2b')

  const handleFormSubmit = async (data: Partial<Package>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addComponent = () => {
    const newComponent: Partial<PackageComponent> = {
      product_id: '',
      selection_type: 'required',
      price_override: undefined,
      notes: '',
      sort_order: watchedComponents.length
    }
    
    setValue('components', [...watchedComponents, newComponent as PackageComponent])
  }

  const updateComponent = (index: number, data: Partial<PackageComponent>) => {
    const updatedComponents = [...watchedComponents]
    updatedComponents[index] = { ...updatedComponents[index], ...data }
    setValue('components', updatedComponents)
  }

  const removeComponent = (index: number) => {
    const updatedComponents = watchedComponents.filter((_, i) => i !== index)
    setValue('components', updatedComponents)
  }

  const getProductName = (productId: string) => {
    const product = products?.find(p => p.id === productId)
    if (!product) return 'Unknown Product'
    
    const resource = resources?.find(r => r.id === product.resource_id)
    const resourceName = resource ? ` (${resource.name})` : ''
    
    return `${product.name}${resourceName}`
  }

  const setOpenProductCombo = (index: number, open: boolean) => {
    setOpenProductCombos(prev => ({ ...prev, [index]: open }))
  }

  const getSelectedProduct = (productId: string) => {
    return products?.find(p => p.id === productId)
  }


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="h-4 w-4" />
          Basic Information
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Package Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., VIP Weekend Experience"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category *</Label>
            <Select
              value={watch('category_id')}
              onValueChange={(value) => setValue('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.color_tag && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color_tag }}
                        />
                      )}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe this package and what makes it special..."
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="h-4 w-4" />
          Pricing
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price_override">Package Price Override €</Label>
          <Input
            id="price_override"
            type="number"
            step="0.01"
            min="0"
            {...register('price_override', { valueAsNumber: true })}
            placeholder="Optional fixed package price"
          />
          <p className="text-xs text-muted-foreground">
            Set a fixed price for the entire package (overrides component pricing)
          </p>
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="h-4 w-4" />
          Visibility
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
        </div>
      </div>

      {/* Components */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building className="h-4 w-4" />
            Package Components ({watchedComponents.length})
          </div>
          <Button type="button" onClick={addComponent} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>

        {watchedComponents.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Components Added</h3>
            <p className="text-muted-foreground mb-4">
              Add products to build this package.
            </p>
            <Button type="button" onClick={addComponent}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Component
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {watchedComponents.map((component, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {selectionTypeLabels[component.selection_type]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getProductName(component.product_id)}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingComponent(component)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => removeComponent(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product</Label>
                      <Popover open={openProductCombos[index]} onOpenChange={(open) => setOpenProductCombo(index, open)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProductCombos[index]}
                            className="w-full justify-between"
                          >
                            {component.product_id ? getProductName(component.product_id) : "Select product..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search products..." />
                            <CommandList>
                              <CommandEmpty>No product found.</CommandEmpty>
                              <CommandGroup>
                                {products?.map((product) => {
                                  const resource = resources?.find(r => r.id === product.resource_id)
                                  const resourceName = resource ? ` (${resource.name})` : ''
                                  const displayName = `${product.name}${resourceName}`
                                  
                                  return (
                                    <CommandItem
                                      key={product.id}
                                      value={displayName}
                                      onSelect={() => {
                                        updateComponent(index, { product_id: product.id })
                                        setOpenProductCombo(index, false)
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          component.product_id === product.id ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      {displayName}
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Selection Type</Label>
                      <Select
                        value={component.selection_type}
                        onValueChange={(value) => updateComponent(index, { selection_type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="optional">Optional</SelectItem>
                          <SelectItem value="choice">Choice of</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Price Override €</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={component.price_override || ''}
                        onChange={(e) => updateComponent(index, { 
                          price_override: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        placeholder="Optional fixed price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        value={component.notes || ''}
                        onChange={(e) => updateComponent(index, { notes: e.target.value })}
                        placeholder="Internal notes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : packageData ? 'Update Package' : 'Create Package'}
        </Button>
      </div>
    </form>
  )
}
