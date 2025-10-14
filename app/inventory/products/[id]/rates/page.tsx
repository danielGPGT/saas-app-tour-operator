'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Calendar, DollarSign, Settings, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RateBandSheet } from '@/components/products/rate-band-sheet'
import { RateBandTimeline } from '@/components/products/rate-band-timeline'
import { useRateBands } from '@/hooks/use-rate-bands'
import { useProducts } from '@/hooks/use-products'
import { useContracts } from '@/hooks/use-contracts'
import { RateBand } from '@/types/domain'

export default function ProductRatesPage() {
  const params = useParams()
  const productId = params.id as string

  const [selectedRateBand, setSelectedRateBand] = useState<RateBand | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('timeline')

  const { data: rateBands, isLoading } = useRateBands()
  const { getProduct } = useProducts()
  const { data: contracts } = useContracts()

  const product = getProduct(productId)
  const productRateBands = rateBands?.filter(rb => rb.product_id === productId) || []

  const handleCreate = () => {
    setSelectedRateBand(null)
    setIsCreating(true)
    setIsSheetOpen(true)
  }

  const handleEdit = (rateBand: RateBand) => {
    setSelectedRateBand(rateBand)
    setIsCreating(false)
    setIsSheetOpen(true)
  }

  const getContractName = (contractId: string) => {
    return contracts?.find(c => c.id === contractId)?.id || contractId
  }

  const getWeekdayMaskText = (mask: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const activeDays = days.filter((_, index) => mask & (1 << index))
    return activeDays.join(', ')
  }

  const getRateDisplay = (rateBand: any) => {
    if (!rateBand.base_rate || rateBand.base_rate <= 0) return 'No price set'
    const unit = rateBand.pricing_unit?.replace('per_', '') || 'unit'
    return `€${rateBand.base_rate} per ${unit}`
  }

  if (!product) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Product not found
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
          <h1 className="text-2xl font-bold">{product.name} - Rate Bands</h1>
          <p className="text-muted-foreground">
            Manage pricing and availability for {product.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Rate Band
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rate Bands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productRateBands.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productRateBands.filter(rb => rb.active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(productRateBands.map(rb => rb.contract_id)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg B2C Markup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productRateBands.length > 0 
                ? Math.round(productRateBands.reduce((sum, rb) => sum + rb.markup.b2c_pct, 0) / productRateBands.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Bands Management */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Bands</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-6">
              <RateBandTimeline
                rateBands={productRateBands}
                onEdit={handleEdit}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : productRateBands.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rate bands found for this product
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productRateBands.map((rateBand) => (
                      <div key={rateBand.id} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={rateBand.active ? 'default' : 'secondary'}>
                                {rateBand.active ? 'Active' : 'Inactive'}
                              </Badge>
                              <span className="text-sm font-medium">
                                {getContractName(rateBand.contract_id)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(rateBand.band_start).toLocaleDateString()} - {new Date(rateBand.band_end).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {getWeekdayMaskText(rateBand.weekday_mask)}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {getRateDisplay(rateBand)}
                              </div>
                              <div>
                                B2C: {rateBand.markup.b2c_pct}% • B2B: {rateBand.markup.b2b_pct}%
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(rateBand)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rate Band Sheet */}
      <RateBandSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        rateBand={selectedRateBand}
        isCreating={isCreating}
        productId={productId}
      />
    </div>
  )
}
