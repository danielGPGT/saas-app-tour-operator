/**
 * PRICING ENGINE
 * Core pricing calculation logic for multi-channel pricing
 */

import type { 
  UnifiedRate, 
  UnifiedOffer, 
  UnifiedContract, 
  UnifiedPricingPolicy,
  Allocation 
} from '@/types/unified-inventory'

export interface PricingRequest {
  offer_id: number
  rate_id: number
  quantity: number
  channel: 'web' | 'b2b' | 'internal'
}

export interface PricingResponse {
  gross_rate: number
  breakdown: {
    base_net: number
    contract_economics: {
      commission_rate: number
      supplier_vat: number
      additional_fees: number
    }
    markup_policy: {
      strategy: string
      value: number
      applied_markup: number
    }
  }
  availability: {
    allocated: number
    available: number
    can_book: boolean
  }
  currency: string
}

export function createPricingEngine(
  rates: UnifiedRate[],
  offers: UnifiedOffer[],
  contracts: UnifiedContract[],
  pricingPolicies: UnifiedPricingPolicy[],
  allocations: Allocation[]
) {
  return {
    computePrice(request: PricingRequest): PricingResponse {
      // Find the rate
      const rate = rates.find(r => r.id === request.rate_id)
      if (!rate) {
        throw new Error(`Rate ${request.rate_id} not found`)
      }

      // Find the offer
      const offer = offers.find(o => o.id === request.offer_id)
      if (!offer) {
        throw new Error(`Offer ${request.offer_id} not found`)
      }

      // Find the contract
      const contract = contracts.find(c => c.id === offer.contract_id)
      if (!contract) {
        throw new Error(`Contract ${offer.contract_id} not found`)
      }

      // Get base NET rate
      const baseNet = rate.base_rate || 0

      // Calculate contract economics
      const contractEconomics = {
        commission_rate: 0, // No commission in our sample data
        supplier_vat: 0,    // No VAT in our sample data
        additional_fees: 0  // No additional fees
      }

      // Find applicable pricing policy
      const applicablePolicy = findApplicablePricingPolicy(
        pricingPolicies,
        request.channel,
        request.offer_id
      )

      // Calculate markup
      let appliedMarkup = 0
      if (applicablePolicy) {
        switch (applicablePolicy.strategy) {
          case 'markup_pct':
            appliedMarkup = baseNet * (applicablePolicy.value / 100)
            break
          case 'gross_fixed':
            appliedMarkup = applicablePolicy.value - baseNet
            break
          case 'agent_commission':
            // For agent commission, we show the commission as markup
            appliedMarkup = baseNet * (applicablePolicy.value / 100)
            break
          default:
            appliedMarkup = 0
        }
      }

      // Calculate final gross rate
      const grossRate = baseNet + appliedMarkup

      // Check availability
      const availability = checkAvailability(rate, allocations, request.quantity)

      return {
        gross_rate: grossRate,
        breakdown: {
          base_net: baseNet,
          contract_economics: contractEconomics,
          markup_policy: {
            strategy: applicablePolicy?.strategy || 'none',
            value: applicablePolicy?.value || 0,
            applied_markup: appliedMarkup
          }
        },
        availability,
        currency: rate.currency || 'GBP'
      }
    }
  }
}

function findApplicablePricingPolicy(
  policies: UnifiedPricingPolicy[],
  channel: string,
  offerId: number
): UnifiedPricingPolicy | null {
  // Sort by specificity: offer-specific > channel-specific > global
  const sortedPolicies = policies
    .filter(p => p.active)
    .sort((a, b) => {
      const aSpecificity = getPolicySpecificity(a)
      const bSpecificity = getPolicySpecificity(b)
      return bSpecificity - aSpecificity // Higher specificity first
    })

  // Find the most specific applicable policy
  for (const policy of sortedPolicies) {
    if (policy.scope.offer_id === offerId) {
      return policy // Offer-specific policy
    }
    
    if (policy.scope.channel === channel && !policy.scope.offer_id) {
      return policy // Channel-specific policy
    }
    
    if (!policy.scope.channel && !policy.scope.offer_id) {
      return policy // Global policy
    }
  }

  return null
}

function getPolicySpecificity(policy: UnifiedPricingPolicy): number {
  let specificity = 0
  
  if (policy.scope.offer_id) specificity += 3 // Offer-specific is most specific
  if (policy.scope.channel) specificity += 2 // Channel-specific is second
  if (policy.scope.tour_id) specificity += 1 // Tour-specific is third
  
  return specificity
}

function checkAvailability(
  rate: UnifiedRate,
  allocations: Allocation[],
  requestedQuantity: number
): { allocated: number; available: number; can_book: boolean } {
  // Find allocations for this rate's allocation pool
  const relevantAllocations = allocations.filter(
    a => a.allocation_pool_id === rate.allocation_pool_id
  )

  // Calculate total allocated quantity
  const totalAllocated = relevantAllocations.reduce(
    (sum, allocation) => sum + (allocation.quantity || 0),
    0
  )

  // For this demo, assume no bookings yet, so all allocated is available
  const available = totalAllocated
  const canBook = available >= requestedQuantity

  return {
    allocated: totalAllocated,
    available,
    can_book: canBook
  }
}