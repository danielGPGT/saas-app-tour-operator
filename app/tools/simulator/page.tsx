'use client'

import { useState } from 'react'
import { Calculator, Copy, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PricingSimulator } from '@/components/tools/pricing-simulator'
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'
import { useAllocations } from '@/hooks/use-allocations'
import { useRateBands } from '@/hooks/use-rate-bands'
import { useContracts } from '@/hooks/use-contracts'

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState('pricing')

  const { data: products } = useProducts()
  const { data: resources } = useResources()
  const { data: allocations } = useAllocations()
  const { data: rateBands } = useRateBands()
  const { data: contracts } = useContracts()

  const totalProducts = products?.length || 0
  const totalAllocations = allocations?.length || 0
  const totalRateBands = rateBands?.length || 0
  const totalContracts = contracts?.length || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pricing Simulator</h1>
        <p className="text-muted-foreground">
          Test pricing calculations and scenarios across your inventory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Available for simulation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Bands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRateBands}</div>
            <p className="text-xs text-muted-foreground">
              Pricing rules configured
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocations}</div>
            <p className="text-xs text-muted-foreground">
              Capacity slots available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              Commercial agreements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Simulator Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="pricing">
                <Calculator className="h-4 w-4 mr-2" />
                Pricing Calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="mt-6">
              <PricingSimulator
                products={products || []}
                resources={resources || []}
                allocations={allocations || []}
                rateBands={rateBands || []}
                contracts={contracts || []}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <Copy className="h-6 w-6" />
                <span className="text-sm">Copy Results</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <Download className="h-6 w-6" />
                <span className="text-sm">Export Report</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6" />
                <span className="text-sm">Reset Simulator</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <Calculator className="h-6 w-6" />
                <span className="text-sm">Batch Calculate</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Simulator Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Pricing Calculation</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>1. NET Rate = Occupancy Price + Board Cost</div>
                  <div>2. After Commission = NET Rate - Commission%</div>
                  <div>3. After VAT = After Commission + Supplier VAT%</div>
                  <div>4. Customer Price = After VAT + Markup%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Availability Check</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Checks allocations for the selected dates</div>
                  <div>• Considers pool capacity constraints</div>
                  <div>• Validates rate band date ranges</div>
                  <div>• Checks weekday availability</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tips for Accurate Simulation</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Ensure all required data is loaded (products, rate bands, allocations)</div>
                <div>• Check that rate bands cover your test dates</div>
                <div>• Verify contract economics are properly configured</div>
                <div>• Test both B2C and B2B channels for comparison</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
