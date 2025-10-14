'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceForm } from './resource-form'
import { ResourceProductsTable } from './resource-products-table'
import { Resource } from '@/types/domain'
import { useResources } from '@/hooks/use-resources'

interface ResourceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource?: Resource | null
  isCreating?: boolean
}

export function ResourceSheet({ open, onOpenChange, resource, isCreating = false }: ResourceSheetProps) {
  const [activeTab, setActiveTab] = useState('details')
  const { updateResource, createResource } = useResources()

  const handleSave = async (data: Partial<Resource>) => {
    try {
      if (isCreating) {
        await createResource(data)
      } else if (resource) {
        await updateResource(resource.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving resource:', error)
    }
  }

  const getResourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      accommodation: 'bg-blue-100 text-blue-800',
      event_ticket: 'bg-purple-100 text-purple-800',
      transfer: 'bg-green-100 text-green-800',
      lounge: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[700px] !sm:!max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isCreating ? 'Create Resource' : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getResourceTypeIcon(resource?.type || '')}</span>
                    {resource?.name || 'Resource'}
                  </div>
                )}
              </SheetTitle>
              <SheetDescription>
                {isCreating 
                  ? 'Add a new inventory resource to your system' 
                  : 'Manage resource details and associated products'
                }
              </SheetDescription>
            </div>
            {resource && !isCreating && (
              <Badge className={getResourceTypeColor(resource.type)}>
                {resource.type.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="products" disabled={isCreating}>
                Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResourceForm
                    resource={resource}
                    onSubmit={handleSave}
                    onCancel={() => onOpenChange(false)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Associated Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {resource ? (
                    <ResourceProductsTable resourceId={resource.id} />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Save the resource first to manage its products.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
