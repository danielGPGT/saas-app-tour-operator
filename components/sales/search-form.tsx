'use client'

import { useState } from 'react'
import { Search, Calendar, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product, Resource } from '@/types/domain'

interface SearchFormProps {
  onSearch: (params: any) => void
  isLoading: boolean
  products: Product[]
  resources: Resource[]
}

export function SearchForm({ onSearch, isLoading, products, resources }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState({
    productId: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: [] as number[],
    channel: 'b2c' as 'b2c' | 'b2b'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchParams.productId && searchParams.startDate && searchParams.endDate) {
      onSearch(searchParams)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [field]: value }))
  }

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || productId
  }

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id === resourceId)?.name || resourceId
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

  const selectedProduct = products.find(p => p.id === searchParams.productId)
  const selectedResource = selectedProduct ? resources.find(r => r.id === selectedProduct.resource_id) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="space-y-2">
          <Label htmlFor="product">Product *</Label>
          <Select
            value={searchParams.productId}
            onValueChange={(value) => handleInputChange('productId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.filter(p => p.active).map(product => {
                const resource = resources.find(r => r.id === product.resource_id)
                return (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <span>{getResourceTypeIcon(resource?.type || '')}</span>
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        • {getResourceName(product.resource_id)}
                      </span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {selectedProduct && selectedResource && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span>{getResourceTypeIcon(selectedResource.type)}</span>
                <span className="font-medium">{selectedProduct.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{selectedResource.name}</span>
              </div>
              {selectedResource.location && (
                <div className="text-sm text-muted-foreground mt-1">
                  📍 {selectedResource.location}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Channel Selection */}
        <div className="space-y-2">
          <Label htmlFor="channel">Sales Channel *</Label>
          <Select
            value={searchParams.channel}
            onValueChange={(value) => handleInputChange('channel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="b2c">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  B2C (Direct Customers)
                </div>
              </SelectItem>
              <SelectItem value="b2b">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  B2B (Travel Agents)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={searchParams.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={searchParams.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            min={searchParams.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Occupancy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adults">Adults *</Label>
          <Select
            value={searchParams.adults.toString()}
            onValueChange={(value) => handleInputChange('adults', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Number of adults" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Adult' : 'Adults'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="children">Children</Label>
          <Select
            value="0"
            onValueChange={(value) => {
              const count = parseInt(value)
              const children = Array.from({ length: count }, (_, i) => 12) // Default age 12
              handleInputChange('children', children)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Number of children" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => i).map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Child' : num === 0 ? 'No Children' : 'Children'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading || !searchParams.productId || !searchParams.startDate || !searchParams.endDate}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          {isLoading ? 'Searching...' : 'Search Inventory'}
        </Button>
      </div>

      {/* Search Info */}
      {searchParams.productId && searchParams.startDate && searchParams.endDate && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>Search Summary:</strong></div>
              <div>• Product: {getProductName(searchParams.productId)}</div>
              <div>• Dates: {new Date(searchParams.startDate).toLocaleDateString()} - {new Date(searchParams.endDate).toLocaleDateString()}</div>
              <div>• Guests: {searchParams.adults} adults {searchParams.children.length > 0 && `+ ${searchParams.children.length} children`}</div>
              <div>• Channel: {searchParams.channel.toUpperCase()}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
