/**
 * PROFIT CALCULATION HELPERS
 * Utilities for calculating profits using contract costs
 */

import type { UnifiedContract, UnifiedRate, Allocation, AllocationPoolCapacity } from '@/types/unified-inventory'

export interface ProfitCalculation {
  total_cost: number
  total_revenue: number
  total_profit: number
  profit_margin_percentage: number
  cost_per_booking: number
  revenue_per_booking: number
  profit_per_booking: number
}

export interface PoolProfitSummary {
  pool_id: string
  item_name: string
  total_capacity: number
  current_bookings: number
  available_spots: number
  utilization_percentage: number
  
  // Cost analysis
  total_cost: number
  cost_per_unit: number
  cost_currency: string
  
  // Revenue analysis (estimated based on rates)
  estimated_revenue: number
  estimated_profit: number
  estimated_profit_margin: number
  
  // Supplier breakdown
  supplier_breakdown: Array<{
    supplier_id: number
    supplier_name: string
    contract_id?: number
    contract_name?: string
    quantity: number
    cost_per_unit: number
    total_cost: number
    cost_currency: string
  }>
}

/**
 * Calculate profit for a specific pool
 */
export function calculatePoolProfit(
  poolId: string,
  allocations: Allocation[],
  contracts: UnifiedContract[],
  rates: UnifiedRate[],
  poolCapacity: AllocationPoolCapacity[]
): PoolProfitSummary | null {
  const pool = poolCapacity.find(p => p.pool_id === poolId)
  if (!pool) return null

  const poolAllocations = allocations.filter(a => a.allocation_pool_id === poolId)
  const poolRates = rates.filter(r => r.allocation_pool_id === poolId)

  // Calculate supplier breakdown
  const supplierBreakdown = poolAllocations.map(allocation => {
    const contract = contracts.find(c => c.id === allocation.contract_id)
    const supplier = contracts.find(c => c.supplier_id === allocation.supplier_id)
    
    return {
      supplier_id: allocation.supplier_id,
      supplier_name: allocation.supplierName || 'Unknown Supplier',
      contract_id: allocation.contract_id,
      contract_name: contract?.contract_name || 'No Contract',
      quantity: allocation.quantity,
      cost_per_unit: contract?.cost_per_unit || 0,
      total_cost: allocation.quantity * (contract?.cost_per_unit || 0),
      cost_currency: contract?.cost_currency || 'GBP'
    }
  })

  // Calculate total cost
  const totalCost = supplierBreakdown.reduce((sum, supplier) => sum + supplier.total_cost, 0)
  const costPerUnit = pool.total_capacity > 0 ? totalCost / pool.total_capacity : 0

  // Estimate revenue based on average rate
  const averageRate = poolRates.length > 0 
    ? poolRates.reduce((sum, rate) => sum + rate.selling_price, 0) / poolRates.length
    : 0
  
  const estimatedRevenue = pool.current_bookings * averageRate
  const estimatedProfit = estimatedRevenue - (pool.current_bookings * costPerUnit)
  const estimatedProfitMargin = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0

  return {
    pool_id: poolId,
    item_name: pool.item_name,
    total_capacity: pool.total_capacity,
    current_bookings: pool.current_bookings,
    available_spots: pool.available_spots,
    utilization_percentage: pool.total_capacity > 0 ? (pool.current_bookings / pool.total_capacity) * 100 : 0,
    
    total_cost: totalCost,
    cost_per_unit: costPerUnit,
    cost_currency: supplierBreakdown[0]?.cost_currency || 'GBP',
    
    estimated_revenue: estimatedRevenue,
    estimated_profit: estimatedProfit,
    estimated_profit_margin: estimatedProfitMargin,
    
    supplier_breakdown: supplierBreakdown
  }
}

/**
 * Calculate profit for a specific booking
 */
export function calculateBookingProfit(
  rate: UnifiedRate,
  allocation: Allocation,
  contract: UnifiedContract | undefined
): ProfitCalculation {
  const costPerUnit = contract?.cost_per_unit || 0
  const sellingPrice = rate.selling_price || 0
  
  const profit = sellingPrice - costPerUnit
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0

  return {
    total_cost: costPerUnit,
    total_revenue: sellingPrice,
    total_profit: profit,
    profit_margin_percentage: profitMargin,
    cost_per_booking: costPerUnit,
    revenue_per_booking: sellingPrice,
    profit_per_booking: profit
  }
}

/**
 * Get the best supplier for a pool (cheapest cost)
 */
export function getBestSupplierForPool(
  poolId: string,
  allocations: Allocation[],
  contracts: UnifiedContract[]
): { supplier_id: number; cost_per_unit: number; contract_id?: number } | null {
  const poolAllocations = allocations.filter(a => a.allocation_pool_id === poolId)
  
  if (poolAllocations.length === 0) return null

  let bestSupplier = null
  let lowestCost = Infinity

  poolAllocations.forEach(allocation => {
    const contract = contracts.find(c => c.id === allocation.contract_id)
    const costPerUnit = contract?.cost_per_unit || Infinity
    
    if (costPerUnit < lowestCost) {
      lowestCost = costPerUnit
      bestSupplier = {
        supplier_id: allocation.supplier_id,
        cost_per_unit: costPerUnit,
        contract_id: allocation.contract_id
      }
    }
  })

  return bestSupplier
}

/**
 * Calculate total profit across all pools for an item
 */
export function calculateItemProfit(
  itemId: number,
  allocations: Allocation[],
  contracts: UnifiedContract[],
  rates: UnifiedRate[],
  poolCapacity: AllocationPoolCapacity[]
): PoolProfitSummary[] {
  const itemPools = poolCapacity.filter(p => p.item_id === itemId)
  
  return itemPools
    .map(pool => calculatePoolProfit(pool.pool_id, allocations, contracts, rates, poolCapacity))
    .filter(Boolean) as PoolProfitSummary[]
}
