'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductForm } from './product-form'
import { Product } from '@/types/domain'
import { useProducts } from '@/hooks/use-products'

interface ProductSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  isCreating?: boolean
}

export function ProductSheet({ open, onOpenChange, product, isCreating = false }: ProductSheetProps) {
  const [activeTab, setActiveTab] = useState('details')
  const { updateProduct, createProduct } = useProducts()

  const handleSave = async (data: Partial<Product>) => {
    try {
      if (isCreating) {
        await createProduct(data)
      } else if (product) {
        await updateProduct(product.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[700px] !sm:!max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isCreating ? 'Create Product' : product?.name || 'Product'}
              </SheetTitle>
              <SheetDescription>
                {isCreating 
                  ? 'Add a new product to your inventory' 
                  : 'Manage product details and configuration'
                }
              </SheetDescription>
            </div>
            {product && !isCreating && (
              <Badge variant={product.active ? 'default' : 'secondary'}>
                {product.active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="details">Product Details</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductForm
                    product={product}
                    onSubmit={handleSave}
                    onCancel={() => onOpenChange(false)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
