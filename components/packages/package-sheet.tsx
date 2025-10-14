'use client'

import { useState } from 'react'
import { Package, PackageCategory } from '@/types/domain'
import { PackageForm } from './package-form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

interface PackageSheetProps {
  packageData?: Package | null
  tourId: string
  categories: PackageCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Package>) => Promise<void>
}

export function PackageSheet({ 
  packageData, 
  tourId, 
  categories, 
  open, 
  onOpenChange, 
  onSave 
}: PackageSheetProps) {
  const handleSave = async (data: Partial<Package>) => {
    try {
      await onSave(data)
      onOpenChange(false)
      toast.success(packageData ? 'Package updated successfully' : 'Package created successfully')
    } catch (error) {
      console.error('Error saving package:', error)
      toast.error('Failed to save package')
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {packageData ? 'Edit Package' : 'Create Package'}
          </SheetTitle>
          <SheetDescription>
            {packageData 
              ? 'Update the package details and components below.' 
              : 'Create a new package by adding products and configuring pricing.'
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <PackageForm
            packageData={packageData}
            tourId={tourId}
            categories={categories}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
