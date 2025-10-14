'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Zap, 
  Package, 
  Calculator, 
  Building2, 
  Users, 
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { BulkRateGenerator } from './bulk-rate-generator'
import { SmartAllocationGenerator } from './smart-allocation-generator'
import type { InventoryItem, UnifiedContract } from '@/types/unified-inventory'

interface QuickSetupWizardProps {
  item: InventoryItem
  contract: UnifiedContract
  onComplete: (data: { allocations: any[], rates: any[] }) => void
  onCancel: () => void
}

type WizardStep = 'overview' | 'allocations' | 'rates' | 'review'

export function QuickSetupWizard({ item, contract, onComplete, onCancel }: QuickSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('overview')
  const [generatedAllocations, setGeneratedAllocations] = useState<any[]>([])
  const [generatedPools, setGeneratedPools] = useState<any[]>([])
  const [generatedRates, setGeneratedRates] = useState<any[]>([])
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([])

  const steps = [
    { id: 'overview', title: 'Quick Setup', description: 'Choose your setup strategy' },
    { id: 'allocations', title: 'Allocations', description: 'Generate room allocations' },
    { id: 'rates', title: 'Rates', description: 'Create pricing rates' },
    { id: 'review', title: 'Review', description: 'Review and create everything' }
  ]

  const handleAllocationsGenerated = (data: { allocations: any[], pools: any[] }) => {
    setGeneratedAllocations(data.allocations)
    setGeneratedPools(data.pools)
    setCompletedSteps(prev => [...prev, 'allocations'])
    setCurrentStep('rates')
    toast.success(`Generated ${data.allocations.length} allocations and ${data.pools.length} pools`)
  }

  const handleRatesGenerated = (rates: any[]) => {
    setGeneratedRates(rates)
    setCompletedSteps(prev => [...prev, 'rates'])
    setCurrentStep('review')
    toast.success(`Generated ${rates.length} rates`)
  }

  const handleComplete = () => {
    onComplete({
      allocations: generatedAllocations,
      pools: generatedPools,
      rates: generatedRates
    })
    toast.success('Quick setup completed!')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Quick Setup Wizard</h2>
              <p className="text-muted-foreground mt-2">
                Set up allocations and rates for {item.name} in just a few clicks
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setCurrentStep('allocations')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-sm">Smart Allocations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Auto-generate room allocations with smart distribution
                  </p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">Equal Split</Badge>
                    <Badge variant="outline" className="text-xs">Weighted</Badge>
                    <Badge variant="outline" className="text-xs">Custom</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setCurrentStep('rates')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-sm">Bulk Rates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Create multiple rates with different board types and occupancy
                  </p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">Board Types</Badge>
                    <Badge variant="outline" className="text-xs">Occupancy</Badge>
                    <Badge variant="outline" className="text-xs">Auto-Pricing</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button onClick={() => setCurrentStep('allocations')} size="lg">
                Start Quick Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'allocations':
        return (
          <SmartAllocationGenerator
            item={item}
            contract={contract}
            onGenerateAllocations={handleAllocationsGenerated}
            onCancel={() => setCurrentStep('overview')}
          />
        )

      case 'rates':
        return (
          <BulkRateGenerator
            item={item}
            contract={contract}
            onGenerateRates={handleRatesGenerated}
            onCancel={() => setCurrentStep('allocations')}
          />
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Review & Create</h2>
              <p className="text-muted-foreground mt-2">
                Review what will be created and finalize the setup
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Allocations ({generatedAllocations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedAllocations.slice(0, 3).map((allocation, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{allocation.label}</span>
                        <Badge variant="outline">{allocation.quantity} rooms</Badge>
                      </div>
                    ))}
                    {generatedAllocations.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        ... and {generatedAllocations.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Pools ({generatedPools.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedPools.map((pool, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{pool.pool_id}</span>
                        <Badge variant="outline">{pool.total_capacity} capacity</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Rates ({generatedRates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedRates.slice(0, 3).map((rate, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{rate.categoryName} - {rate.rate_details.occupancy_type}</span>
                        <Badge variant="outline">{rate.currency} {rate.base_rate}</Badge>
                      </div>
                    ))}
                    {generatedRates.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        ... and {generatedRates.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Summary</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{generatedAllocations.length}</div>
                  <div className="text-muted-foreground">Allocations</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{generatedPools.length}</div>
                  <div className="text-muted-foreground">Pools</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{generatedRates.length}</div>
                  <div className="text-muted-foreground">Rates</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {generatedAllocations.reduce((sum, a) => sum + a.quantity, 0)}
                  </div>
                  <div className="text-muted-foreground">Total Rooms</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('rates')}>
                Back to Rates
              </Button>
              <Button onClick={handleComplete} size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Everything
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              currentStep === step.id 
                ? 'bg-blue-100 text-blue-700' 
                : completedSteps.includes(step.id as WizardStep)
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {completedSteps.includes(step.id as WizardStep) ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <div className={`h-4 w-4 rounded-full ${
                  currentStep === step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
              <span className="font-medium">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}
