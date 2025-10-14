/**
 * DATA INITIALIZER COMPONENT
 * Populates the system with sample data for testing the multi-channel pricing flow
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2, Database, Building2, Ticket, Globe, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useData } from '@/contexts/data-context'
import { 
  sampleInventoryItems, 
  sampleContracts, 
  sampleOffers, 
  sampleRates, 
  samplePricingPolicies, 
  sampleAllocations 
} from '@/lib/sample-data'

export function DataInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initializedItems, setInitializedItems] = useState<string[]>([])
  
  const {
    inventoryItems,
    unifiedContracts,
    unifiedOffers,
    unifiedRates,
    unifiedPricingPolicies,
    allocations,
    addInventoryItem,
    addUnifiedContract,
    addUnifiedOffer,
    addUnifiedRate,
    addUnifiedPricingPolicy,
    addAllocation
  } = useData()

  const handleInitializeData = async () => {
    setIsInitializing(true)
    setInitializedItems([])
    
    try {
      // Step 1: Create Inventory Items
      setInitializedItems(prev => [...prev, 'Creating inventory items...'])
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (const item of sampleInventoryItems) {
        addInventoryItem(item)
      }
      setInitializedItems(prev => [...prev, '✅ Inventory items created'])

      // Step 2: Create Contracts
      setInitializedItems(prev => [...prev, 'Creating supplier contracts...'])
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (const contract of sampleContracts) {
        addUnifiedContract(contract)
      }
      setInitializedItems(prev => [...prev, '✅ Supplier contracts created'])

      // Step 3: Create Offers
      setInitializedItems(prev => [...prev, 'Creating channel offers...'])
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (const offer of sampleOffers) {
        addUnifiedOffer(offer)
      }
      setInitializedItems(prev => [...prev, '✅ Channel offers created'])

      // Step 4: Create Rate Bands
      setInitializedItems(prev => [...prev, 'Creating rate bands...'])
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (const rate of sampleRates) {
        addUnifiedRate(rate)
      }
      setInitializedItems(prev => [...prev, '✅ Rate bands created'])

      // Step 5: Create Pricing Policies
      setInitializedItems(prev => [...prev, 'Creating pricing policies...'])
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (const policy of samplePricingPolicies) {
        addUnifiedPricingPolicy(policy)
      }
      setInitializedItems(prev => [...prev, '✅ Pricing policies created'])

      // Step 6: Create Allocations
      setInitializedItems(prev => [...prev, 'Creating inventory allocations...'])
      await new Promise(resolve => setTimeout(resolve, 500))
      
      for (const allocation of sampleAllocations) {
        addAllocation(allocation)
      }
      setInitializedItems(prev => [...prev, '✅ Inventory allocations created'])

      setInitializedItems(prev => [...prev, '🎉 Multi-channel pricing system ready!'])
      
      toast.success('Sample data loaded successfully! Your multi-channel pricing system is ready.')
      
    } catch (error) {
      toast.error('Error initializing data: ' + error)
    } finally {
      setIsInitializing(false)
    }
  }

  const hasData = inventoryItems.length > 0 || unifiedContracts.length > 0

  if (hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Your multi-channel pricing system is populated and ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Items: {inventoryItems.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Contracts: {unifiedContracts.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Offers: {unifiedOffers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span>Rates: {unifiedRates.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Initialize Sample Data
        </CardTitle>
        <CardDescription>
          Load realistic sample data to test the multi-channel pricing system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium">What will be created:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span>2 Inventory Items</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span>3 Supplier Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span>6 Channel Offers</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-orange-500" />
              <span>5 Rate Bands</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Multi-Channel Setup:</h4>
          <div className="flex gap-2">
            <Badge variant="default">Web Direct</Badge>
            <Badge variant="secondary">B2B Agents</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Includes London Grand Hotel and Edinburgh Castle with different pricing for web vs B2B channels
          </p>
        </div>

        <Button 
          onClick={handleInitializeData}
          disabled={isInitializing}
          className="w-full"
        >
          {isInitializing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Load Sample Data
            </>
          )}
        </Button>

        {initializedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Progress:</h4>
            <div className="space-y-1">
              {initializedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {item.startsWith('✅') || item.startsWith('🎉') ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  )}
                  <span className={item.startsWith('✅') || item.startsWith('🎉') ? 'text-green-700' : ''}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
