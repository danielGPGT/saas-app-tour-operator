/**
 * SAMPLE DATA FOR OFFER FLOW TESTING
 * Creates realistic test data to demonstrate the multi-channel pricing system
 */

import type { 
  InventoryItem, 
  UnifiedContract, 
  UnifiedOffer, 
  UnifiedRate, 
  UnifiedPricingPolicy,
  Allocation 
} from '@/types/unified-inventory'

export const sampleInventoryItems: Omit<InventoryItem, 'id' | 'created_at'>[] = [
  {
    name: "The London Grand Hotel",
    item_type: "hotel",
    location: "London, UK",
    description: "Luxury 5-star hotel in central London",
    categories: [
      { id: "std-dbl", category_name: "Standard Double", capacity: 2, features: ["En-suite", "WiFi", "Breakfast"] },
      { id: "deluxe-dbl", category_name: "Deluxe Double", capacity: 2, features: ["En-suite", "WiFi", "Breakfast", "City View"] },
      { id: "suite", category_name: "Junior Suite", capacity: 2, features: ["En-suite", "WiFi", "Breakfast", "City View", "Separate Living"] }
    ],
    active: true
  },
  {
    name: "Edinburgh Castle Tickets",
    item_type: "ticket",
    location: "Edinburgh, UK",
    description: "Historic castle admission tickets",
    categories: [
      { id: "adult", category_name: "Adult", capacity: 1, features: ["Audio Guide"] },
      { id: "child", category_name: "Child (5-15)", capacity: 1, features: ["Audio Guide"] },
      { id: "senior", category_name: "Senior (65+)", capacity: 1, features: ["Audio Guide"] }
    ],
    active: true
  }
]

export const sampleContracts: Omit<UnifiedContract, 'id' | 'itemName' | 'supplierName' | 'item_type' | 'tourNames' | 'created_at'>[] = [
  // London Hotel Contract
  {
    supplier_id: 1,
    item_id: 1, // London Grand Hotel
    contract_name: "London Grand - Standard Rate Contract",
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    currency: "GBP",
    cost_per_unit: 80.00,    // £80 per room per night
    cost_currency: "GBP",
    cost_type: "fixed",
    pricing_strategy: "per_occupancy",
    dynamic_charges: [],
    active: true
  },
  {
    supplier_id: 1,
    item_id: 1,
    contract_name: "London Grand - Deluxe Rate Contract", 
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    currency: "GBP",
    cost_per_unit: 120.00,   // £120 per room per night
    cost_currency: "GBP", 
    cost_type: "fixed",
    pricing_strategy: "per_occupancy",
    dynamic_charges: [],
    active: true
  },
  // Edinburgh Castle Contract
  {
    supplier_id: 2,
    item_id: 2, // Edinburgh Castle
    contract_name: "Edinburgh Castle - Group Rate Contract",
    valid_from: "2024-01-01", 
    valid_to: "2024-12-31",
    currency: "GBP",
    cost_per_unit: 8.50,     // £8.50 per ticket
    cost_currency: "GBP",
    cost_type: "fixed", 
    pricing_strategy: "per_unit",
    dynamic_charges: [],
    active: true
  }
]

export const sampleOffers: Omit<UnifiedOffer, 'id' | 'itemName' | 'contractName' | 'categoryName' | 'item_type' | 'created_at'>[] = [
  // Web Channel Offers (Direct Customers)
  {
    item_id: 1,
    contract_id: 1, // Standard rate contract
    category_id: "std-dbl",
    offer_name: "London Grand - Standard Double (Web Direct)",
    channel: "web",
    currency: "GBP",
    rules: {
      min_stay: 2,
      max_stay: 14,
      visibility: true
    },
    active: true
  },
  {
    item_id: 1,
    contract_id: 2, // Deluxe rate contract
    category_id: "deluxe-dbl", 
    offer_name: "London Grand - Deluxe Double (Web Direct)",
    channel: "web",
    currency: "GBP",
    rules: {
      min_stay: 2,
      max_stay: 14,
      visibility: true
    },
    active: true
  },
  // B2B Channel Offers (Travel Agents)
  {
    item_id: 1,
    contract_id: 1,
    category_id: "std-dbl",
    offer_name: "London Grand - Standard Double (B2B Agents)",
    channel: "b2b",
    currency: "GBP", 
    rules: {
      min_stay: 1,        // Agents can book single nights
      max_stay: 30,       // Longer stays allowed
      visibility: true
    },
    active: true
  },
  {
    item_id: 1,
    contract_id: 2,
    category_id: "deluxe-dbl",
    offer_name: "London Grand - Deluxe Double (B2B Agents)", 
    channel: "b2b",
    currency: "GBP",
    rules: {
      min_stay: 1,
      max_stay: 30,
      visibility: true
    },
    active: true
  },
  // Edinburgh Castle Offers
  {
    item_id: 2,
    contract_id: 3,
    category_id: "adult",
    offer_name: "Edinburgh Castle - Adult (Web Direct)",
    channel: "web",
    currency: "GBP",
    rules: {
      visibility: true
    },
    active: true
  },
  {
    item_id: 2,
    contract_id: 3,
    category_id: "adult", 
    offer_name: "Edinburgh Castle - Adult (B2B Agents)",
    channel: "b2b",
    currency: "GBP",
    rules: {
      visibility: true
    },
    active: true
  }
]

