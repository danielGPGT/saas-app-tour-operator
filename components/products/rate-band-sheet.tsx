'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RateBandForm } from './rate-band-form'
import { RateBand } from '@/types/domain'
import { useRateBands } from '@/hooks/use-rate-bands'

interface RateBandSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rateBand?: RateBand | null
  isCreating?: boolean
  productId?: string
}

export function RateBandSheet({ open, onOpenChange, rateBand, isCreating = false, productId }: RateBandSheetProps) {
  const [activeTab, setActiveTab] = useState('pricing')
  const { updateRateBand, createRateBand } = useRateBands()

  const handleSave = async (data: Partial<RateBand>) => {
    try {
      if (isCreating && productId) {
        await createRateBand({ ...data, product_id: productId })
      } else if (rateBand) {
        await updateRateBand(rateBand.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving rate band:', error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[700px] !sm:!max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isCreating ? 'Create Rate Band' : 'Rate Band'}
              </SheetTitle>
              <SheetDescription>
                {isCreating 
                  ? 'Add a new rate band with pricing and markup' 
                  : 'Manage rate band details and pricing'
                }
              </SheetDescription>
            </div>
            {rateBand && !isCreating && (
              <Badge variant={rateBand.active ? 'default' : 'secondary'}>
                {rateBand.active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="date-rates">Date Rates</TabsTrigger>
              <TabsTrigger value="markup">Markup</TabsTrigger>
              <TabsTrigger value="tax-config">Tax & Fees</TabsTrigger>
              <TabsTrigger value="buy-to-order">Buy-to-Order</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <RateBandForm
                rateBand={rateBand}
                onSubmit={handleSave}
                onCancel={() => onOpenChange(false)}
                tab={activeTab}
                productId={productId}
              />
            </div>
          </Tabs>
        </div>

        {/* Sheet Footer with Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            // Trigger form submission
            const form = document.querySelector('form')
            if (form) {
              form.requestSubmit()
            }
          }}>
            {isCreating ? 'Create Rate Band' : 'Save Rate Band'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
