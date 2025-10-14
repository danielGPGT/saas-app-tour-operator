'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AllocationForm } from './allocation-form'
import { Allocation } from '@/types/domain'
import { useAllocations } from '@/hooks/use-allocations'

interface AllocationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allocation?: Allocation | null
  isCreating?: boolean
}

export function AllocationSheet({ open, onOpenChange, allocation, isCreating = false }: AllocationSheetProps) {
  const { updateAllocation, createAllocation } = useAllocations()

  const handleSave = async (data: Partial<Allocation>) => {
    try {
      if (isCreating) {
        await createAllocation(data)
      } else if (allocation) {
        await updateAllocation(allocation.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving allocation:', error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[700px] !sm:!max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isCreating ? 'Create Allocation' : 'Edit Allocation'}
              </SheetTitle>
              <SheetDescription>
                {isCreating 
                  ? 'Add a new allocation for a product on a specific date' 
                  : 'Manage allocation details and capacity'
                }
              </SheetDescription>
            </div>
            {allocation && !isCreating && (
              <Badge variant={allocation.stop_sell ? 'destructive' : 'default'}>
                {allocation.stop_sell ? 'Stop Sell' : 'Available'}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationForm
                allocation={allocation}
                onSubmit={handleSave}
                onCancel={() => onOpenChange(false)}
              />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
