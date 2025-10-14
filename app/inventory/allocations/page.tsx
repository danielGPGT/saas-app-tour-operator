'use client'

import { useState } from 'react'
import { Plus, Calendar, Table, Upload, Download, Filter, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AllocationCalendar } from '@/components/allocations/allocation-calendar'
import { AllocationTable } from '@/components/allocations/allocation-table'
import { AllocationImport } from '@/components/allocations/allocation-import'
import { AllocationSheet } from '@/components/allocations/allocation-sheet'
import { useAllocations } from '@/hooks/use-allocations'
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'

export default function AllocationsPage() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [selectedAllocation, setSelectedAllocation] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const { data: allocations, isLoading, error } = useAllocations()
  const { data: products } = useProducts()
  const { data: resources } = useResources()

  const handleCreate = () => {
    setSelectedAllocation(null)
    setIsCreating(true)
    setIsSheetOpen(true)
  }

  const handleEdit = (allocation: any) => {
    setSelectedAllocation(allocation)
    setIsCreating(false)
    setIsSheetOpen(true)
  }

  const getProductName = (productId: string) => {
    return products?.find(p => p.id === productId)?.name || productId
  }

  const getResourceName = (resourceId: string) => {
    return resources?.find(r => r.id === resourceId)?.name || resourceId
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading allocations: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Allocations</h1>
          <p className="text-muted-foreground">
            Manage inventory capacity and availability across products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Allocation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocations?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(allocations?.map(a => a.product_id) || []).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allocations?.filter(a => a.pool_id).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stop Sell</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allocations?.filter(a => a.stop_sell).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pool Information Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Shared Pools:</strong> Use pool_id to link allocations across products. 
          For example, "may-2025-double" can be shared between Standard Double and Superior Double rooms.
          Pool capacity is calculated as the minimum available across all linked allocations.
        </AlertDescription>
      </Alert>

      {/* Allocations Management */}
      <Card>
        <CardHeader>
          <CardTitle>Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="table">
                <Table className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="import">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-6">
              <AllocationCalendar
                allocations={allocations || []}
                products={products || []}
                resources={resources || []}
                onEdit={handleEdit}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <AllocationTable
                allocations={allocations || []}
                products={products || []}
                resources={resources || []}
                onEdit={handleEdit}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="import" className="mt-6">
              <AllocationImport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Allocation Sheet */}
      <AllocationSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        allocation={selectedAllocation}
        isCreating={isCreating}
      />
    </div>
  )
}
