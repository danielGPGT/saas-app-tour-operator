'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SupplierUnifiedForm } from './supplier-unified-form'
import { Supplier } from '@/types/domain'
import { useSuppliers } from '@/hooks/use-suppliers'

interface SupplierSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  isCreating?: boolean
}

export function SupplierSheet({ open, onOpenChange, supplier, isCreating = false }: SupplierSheetProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const { updateSupplier, createSupplier } = useSuppliers()

  const handleSave = async (data: Partial<Supplier>) => {
    try {
      if (isCreating) {
        await createSupplier(data)
      } else if (supplier) {
        await updateSupplier(supplier.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  const getSupplierTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hotel: 'bg-blue-100 text-blue-800',
      wholesaler: 'bg-green-100 text-green-800',
      venue: 'bg-purple-100 text-purple-800',
      transfer: 'bg-orange-100 text-orange-800',
      lounge: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.other
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[700px] !sm:!max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isCreating ? 'Create Supplier' : supplier?.name || 'Supplier'}
              </SheetTitle>
              <SheetDescription>
                {isCreating 
                  ? 'Add a new supplier to your network' 
                  : 'Manage supplier details and commercial terms'
                }
              </SheetDescription>
            </div>
            {supplier && !isCreating && (
              <Badge className={getSupplierTypeColor(supplier.type)}>
                {supplier.type}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="defaults">Defaults</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <SupplierUnifiedForm
                supplier={supplier}
                onSubmit={handleSave}
                onCancel={() => onOpenChange(false)}
                tab={activeTab}
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
            {isCreating ? 'Create Supplier' : 'Save Supplier'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
