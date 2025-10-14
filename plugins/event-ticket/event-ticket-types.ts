// Event Ticket Plugin Types
// Specialized types for event ticket management

export type EventType = 'sports' | 'concert' | 'theater' | 'festival' | 'conference' | 'attraction' | 'other'

export type TicketCategory = 'grandstand' | 'general_admission' | 'vip' | 'hospitality' | 'standing' | 'seated'

export type AgeBand = 'adult' | 'child' | 'senior' | 'student' | 'infant'

export type Channel = 'web' | 'b2b' | 'internal' | 'box_office' | 'reseller'

export interface EventTicketContract {
  // Event details
  event_name: string
  venue_name: string
  event_dates: string[]  // Specific event dates
  timezone: string
  
  // Contract terms
  supplier_commission_rate: number
  vat_rate: number
  service_fee_per_ticket: number
  cancellation_policy: {
    free_cancellation_days: number
    cancellation_fee_percentage: number
  }
  
  // Payment terms
  payment_schedule: Array<{
    due_date: string
    percentage: number
    amount?: number
  }>
  
  // Ticket-specific terms
  ticket_terms: {
    transferable: boolean
    refundable: boolean
    name_change_fee: number
    resale_allowed: boolean
  }
}

export interface EventTicketRate {
  // Rate identification
  rate_name: string
  category_id: string
  event_date: string  // Specific event date
  
  // Pricing
  base_rate: number
  currency: string
  
  // Rate bands (different prices for different segments)
  rate_bands: Array<{
    age_band: AgeBand
    price: number
    availability: number
  }>
  
  // Package rules
  package_rules?: {
    min_tickets: number
    max_tickets: number
    group_discount_percentage?: number
    early_bird_discount?: {
      valid_until: string
      discount_percentage: number
    }
  }
  
  // Channel-specific pricing
  channel_pricing: Record<Channel, number>
  
  // Validity
  valid_from: string
  valid_to: string
  days_of_week: Record<string, boolean>
  active: boolean
}

export interface EventTicketAllocation {
  // Allocation details
  category_id: string
  event_date: string
  total_capacity: number
  available_capacity: number
  reserved_capacity: number
  
  // Shared pools
  allocation_pool_id?: string
  shared_with_categories: string[]
  
  // Time-based allocation
  allocation_windows: Array<{
    start_time: string
    end_time: string
    capacity: number
  }>
  
  // Status
  status: 'active' | 'sold_out' | 'suspended' | 'cancelled'
  last_updated: string
}

export interface EventTicketOffer {
  // Offer identification
  offer_id: string
  product_id: string  // Category ID
  contract_id: number
  channel: Channel
  
  // Offer details
  offer_name: string
  description: string
  
  // Pricing
  base_price: number
  channel_markup: number
  final_price: number
  
  // Availability
  total_availability: number
  remaining_availability: number
  
  // Validity
  valid_from: string
  valid_to: string
  event_date: string
  
  // Status
  active: boolean
  created_at: string
  updated_at: string
}
