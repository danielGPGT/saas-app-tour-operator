'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  FileText, 
  Package, 
  Upload, 
  Calculator, 
  Eye,
  Send,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import type { InventoryItem, UnifiedContract } from '@/types/unified-inventory'

interface OpsQuickSetupProps {
  item: InventoryItem
  onComplete: (data: any) => void
  onCancel: () => void
}

type WorkflowStep = 'contract' | 'offers' | 'rates' | 'allocations' | 'simulator' | 'publish'

export function OpsQuickSetup({ item, onComplete, onCancel }: OpsQuickSetupProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('contract')
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([])
  
  // Contract data
  const [contractData, setContractData] = useState({
    contract_name: '',
    supplier_commission_rate: 5.0,
    vat_rate: 5.0,
    service_fee_per_ticket: 2.50,
    currency: 'AED'
  })
  
  // Offers data
  const [offers, setOffers] = useState<any[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['web', 'b2b'])
  
  // Rates data
  const [ratesFile, setRatesFile] = useState<File | null>(null)
  const [ratesData, setRatesData] = useState<any[]>([])
  
  // Allocations data
  const [allocations, setAllocations] = useState<any[]>([])
  
  const steps = [
    { id: 'contract', title: 'Contract', description: 'Set fees & commission', icon: FileText },
    { id: 'offers', title: 'Offers', description: 'Product × Contract × Channel', icon: Package },
    { id: 'rates', title: 'Rates CSV', description: 'Upload rate bands', icon: Upload },
    { id: 'allocations', title: 'Allocations', description: 'Set capacity', icon: Calculator },
    { id: 'simulator', title: 'Simulator', description: 'Spot-check pricing', icon: Eye },
    { id: 'publish', title: 'Publish', description: 'Go live', icon: Send }
  ]

  const handleStepComplete = (step: WorkflowStep) => {
    setCompletedSteps(prev => [...prev, step])
    const currentIndex = steps.findIndex(s => s.id === step)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as WorkflowStep)
    }
  }

  const handleRatesFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setRatesFile(file)
      // Simulate CSV parsing
      const mockRatesData = [
        { category: 'Main Grandstand', adult: 500, child: 250, senior: 400 },
        { category: 'Turn 1 Grandstand', adult: 300, child: 150, senior: 240 },
        { category: 'General Admission', adult: 100, child: 50, senior: 80 }
      ]
      setRatesData(mockRatesData)
      toast.success('Rates CSV uploaded and parsed!')
    }
  }

  const handlePublish = () => {
    onComplete({
      contract: contractData,
      offers,
      rates: ratesData,
      allocations
    })
    toast.success('Event published successfully!')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'contract':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Quick Contract Setup</h2>
              <p className="text-muted-foreground mt-2">
                Set up the basic contract terms for {item.name}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>Essential terms only - we'll handle the rest</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Contract Name</Label>
                  <Input
                    value={contractData.contract_name}
                    onChange={(e) => setContractData({...contractData, contract_name: e.target.value})}
                    placeholder="F1 Abu Dhabi 2025 - Main Contract"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Commission (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={contractData.supplier_commission_rate}
                      onChange={(e) => setContractData({...contractData, supplier_commission_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>VAT (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={contractData.vat_rate}
                      onChange={(e) => setContractData({...contractData, vat_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Service Fee</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={contractData.service_fee_per_ticket}
                      onChange={(e) => setContractData({...contractData, service_fee_per_ticket: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleStepComplete('contract')} size="lg">
                Next: Create Offers
                <Package className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'offers':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Create Offers</h2>
              <p className="text-muted-foreground mt-2">
                Product × Contract × Channel combinations
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Channel Selection</CardTitle>
                <CardDescription>Choose which channels to create offers for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {['web', 'b2b', 'internal', 'box_office', 'reseller'].map(channel => (
                    <div key={channel} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={channel}
                        checked={selectedChannels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChannels([...selectedChannels, channel])
                          } else {
                            setSelectedChannels(selectedChannels.filter(c => c !== channel))
                          }
                        }}
                      />
                      <label htmlFor={channel} className="text-sm font-medium">
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Offers</CardTitle>
                <CardDescription>Offers will be created for each product × channel combination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.categories.map(category => 
                    selectedChannels.map(channel => (
                      <div key={`${category.id}-${channel}`} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{category.category_name} × {channel}</span>
                        <Badge variant="outline">Auto-generated</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleStepComplete('offers')} size="lg">
                Next: Upload Rates
                <Upload className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'rates':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Upload Rates CSV</h2>
              <p className="text-muted-foreground mt-2">
                Upload your rate bands spreadsheet
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rates CSV Upload</CardTitle>
                <CardDescription>Upload your rate bands spreadsheet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleRatesFileUpload}
                    className="hidden"
                    id="rates-upload"
                  />
                  <label htmlFor="rates-upload" className="cursor-pointer">
                    <Button variant="outline">Choose CSV File</Button>
                  </label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Expected format: Category, Adult, Child, Senior
                  </p>
                </div>

                {ratesData.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Parsed Rates:</h4>
                    <div className="space-y-1">
                      {ratesData.map((rate, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <span>{rate.category}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">Adult: {rate.adult}</Badge>
                            <Badge variant="outline">Child: {rate.child}</Badge>
                            <Badge variant="outline">Senior: {rate.senior}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleStepComplete('rates')} size="lg">
                Next: Set Allocations
                <Calculator className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'allocations':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calculator className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Set Allocations</h2>
              <p className="text-muted-foreground mt-2">
                Configure capacity for each category
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category Allocations</CardTitle>
                <CardDescription>Set capacity for each ticket category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{category.category_name}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Capacity"
                        className="w-24"
                        onChange={(e) => {
                          const capacity = parseInt(e.target.value) || 0
                          setAllocations(prev => {
                            const existing = prev.find(a => a.category_id === category.id)
                            if (existing) {
                              return prev.map(a => a.category_id === category.id ? {...a, quantity: capacity} : a)
                            } else {
                              return [...prev, {
                                category_id: category.id,
                                category_name: category.category_name,
                                quantity: capacity,
                                allocation_pool_id: `${item.name.toLowerCase().replace(/\s+/g, '-')}-pool`
                              }]
                            }
                          })
                        }}
                      />
                      <span className="text-sm text-muted-foreground">tickets</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleStepComplete('allocations')} size="lg">
                Next: Pricing Simulator
                <Eye className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'simulator':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Eye className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Pricing Simulator</h2>
              <p className="text-muted-foreground mt-2">
                Spot-check your pricing before going live
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Price Preview</CardTitle>
                <CardDescription>Review pricing across channels and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.categories.map(category => {
                    const rate = ratesData.find(r => r.category === category.category_name)
                    if (!rate) return null
                    
                    return (
                      <div key={category.id} className="border rounded p-4">
                        <h4 className="font-medium mb-2">{category.category_name}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Base Rates</Label>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Adult:</span>
                                <span>{contractData.currency} {rate.adult}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Child:</span>
                                <span>{contractData.currency} {rate.child}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Senior:</span>
                                <span>{contractData.currency} {rate.senior}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Final Prices (with fees)</Label>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Adult:</span>
                                <span>{contractData.currency} {(rate.adult * 1.05 + 2.50).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Child:</span>
                                <span>{contractData.currency} {(rate.child * 1.05 + 2.50).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Senior:</span>
                                <span>{contractData.currency} {(rate.senior * 1.05 + 2.50).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => handleStepComplete('simulator')} size="lg">
                Next: Publish
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'publish':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Send className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Ready to Publish</h2>
              <p className="text-muted-foreground mt-2">
                Review everything before going live
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contract</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Commission:</span>
                    <span>{contractData.supplier_commission_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT:</span>
                    <span>{contractData.vat_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee:</span>
                    <span>{contractData.currency} {contractData.service_fee_per_ticket}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Offers</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex justify-between">
                    <span>Total Offers:</span>
                    <span>{item.categories.length * selectedChannels.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Rates</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex justify-between">
                    <span>Rate Categories:</span>
                    <span>{ratesData.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Allocations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex justify-between">
                    <span>Total Capacity:</span>
                    <span>{allocations.reduce((sum, a) => sum + a.quantity, 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('simulator')}>
                Back to Simulator
              </Button>
              <Button onClick={handlePublish} size="lg">
                <Send className="h-4 w-4 mr-2" />
                Publish Event
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
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = completedSteps.includes(step.id as WorkflowStep)
          const isCurrent = currentStep === step.id
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                isCurrent 
                  ? 'bg-blue-100 text-blue-700' 
                  : isCompleted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-2" />
              )}
            </div>
          )
        })}
      </div>

      <Separator />

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}
