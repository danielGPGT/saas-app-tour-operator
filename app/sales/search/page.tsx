'use client'

import { useState } from 'react'
import { Search, Calendar, Users, DollarSign, Clock, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchForm } from '@/components/sales/search-form'
import { SearchResults } from '@/components/sales/search-results'
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'
import { useAllocations } from '@/hooks/use-allocations'
import { useRateBands } from '@/hooks/use-rate-bands'
import { useContracts } from '@/hooks/use-contracts'
import { priceStay } from '@/lib/pricing'

export default function SalesSearchPage() {
  const [searchParams, setSearchParams] = useState({
    productId: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: [] as number[],
    channel: 'b2c' as 'b2c' | 'b2b'
  })
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const { data: products } = useProducts()
  const { data: resources } = useResources()
  const { data: allocations } = useAllocations()
  const { data: rateBands } = useRateBands()
  const { data: contracts } = useContracts()

  const handleSearch = async (params: any) => {
    setIsSearching(true)
    setHasSearched(true)
    
    // Update searchParams state with the actual search values
    setSearchParams(params)
    
    try {
      // Simulate search processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Find matching data using the domain-based system
      const product = products?.find(p => p.id === params.productId)
      const resource = resources?.find(r => r.id === product?.resource_id)
      
      // Find the best matching rate band for the search dates
      const availableRateBands = rateBands?.filter(rb => 
        rb.product_id === params.productId && 
        rb.active &&
        new Date(rb.band_start) <= new Date(params.endDate) && // Band starts before search ends
        new Date(rb.band_end) >= new Date(params.startDate)   // Band ends after search starts
      )
      
      const rateBand = availableRateBands?.[0] // Take the first matching band
      const contract = contracts?.find(c => c.id === rateBand?.contract_id)
      
      // Find allocations for this product (overlap logic)
      const allocation = allocations?.find(a => {
        if (a.product_id !== params.productId) return false
        const allocationStart = new Date(a.start_date)
        const allocationEnd = new Date(a.end_date)
        const searchStart = new Date(params.startDate)
        const searchEnd = new Date(params.endDate)
        
        // Check if dates overlap (more flexible)
        return allocationStart <= searchEnd && allocationEnd >= searchStart
      })

      // Debug logging
      console.log('Search debug:', {
        searchParams: params,
        product: product?.name,
        resource: resource?.name,
        rateBand: rateBand ? {
          id: rateBand.id,
          band_start: rateBand.band_start,
          band_end: rateBand.band_end,
          prices: rateBand.pricing_meta.prices,
          markup: rateBand.markup
        } : null,
        contract: contract ? {
          id: contract.id,
          commission_pct: contract.economics.commission_pct,
          supplier_vat_pct: contract.economics.supplier_vat_pct
        } : null,
        allocation: allocation ? {
          id: allocation.id,
          capacity: allocation.capacity,
          start_date: allocation.start_date,
          end_date: allocation.end_date
        } : null
      })

      // Show available data for debugging
      console.log('Available data:', {
        products: products?.map(p => ({ id: p.id, name: p.name })),
        rateBands: rateBands?.map(rb => ({ 
          id: rb.id, 
          product_id: rb.product_id, 
          band_start: rb.band_start, 
          band_end: rb.band_end, 
          active: rb.active 
        })),
        allocations: allocations?.map(a => ({ 
          id: a.id, 
          product_id: a.product_id, 
          start_date: a.start_date, 
          end_date: a.end_date, 
          capacity: a.capacity 
        })),
        contracts: contracts?.map(c => ({ id: c.id, supplier_id: c.supplier_id, resource_id: c.resource_id }))
      })

      // More detailed debugging
      console.log('Rate band matching details:')
      console.log('- Available rate bands for product:', availableRateBands)
      console.log('- Selected rate band:', rateBand)
      console.log('- Contracts available:', contracts)
      console.log('- Selected contract:', contract)

      // Only proceed if we have the product
      if (!product) {
        console.log('Product not found:', params.productId)
        setSearchResults([])
        return
      }

      // Check what data we have
      console.log('Data availability check:', {
        hasProduct: !!product,
        hasResource: !!resource,
        hasRateBand: !!rateBand,
        hasContract: !!contract,
        hasAllocation: !!allocation
      })

      // If we don't have all the required data, show a helpful message
      if (!rateBand || !contract || !allocation) {
        console.log('Missing pricing/allocation data for product:', product.name)
        console.log('This product needs:')
        if (!rateBand) console.log('- A rate band with dates covering your search dates')
        if (!contract) console.log('- A contract linked to the rate band')
        if (!allocation) console.log('- An allocation with dates covering your search dates')
        
        setSearchResults([])
        return
      }

      // Generate date array for pricing (exclude check-out date)
      const dates = []
      const startDate = new Date(params.startDate)
      const endDate = new Date(params.endDate)
      for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }

      // Calculate real pricing using the pricing engine
      console.log('Pricing calculation input:', {
        band: rateBand,
        contract: contract,
        channel: params.channel,
        dates: dates,
        pax: { adults: params.adults, children: params.children }
      })
      
      const pricingResult = priceStay({
        band: rateBand,
        contract: contract,
        channel: params.channel,
        dates: dates,
        pax: { adults: params.adults, children: params.children }
      })
      
      console.log('Pricing result:', pricingResult)

      const results = [
        {
          id: `result_${Date.now()}`,
          product,
          resource,
          rateBand,
          contract,
          allocation,
          pricing: pricingResult,
          availability: {
            capacity: allocation.capacity,
            available: allocation.capacity,
            max_bookable: allocation.capacity
          }
        }
      ]
      
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const getProductName = (productId: string) => {
    return products?.find(p => p.id === productId)?.name || productId
  }


  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return '🏨'
      case 'event_ticket': return '🎫'
      case 'transfer': return '🚗'
      case 'lounge': return '🛋️'
      default: return '📦'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Search Inventory</h1>
        <p className="text-muted-foreground">
          Find available products and get real-time pricing
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchForm
            onSearch={handleSearch}
            isLoading={isSearching}
            products={products || []}
            resources={resources || []}
          />
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                  <p className="text-sm mb-4">
                    No available inventory found for your search criteria. This could be because:
                  </p>
                  <ul className="text-sm text-left max-w-md mx-auto space-y-1">
                    <li>• No rate bands exist for this product covering your dates</li>
                    <li>• No allocations exist for this product covering your dates</li>
                    <li>• No contracts are linked to the rate bands</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4">
                    Check the browser console for detailed debugging information.
                  </p>
                </div>
              </div>
            )}
            <SearchResults
              results={searchResults}
              isLoading={isSearching}
              searchParams={searchParams}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allocations?.filter(a => !a.stop_sell && a.capacity > 0).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Bands</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateBands?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
