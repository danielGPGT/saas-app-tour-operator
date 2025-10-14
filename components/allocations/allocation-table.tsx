'use client'

import { useState } from 'react'
import { Search, Filter, MoreHorizontal, Edit, Users, Calendar, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Allocation, Product, Resource } from '@/types/domain'

interface AllocationTableProps {
  allocations: Allocation[]
  products: Product[]
  resources: Resource[]
  onEdit: (allocation: Allocation) => void
  isLoading: boolean
}

export function AllocationTable({ allocations, products, resources, onEdit, isLoading }: AllocationTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all')
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<string>('all')
  const [selectedPoolFilter, setSelectedPoolFilter] = useState<string>('all')

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || productId
  }

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id === resourceId)?.name || resourceId
  }

  const getResourceTypeIcon = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    if (!resource) return '📦'
    
    switch (resource.type) {
      case 'accommodation': return '🏨'
      case 'event_ticket': return '🎫'
      case 'transfer': return '🚗'
      case 'lounge': return '🛋️'
      default: return '📦'
    }
  }

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      getProductName(allocation.product_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getResourceName(allocation.resource_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allocation.pool_id && allocation.pool_id.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesProduct = selectedProductFilter === 'all' || allocation.product_id === selectedProductFilter
    const matchesResource = selectedResourceFilter === 'all' || allocation.resource_id === selectedResourceFilter
    const matchesPool = selectedPoolFilter === 'all' || 
      (selectedPoolFilter === 'with_pool' && allocation.pool_id) ||
      (selectedPoolFilter === 'no_pool' && !allocation.pool_id) ||
      (allocation.pool_id === selectedPoolFilter)

    return matchesSearch && matchesProduct && matchesResource && matchesPool
  })

  const handleBulkEdit = () => {
    // TODO: Implement bulk edit functionality
    console.log('Bulk edit allocations')
  }

  const handleDuplicate = (allocation: Allocation) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate allocation:', allocation.id)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search allocations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedProductFilter} onValueChange={setSelectedProductFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedResourceFilter} onValueChange={setSelectedResourceFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            {resources.map(resource => (
              <SelectItem key={resource.id} value={resource.id}>
                <div className="flex items-center gap-2">
                  <span>{getResourceTypeIcon(resource.id)}</span>
                  {resource.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPoolFilter} onValueChange={setSelectedPoolFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by pool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pools</SelectItem>
            <SelectItem value="with_pool">With Pool</SelectItem>
            <SelectItem value="no_pool">No Pool</SelectItem>
            {Array.from(new Set(allocations.map(a => a.pool_id).filter(Boolean))).map(poolId => (
              <SelectItem key={poolId} value={poolId!}>
                {poolId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredAllocations.length} allocations found
        </div>
        <Button variant="outline" size="sm" onClick={handleBulkEdit}>
          Bulk Edit
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Range</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Pool</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="h-12">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAllocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedProductFilter !== 'all' || selectedResourceFilter !== 'all' || selectedPoolFilter !== 'all'
                    ? 'No allocations found matching your filters' 
                    : 'No allocations found'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAllocations.map((allocation) => (
                <TableRow key={allocation.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div className="text-sm">
                        <div>{new Date(allocation.start_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">to {new Date(allocation.end_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getProductName(allocation.product_id)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getResourceTypeIcon(allocation.resource_id)}</span>
                      <span className="text-sm">{getResourceName(allocation.resource_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{allocation.capacity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {allocation.pool_id ? (
                      <Badge variant="outline">{allocation.pool_id}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={allocation.stop_sell ? 'destructive' : 'default'}>
                      {allocation.stop_sell ? 'Stop Sell' : 'Available'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {allocation.updated_at ? new Date(allocation.updated_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(allocation)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Allocation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDuplicate(allocation)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
