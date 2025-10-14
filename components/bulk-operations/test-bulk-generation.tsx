'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, TestTube } from 'lucide-react'
import { toast } from 'sonner'

interface TestBulkGenerationProps {
  item: any
  contract: any
  onTestGeneration: (data: { allocations: any[], rates: any[] }) => void
}

export function TestBulkGeneration({ item, contract, onTestGeneration }: TestBulkGenerationProps) {
  const [testData, setTestData] = useState<{ allocations: any[], rates: any[] } | null>(null)

  const generateTestData = () => {
    // Generate test allocations
    const testAllocations = [
      {
        item_id: item.id,
        item_type: item.item_type,
        supplier_id: contract.supplier_id,
        category_ids: [item.categories[0]?.id],
        quantity: 50,
        allocation_pool_id: `${item.name.toLowerCase().replace(/\s+/g, '-')}-pool`,
        label: 'Standard Block',
        description: 'Allocated 50 Standard rooms',
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: true,
        room_allocations: [{
          room_group_ids: [item.categories[0]?.id],
          quantity: 50,
          label: 'Standard Block',
          allocation_pool_id: `${item.name.toLowerCase().replace(/\s+/g, '-')}-pool`
        }]
      }
    ]

    // Generate test rates
    const testRates = [
      {
        contract_id: contract.id,
        item_id: item.id,
        itemName: item.name,
        item_type: item.item_type,
        category_id: item.categories[0]?.id,
        categoryName: item.categories[0]?.category_name,
        supplier_id: contract.supplier_id,
        supplierName: contract.supplierName,
        base_rate: 120,
        markup_percentage: 0.6,
        selling_price: 192,
        currency: contract.currency,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days_of_week: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
        active: true,
        inventory_type: 'contract',
        allocation_pool_id: `${item.name.toLowerCase().replace(/\s+/g, '-')}-pool`,
        plugin_meta: {
          occupancy_type: 'double',
          board_type: 'bed_breakfast',
          board_cost: 15,
          contract_linked: true
        },
        rate_details: {
          room_type: item.categories[0]?.category_name,
          occupancy_type: 'double',
          board_type: 'bed_breakfast',
          board_cost: 15,
          pricing_unit: 'per_room_per_night',
          capacity_info: {
            min_occupancy: 2,
            max_occupancy: 2
          }
        }
      }
    ]

    const data = { allocations: testAllocations, rates: testRates }
    setTestData(data)
    toast.success('Test data generated!')
  }

  const handleTestGeneration = () => {
    if (testData) {
      onTestGeneration(testData)
      toast.success('Test data applied!')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TestTube className="h-4 w-4" />
          Test Bulk Generation
        </CardTitle>
        <CardDescription>Test the bulk generation system with sample data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={generateTestData} size="sm">
            Generate Test Data
          </Button>
          {testData && (
            <Button onClick={handleTestGeneration} size="sm" variant="outline">
              Apply Test Data
            </Button>
          )}
        </div>

        {testData && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{testData.allocations.length} Allocations</Badge>
              <Badge variant="outline">{testData.rates.length} Rates</Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Sample Allocation:</div>
              <div className="bg-muted p-2 rounded text-xs font-mono">
                {JSON.stringify(testData.allocations[0], null, 2)}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Sample Rate:</div>
              <div className="bg-muted p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                {JSON.stringify(testData.rates[0], null, 2)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
