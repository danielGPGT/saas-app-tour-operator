/**
 * PROFIT REPORTING & ANALYTICS COMPONENT
 * Shows profit margins, revenue, and cost analysis
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Building2 } from 'lucide-react'
import type { 
  UnifiedRate, 
  UnifiedOffer, 
  UnifiedContract, 
  Allocation 
} from '@/types/unified-inventory'

interface ProfitReportingProps {
  rates: UnifiedRate[]
  offers: UnifiedOffer[]
  contracts: UnifiedContract[]
  allocations: Allocation[]
  bookings?: Array<{
    rate_id: number
    selling_price: number
    currency: string
    units: number
    booking_date: string
  }>
}

interface ProfitMetrics {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  averageOrderValue: number
  topPerformingOffers: Array<{
    offer: UnifiedOffer
    revenue: number
    profit: number
    margin: number
  }>
  costBreakdown: {
    byContract: Array<{
      contract: UnifiedContract
      cost: number
      percentage: number
    }>
    byChannel: Array<{
      channel: string
      cost: number
      percentage: number
    }>
  }
}

export function ProfitReporting({ 
  rates, 
  offers, 
  contracts, 
  allocations,
  bookings = [] 
}: ProfitReportingProps) {
  
  const metrics = useMemo((): ProfitMetrics => {
    let totalRevenue = 0
    let totalCost = 0
    let totalUnits = 0

    // Calculate revenue and costs from bookings
    bookings.forEach(booking => {
      const rate = rates.find(r => r.id === booking.rate_id)
      if (rate) {
        totalRevenue += booking.selling_price * booking.units
        totalUnits += booking.units

        // Calculate cost from contract
        const contract = contracts.find(c => c.id === rate.contract_id)
        if (contract && contract.cost_per_unit) {
          totalCost += contract.cost_per_unit * booking.units
        }
      }
    })

    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const averageOrderValue = bookings.length > 0 ? totalRevenue / bookings.length : 0

    // Top performing offers
    const offerPerformance = new Map<number, { revenue: number; profit: number; units: number }>()
    
    bookings.forEach(booking => {
      const rate = rates.find(r => r.id === booking.rate_id)
      if (rate) {
        const offer = offers.find(o => o.id === rate.offer_id)
        if (offer) {
          const current = offerPerformance.get(offer.id) || { revenue: 0, profit: 0, units: 0 }
          const contract = contracts.find(c => c.id === rate.contract_id)
          const cost = contract?.cost_per_unit || 0
          
          offerPerformance.set(offer.id, {
            revenue: current.revenue + (booking.selling_price * booking.units),
            profit: current.profit + ((booking.selling_price - cost) * booking.units),
            units: current.units + booking.units
          })
        }
      }
    })

    const topPerformingOffers = Array.from(offerPerformance.entries())
      .map(([offerId, data]) => {
        const offer = offers.find(o => o.id === offerId)
        return offer ? {
          offer,
          revenue: data.revenue,
          profit: data.profit,
          margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
        } : null
      })
      .filter(Boolean)
      .sort((a, b) => b!.profit - a!.profit)
      .slice(0, 5)

    // Cost breakdown by contract
    const contractCosts = new Map<number, number>()
    bookings.forEach(booking => {
      const rate = rates.find(r => r.id === booking.rate_id)
      if (rate) {
        const contract = contracts.find(c => c.id === rate.contract_id)
        if (contract && contract.cost_per_unit) {
          const current = contractCosts.get(contract.id) || 0
          contractCosts.set(contract.id, current + (contract.cost_per_unit * booking.units))
        }
      }
    })

    const costByContract = Array.from(contractCosts.entries())
      .map(([contractId, cost]) => {
        const contract = contracts.find(c => c.id === contractId)
        return contract ? {
          contract,
          cost,
          percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0
        } : null
      })
      .filter(Boolean)
      .sort((a, b) => b!.cost - a!.cost)

    // Cost breakdown by channel
    const channelCosts = new Map<string, number>()
    bookings.forEach(booking => {
      const rate = rates.find(r => r.id === booking.rate_id)
      if (rate) {
        const offer = offers.find(o => o.id === rate.offer_id)
        if (offer) {
          const contract = contracts.find(c => c.id === rate.contract_id)
          if (contract && contract.cost_per_unit) {
            const current = channelCosts.get(offer.channel) || 0
            channelCosts.set(offer.channel, current + (contract.cost_per_unit * booking.units))
          }
        }
      }
    })

    const costByChannel = Array.from(channelCosts.entries())
      .map(([channel, cost]) => ({
        channel,
        cost,
        percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost)

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      averageOrderValue,
      topPerformingOffers: topPerformingOffers as any,
      costBreakdown: {
        byContract: costByContract as any,
        byChannel: costByChannel
      }
    }
  }, [rates, offers, contracts, bookings])

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {bookings.length} bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Supplier costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net profit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.profitMargin.toFixed(1)}%
            </div>
            <Progress value={metrics.profitMargin} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Offers</CardTitle>
          <CardDescription>
            Offers ranked by total profit generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topPerformingOffers.map((item, index) => (
              <div key={item.offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{item.offer.offer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.offer.contractName} • {item.offer.channel.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(item.profit)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.margin.toFixed(1)}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Contract</CardTitle>
            <CardDescription>
              Supplier cost breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.costBreakdown.byContract.map((item, index) => (
                <div key={item.contract.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.contract.contract_name}</span>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(item.cost)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.percentage} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-12">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost by Channel</CardTitle>
            <CardDescription>
              Cost distribution across sales channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.costBreakdown.byChannel.map((item, index) => (
                <div key={item.channel} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={item.channel === 'web' ? 'default' : item.channel === 'b2b' ? 'secondary' : 'outline'}>
                        {item.channel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(item.cost)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.percentage} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-12">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Summary</CardTitle>
          <CardDescription>
            Overall business performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.averageOrderValue)}
              </div>
              <div className="text-sm text-muted-foreground">Average Order Value</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {metrics.totalUnits}
              </div>
              <div className="text-sm text-muted-foreground">Total Units Sold</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {bookings.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
