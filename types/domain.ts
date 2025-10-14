export type InventoryType = 'accommodation'|'event_ticket'|'transfer'|'lounge';
export type Channel = 'b2c'|'b2b';
export type TourStatus = 'draft'|'published'|'active'|'completed'|'cancelled';

export interface Supplier {
  id: string; 
  name: string;
  type: 'hotel'|'wholesaler'|'venue'|'transfer'|'lounge'|'other';
  default_currency: string; 
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: InventoryType;
  location?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  resource_id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Contract {
  id: string;
  supplier_id: string;
  resource_id: string;
  name?: string;
  
  // Basic contract info
  currency: string;
  tz?: string;
  valid_from: string;
  valid_to: string;
  active: boolean;
  
  // Fulfilment details
  fulfilment?: 'instant' | 'manual' | 'scheduled';
  sell_cutoff_hours?: number;
  sla_hours?: number;
  
  // Economics
  economics: {
    commission_pct: number;
    supplier_vat_pct: number;
    fees: Array<{
      name: string;
      amount?: number;
      mode: 'per_person_per_night' | 'per_room_per_night' | 'percent_of_rate';
      payable: 'us' | 'guest';
    }>;
  };
  
  // Plugin-specific defaults (hotel, transfer, ticket, etc.)
  plugin_defaults?: {
    // Hotel-specific
    board_types?: string[];
    check_in_time?: string;
    check_out_time?: string;
    min_stay?: number;
    max_stay?: number;
    max_occupancy?: number;
    additional_person_charge?: number;
    room_tax_rate?: number;
    resort_fee_daily?: number;
    resort_fee_taxable?: boolean;
    resort_fee_inclusions?: string;
    incidentals_handling?: 'company_pays' | 'guest_pays';
    
    // Transfer-specific
    pickup_lead_time?: number;
    vehicle_types?: string[];
    
    // Ticket-specific
    delivery_method?: string;
    validity_period?: number;
  };
  
  created_at?: string;
  updated_at?: string;
}

export interface RateBand {
  id: string;
  product_id: string;
  contract_id?: string; // Optional for buy-to-order items
  room_block_id?: string; // Link to room block
  band_start: string;
  band_end: string;
  
  // Rate type and fulfilment
  rate_type?: 'STANDARD' | 'BUY_TO_ORDER';
  fulfilment_type?: 'instant' | 'manual' | 'buy_to_order';
  status?: 'active' | 'requires_procurement' | 'pending_confirmation';
  
  // Basic rate info
  currency: string;
  weekday_mask: number; // Bitmask for available days (0-127)
  active: boolean;
  
  // Simple pricing structure
  base_rate: number; // Base price per unit
  pricing_unit: 'per_room' | 'per_person' | 'per_vehicle' | 'per_seat' | 'per_unit';
  additional_person_charge?: number; // For hotels: extra charge for 3rd/4th person
  max_occupancy?: number; // For hotels: max people per room
  
  // Enhanced date-specific pricing
  date_rates?: {
    [date: string]: {
      single_double: number; // Base rate for 1-2 persons
      additional_person?: number; // Charge for 3rd/4th person
      max_occupancy?: number; // Max persons per room
      rate_includes?: string; // What's included (breakfast, WiFi, etc.)
    };
  };
  
  
  // Risk buffer for buy-to-order items
  buffer_margin_percent?: number; // Additional margin to protect against cost variance
  
  // Markup configuration
  markup: {
    b2c_pct: number;
    b2b_pct: number;
  };
  
  // Tax and fee configuration
  tax_config?: {
    room_tax_rate?: number; // Room tax percentage
    resort_fee_daily?: number; // Daily resort fee
    resort_fee_taxable?: boolean; // Is resort fee taxable
    resort_fee_inclusions?: string; // What resort fee includes
  };
  
  created_at?: string;
  updated_at?: string;
}

export interface RoomBlock {
  id: string; // e.g., "TPGPGT5"
  contract_id: string;
  name: string;
  description?: string;
  
  // Room allocation details
  total_rooms: number;
  cutoff_date: number; // days before arrival when block expires
  
  // Status and dates
  status: 'tentative' | 'confirmed' | 'released' | 'cancelled';
  block_start: string;
  block_end: string;
  
  // Optional configuration
  min_nights?: number;
  max_nights?: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface Allocation {
  id: string;
  product_id: string;
  pool_id: string;
  room_block_id?: string; // Link to room block
  start_date: string;
  end_date: string;
  capacity: number;
  status?: 'active' | 'sold_out' | 'closed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Tour {
  id: string;
  name: string;
  code: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: TourStatus;
  active: boolean;
  max_capacity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PackageCategory {
  id: string;
  tour_id: string;
  name: string;
  description?: string;
  color_tag?: string;
  default_markup_b2c?: number;
  default_markup_b2b?: number;
  visibility_b2c: boolean;
  visibility_b2b: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PackageComponent {
  id: string;
  package_id: string;
  product_id: string;
  selection_type: 'required' | 'optional' | 'choice';
  price_override?: number;
  notes?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Package {
  id: string;
  tour_id: string;
  category_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  visibility_b2c: boolean;
  visibility_b2b: boolean;
  price_override?: number;
  components: PackageComponent[];
  created_at?: string;
  updated_at?: string;
}
