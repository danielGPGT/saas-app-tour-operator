'use client'

import { useState } from 'react'
import { Tour } from '@/types/domain'
import { TourForm } from './tour-form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

interface TourSheetProps {
  tour?: Tour | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Tour>) => Promise<void>
}

export function TourSheet({ tour, open, onOpenChange, onSave }: TourSheetProps) {
  const handleSave = async (data: Partial<Tour>) => {
    try {
      await onSave(data)
      onOpenChange(false)
      toast.success(tour ? 'Tour updated successfully' : 'Tour created successfully')
    } catch (error) {
      console.error('Error saving tour:', error)
      toast.error('Failed to save tour')
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {tour ? 'Edit Tour' : 'Create New Tour'}
          </SheetTitle>
          <SheetDescription>
            {tour 
              ? 'Update the tour details below.' 
              : 'Fill in the details to create a new tour.'
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <TourForm
            tour={tour}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
