'use client'

import { useState } from 'react'
import { PackageCategory } from '@/types/domain'
import { PackageCategoryForm } from './package-category-form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

interface PackageCategorySheetProps {
  category?: PackageCategory | null
  tourId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<PackageCategory>) => Promise<void>
}

export function PackageCategorySheet({ 
  category, 
  tourId, 
  open, 
  onOpenChange, 
  onSave 
}: PackageCategorySheetProps) {
  const handleSave = async (data: Partial<PackageCategory>) => {
    try {
      await onSave(data)
      onOpenChange(false)
      toast.success(category ? 'Category updated successfully' : 'Category created successfully')
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
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
            {category ? 'Edit Package Category' : 'Create Package Category'}
          </SheetTitle>
          <SheetDescription>
            {category 
              ? 'Update the category details below.' 
              : 'Create a new category to organize your tour packages.'
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <PackageCategoryForm
            category={category}
            tourId={tourId}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