export const sampleRates: Omit<UnifiedRate, 'id' | 'selling_price' | 'itemName' | 'categoryName' | 'contractName' | 'item_type' | 'tourName' | 'created_at'>[] = [
  // London Hotel - Web Rates (Higher margins for direct customers)
  {
    offer_id: 1, // Web Standard Double
    contract_id: 1,
    item_id: 1,
    category_id: "std-dbl",
    inventory_type: "contract",
    base_rate: 120.00,    // NET customer price
    currency: "GBP",
    valid_from: "2024-01-01",
    valid_to: "2024-03-31", // Winter rates
    days_of_week: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
    active: true,
    allocation_pool_id: "london-grand-std-winter"
  },
  {
    offer_id: 1,
    contract_id: 1, 
    item_id: 1,
    category_id: "std-dbl",
    inventory_type: "contract",
    base_rate: 180.00,    // Higher summer rates
    currency: "GBP",
    valid_from: "2024-04-01",
    valid_to: "2024-09-30", // Summer rates
    days_of_week: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
    active: true,
    allocation_pool_id: "london-grand-std-summer"
  },
  // London Hotel - B2B Rates (Lower margins for agents)
  {
    offer_id: 3, // B2B Standard Double
    contract_id: 1,
    item_id: 1,
    category_id: "std-dbl", 
    inventory_type: "contract",
    base_rate: 100.00,    // Lower NET price for agents
    currency: "GBP",
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    days_of_week: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
    active: true,
    allocation_pool_id: "london-grand-std-agent"
  },
  // Edinburgh Castle Rates
  {
    offer_id: 5, // Web Adult
    contract_id: 3,
    item_id: 2,
    category_id: "adult",
    inventory_type: "contract", 
    base_rate: 15.00,     // NET customer price
    currency: "GBP",
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    days_of_week: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
    active: true,
    allocation_pool_id: "edinburgh-castle-adult"
  },
  {
    offer_id: 6, // B2B Adult
    contract_id: 3,
    item_id: 2,
    category_id: "adult",
    inventory_type: "contract",
    base_rate: 12.00,     // Lower NET price for agents
    currency: "GBP", 
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    days_of_week: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
    active: true,
    allocation_pool_id: "edinburgh-castle-adult"
  }
]

export const samplePricingPolicies: Omit<UnifiedPricingPolicy, 'id' | 'created_at'>[] = [
  // Web Channel Policies (Higher margins)
  {
    policy_name: "Web Direct - Standard Markup",
    description: "Standard markup for direct web bookings",
    scope: {
      channel: "web"
    },
    strategy: "markup_pct",
    value: 50,             // 50% markup
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    active: true
  },
  // B2B Channel Policies (Agent commissions)
  {
    policy_name: "B2B Agents - Commission Rate", 
    description: "Commission structure for travel agents",
    scope: {
      channel: "b2b"
    },
    strategy: "agent_commission",
    value: 20,             // 20% commission for agents
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    active: true
  },
  // Special offer-specific policy
  {
    policy_name: "Edinburgh Castle - Premium Markup",
    description: "Higher markup for castle tickets",
    scope: {
      channel: "web",
      offer_id: 5          // Specific to Edinburgh Web offer
    },
    strategy: "markup_pct", 
    value: 100,            // 100% markup (double the NET rate)
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    active: true
  }
]

export const sampleAllocations: Omit<Allocation, 'id' | 'itemName' | 'supplierName' | 'contractName' | 'tourNames' | 'created_at'>[] = [
  // London Hotel Allocations
  {
    item_id: 1,
    contract_id: 1,
    supplier_id: 1,
    category_ids: ["std-dbl"],
    quantity: 50,          // 50 Standard Double rooms allocated
    allocation_pool_id: "london-grand-std-winter",
    label: "Winter Standard Double Block",
    description: "Standard double rooms for winter season",
    valid_from: "2024-01-01",
    valid_to: "2024-03-31",
    active: true
  },
  {
    item_id: 1,
    contract_id: 1,
    supplier_id: 1,
    category_ids: ["std-dbl"],
    quantity: 75,          // 75 rooms for summer
    allocation_pool_id: "london-grand-std-summer", 
    label: "Summer Standard Double Block",
    description: "Standard double rooms for summer season",
    valid_from: "2024-04-01",
    valid_to: "2024-09-30",
    active: true
  },
  {
    item_id: 1,
    contract_id: 1,
    supplier_id: 1,
    category_ids: ["std-dbl"],
    quantity: 25,          // 25 rooms for agents
    allocation_pool_id: "london-grand-std-agent",
    label: "Agent Standard Double Block", 
    description: "Standard double rooms allocated for B2B agents",
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    active: true
  },
  // Edinburgh Castle Allocations
  {
    item_id: 2,
    contract_id: 3,
    supplier_id: 2,
    category_ids: ["adult"],
    quantity: 1000,        // 1000 adult tickets
    allocation_pool_id: "edinburgh-castle-adult",
    label: "Adult Castle Tickets",
    description: "Adult admission tickets for Edinburgh Castle",
    valid_from: "2024-01-01", 
    valid_to: "2024-12-31",
    active: true
  }
]
