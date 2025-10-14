'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit, Users, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Allocation, Product, Resource } from '@/types/domain'

interface AllocationCalendarProps {
  allocations: Allocation[]
  products: Product[]
  resources: Resource[]
  onEdit: (allocation: Allocation) => void
}

export function AllocationCalendar({ allocations, products, resources, onEdit }: AllocationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || productId
  }

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id === resourceId)?.name || resourceId
  }

  const getAllocationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return allocations.filter(a => {
      const startDate = new Date(a.start_date)
      const endDate = new Date(a.end_date)
      const currentDate = new Date(dateStr)
      return currentDate >= startDate && currentDate <= endDate
    })
  }

  const getPoolAllocations = (poolId: string | null) => {
    if (!poolId) return []
    return allocations.filter(a => a.pool_id === poolId)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDay = (firstDay.getDay() + 6) % 7 // Convert to Monday-based week

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{getMonthName(currentDate)}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {allocations.length} total allocations
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Allocation Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20 border rounded"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const dayAllocations = getAllocationsForDate(date)
              
              return (
                <div
                  key={day}
                  className="h-20 border rounded p-1 overflow-hidden"
                >
                  <div className="text-xs font-medium mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayAllocations.slice(0, 2).map((allocation) => (
                      <div
                        key={allocation.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                          allocation.stop_sell 
                            ? 'bg-red-100 text-red-800' 
                            : allocation.capacity > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => onEdit(allocation)}
                      >
                        <div className="font-medium truncate">
                          {getProductName(allocation.product_id)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-2 w-2" />
                          {allocation.capacity}
                          {allocation.pool_id && (
                            <span className="text-xs">({allocation.pool_id})</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {dayAllocations.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayAllocations.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pool Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(allocations.map(a => a.pool_id).filter(Boolean))).map(poolId => {
              const poolAllocations = getPoolAllocations(poolId)
              const totalCapacity = poolAllocations.reduce((sum, a) => sum + a.capacity, 0)
              const stopSellCount = poolAllocations.filter(a => a.stop_sell).length
              
              return (
                <div key={poolId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{poolId}</div>
                    <div className="text-sm text-muted-foreground">
                      {poolAllocations.length} allocations • {totalCapacity} total capacity
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={stopSellCount > 0 ? 'destructive' : 'default'}>
                      {stopSellCount > 0 ? `${stopSellCount} stop sell` : 'Active'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(poolAllocations[0])}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {Array.from(new Set(allocations.map(a => a.pool_id).filter(Boolean))).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No shared pools configured
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
