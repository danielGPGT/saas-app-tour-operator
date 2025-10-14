'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContractForm } from './contract-form'
import { Contract } from '@/types/domain'
import { useContracts } from '@/hooks/use-contracts'

interface ContractSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract?: Contract | null
  isCreating?: boolean
}

export function ContractSheet({ open, onOpenChange, contract, isCreating = false }: ContractSheetProps) {
  const [activeTab, setActiveTab] = useState('basics')
  const { updateContract, createContract } = useContracts()

  const handleSave = async (data: Partial<Contract>) => {
    try {
      if (isCreating) {
        await createContract(data)
      } else if (contract) {
        await updateContract(contract.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving contract:', error)
    }
  }

  const getFulfilmentColor = (fulfilment: string) => {
    const colors: Record<string, string> = {
      instant: 'bg-green-100 text-green-800',
      on_request: 'bg-yellow-100 text-yellow-800',
      buy_to_order: 'bg-blue-100 text-blue-800'
    }
    return colors[fulfilment] || colors.on_request
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[700px] !sm:!max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isCreating ? 'Create Contract' : `Contract ${contract?.id || ''}`}
              </SheetTitle>
              <SheetDescription>
                {isCreating 
                  ? 'Create a new commercial agreement with a supplier' 
                  : 'Manage contract details and commercial terms'
                }
              </SheetDescription>
            </div>
            {contract && !isCreating && (
              <Badge className={getFulfilmentColor(contract.fulfilment)}>
                {contract.fulfilment.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="fulfilment">Fulfilment</TabsTrigger>
              <TabsTrigger value="economics">Economics</TabsTrigger>
              <TabsTrigger value="plugin">Plugin Defaults</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <ContractForm
                contract={contract}
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
            {isCreating ? 'Create Contract' : 'Save Contract'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}